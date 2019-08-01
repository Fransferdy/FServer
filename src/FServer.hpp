#pragma once

#include "includes.h"

static ssize_t file_reader(void *cls, uint64_t pos, char *buf, size_t max)
{
	FILE *file = (FILE*)cls;
	(void)fseek(file, pos, SEEK_SET);
	return fread(buf, 1, max, file);
}

static void free_callback(void *cls)
{
	FILE *file = (FILE*)cls;
	fclose(file);
}

static int parameters_iterator(void *cls, enum MHD_ValueKind kind, const char *key,const char *value)
{
	std::string myKey, myValue;
	myKey = key;
	myValue = value;
	std::map <std::string, std::string> *parameters = (std::map <std::string, std::string>*)cls;
	parameters->emplace(FUtils::urlDecode(myKey), FUtils::urlDecode(myValue));
	return MHD_YES;
}

static int post_iterator(void *cls,enum MHD_ValueKind kind,const char *key,const char *filename,const char *content_type,const char *transfer_encoding,const char *data, uint64_t off, size_t size)
{
	std::string myKey, myData;
	myKey = key;
	myData = data;
	std::map <std::string, std::string> *parameters = (std::map <std::string, std::string>*)cls;
	parameters->emplace(FUtils::urlDecode(myKey), FUtils::urlDecode(myData));
	return MHD_YES;
}


class FServer
{
private:
	struct MHD_Daemon *daemon;
	int status;
	int port;
	bool log;

	template<typename T>
	static int callBack(void *cls, struct MHD_Connection *connection, const char *url, const char *method, const char *version, const char *upload_data, size_t *upload_data_size, void **con_cls)
	{
		return static_cast<T *>(cls)->answer(cls, connection, url, method, version, upload_data, upload_data_size, con_cls);
	}

	static void completedCallBack(void *cls, struct MHD_Connection *connection,void **con_cls, enum MHD_RequestTerminationCode toe)	{
		return static_cast<FServer *>(cls)->completed(cls, connection, con_cls, toe);
	}

protected:
	std::map<std::string, std::function<FPage*()> > pages;
	std::map<std::string, std::pair<bool, std::string> > replaceRules;
	std::string rootPath;

	std::string applyReplaceRule(std::string url)
	{
		std::string retString = url;
		int pos;
		for (auto ent1 : replaceRules) 
		{
			if (!ent1.second.first)//rule deactvated
				continue;

			pos = url.find(ent1.first);
			if (pos != std::string::npos)//rule match
			{
				retString = retString.replace(pos, ent1.first.length(), ent1.second.second);
				return retString;
			}	
		}
		return retString;
	}

	virtual void completed(void *cls, struct MHD_Connection *connection,void **con_cls, enum MHD_RequestTerminationCode toe)
	{
		FSession *session = (FSession*)*con_cls;
 
		if (NULL == session)
			return;

		if (session->method.compare(MHD_HTTP_METHOD_POST)==0)
		{
			MHD_destroy_post_processor(session->pp);
		}

		delete session;
		*con_cls = NULL;
	}

	virtual int answer(void *cls, struct MHD_Connection *connection, const char *url, const char *method, const char *version, const char *upload_data, size_t *upload_data_size, void **con_cls)
	{
		int ret;
		struct MHD_Response *response;
		FSession *session;
		char * myOut;

		if (*con_cls==NULL)
		{
			session = new FSession();
			if (NULL == session)
				return MHD_NO;

			session->method = method;

			MHD_get_connection_values(connection, MHD_GET_ARGUMENT_KIND, &parameters_iterator,
				&session->parameters);

			MHD_get_connection_values(connection, MHD_COOKIE_KIND, &parameters_iterator,
				&session->cookies);

			MHD_get_connection_values(connection, MHD_HEADER_KIND, &parameters_iterator,
				&session->requestHeaders);
				
			if (0 == strcmp(method, "POST"))
			{
				session->pp = MHD_create_post_processor(connection, 1024,
					&post_iterator, &session->parameters);

				if (session->pp == NULL)
				{
					delete session;
					return MHD_NO;
				}
			}

			*con_cls = (void *)session;
			return MHD_YES;
		}

		session = (FSession*)*con_cls;

		try
		{
			if (log)
				std::cout << url << std::endl;
			FPage *answerPage = pages.at(url)();
			std::string endCookie;
			std::map <std::string, FCookie> *newcookiesmap;

			answerPage->setUpPage(connection, &session->parameters, &session->newcookies, &session->cookies,&session->requestHeaders);

			try
			{
				if (strcmp(method, MHD_HTTP_METHOD_GET) == 0)
					answerPage->doGet();
				else
					if (strcmp(method, MHD_HTTP_METHOD_POST) == 0)
					{
						MHD_post_process(session->pp,
							upload_data,
							*upload_data_size);

						if (0 != *upload_data_size)
						{
							*upload_data_size = 0;
							return MHD_YES;
						}
						answerPage->doPost();
					}
					else
						if (strcmp(method, MHD_HTTP_METHOD_PUT) == 0)
						{
							std::cout << "Doing Put" << std::endl;
							answerPage->doPut();
						}
						else
							if (strcmp(method, MHD_HTTP_METHOD_PATCH) == 0)
								answerPage->doPatch();
							else
								if (strcmp(method, MHD_HTTP_METHOD_DELETE) == 0)
									answerPage->doDelete();
			} catch (std::exception e)
			{
				answerPage->setOut(PINTERNAL_ERROR);
			}

			myOut = (char*)malloc(answerPage->out.length()+1);
			if (myOut == NULL)
			{
				response = MHD_create_response_from_buffer(strlen(PINTERNAL_ERROR),
					(void *)PINTERNAL_ERROR,
					MHD_RESPMEM_PERSISTENT);

				ret = MHD_queue_response(connection, MHD_HTTP_INTERNAL_SERVER_ERROR, response);
				MHD_destroy_response(response);
			}
			strcpy(myOut, answerPage->out.c_str());
			
			response = MHD_create_response_from_buffer(strlen(myOut),
				(void *)myOut,
				MHD_RESPMEM_MUST_FREE);

			MHD_add_response_header(response, "Content-Type", answerPage->getMime().c_str());

			newcookiesmap = answerPage->getNewCookiesMap();
			for (std::map<std::string, FCookie>::iterator it = newcookiesmap->begin(); it != newcookiesmap->end(); ++it)
			{
				endCookie = it->first + "=" + it->second.value;
				if (it->second.date.compare("") != 0)
					endCookie += "; expires=" + it->second.date;
				if (it->second.path.compare("")!=0)
					endCookie += "; path=" + it->second.path;
				if (MHD_NO == MHD_add_response_header(response,MHD_HTTP_HEADER_SET_COOKIE,endCookie.c_str()))
					std::cout << "error setting cookie" << std::endl;
			}
			
			delete answerPage;
		}
		catch (std::out_of_range e)
		{
			//std::cout << "Looking for file " << url << std::endl;
			std::string stdurl = url;
			stdurl = applyReplaceRule(stdurl);

			if (log)
				std::cout << "Modified URL" << stdurl << std::endl;

			if (stdurl.compare("/") == 0)
				stdurl = "/index.html";
			
			std::string path = (rootPath + stdurl).c_str();
			path = FUtils::absolutePath(path);

			if (log)
				std::cout << "File Path " << path << std::endl;

			std::size_t found = path.find(rootPath);
			if (found == std::string::npos) //Requested file is not below root tree
			{
				response = MHD_create_response_from_buffer(strlen(PFORBIDDEN),
					(void *)PFORBIDDEN,
					MHD_RESPMEM_PERSISTENT);

				ret = MHD_queue_response(connection, MHD_HTTP_FORBIDDEN, response);
				MHD_destroy_response(response);
				return ret;
			}

			FILE *file;
			file = fopen(path.c_str(), "rb");
			if (file != NULL)
			{
				response = MHD_create_response_from_callback(FUtils::filesize(path.c_str()), 32 * 1024,     /* 32k page size */
				&file_reader,
				file,
				&free_callback);

				if (response == NULL)
				{
					fclose(file);
					return MHD_NO;
				}
				MHD_add_response_header(response, "Cache-Control", "public, max-age=1800");
			}
			else
			{
				response = MHD_create_response_from_buffer(strlen(PNOT_FOUND),
					(void *)PNOT_FOUND,
					MHD_RESPMEM_PERSISTENT);
				ret = MHD_queue_response(connection, MHD_HTTP_NOT_FOUND, response);
				MHD_destroy_response(response);
				return ret;
			}
		}

		ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
		
		MHD_destroy_response(response);
		return ret;
	}

public:
	/*
		Example addPages( { "/home", [](){return new HomePage(); } } )
	*/

	void setLog(bool state)
	{
		log = state;
	}

	void addReplaceRule(std::string pathToReplace, std::string newPath, boolean state = false)
	{
		std::pair<std::string, std::pair<boolean, std::string>> rule;
		rule.first = pathToReplace;
		rule.second.first = state;
		rule.second.second = newPath;
		replaceRules.insert(rule);
		
	}  

	void changeReplaceRuleState(std::string pathToReplace, boolean state)
	{
		auto it = replaceRules.find(pathToReplace);
		if (it != replaceRules.end())
			it->second.first = state;	
	}

	void addPages(std::pair<std::string, std::function<FPage*()>> page)
	{
		pages.insert(page);
	}
	virtual int start(int portarg, std::string serverpath)
	{
		port = portarg;
		rootPath = serverpath;
		if (status == UNITIALIZED)
		{
			daemon = MHD_start_daemon(MHD_USE_THREAD_PER_CONNECTION, port, NULL, NULL,
				&callBack<FServer>, this, MHD_OPTION_NOTIFY_COMPLETED, &completedCallBack, this, MHD_OPTION_END);
			if (daemon == NULL)
			{ 
				status = STARTUP_ERROR;
				return -1;
			}
			status = RUNNING;
			return 1;
		}
		else
		{
			std::cout << "Server is already initialized;" << std::endl;
			return -2;
		}	
	};

	virtual int stopListeningToNewClients()
	{
		if (status == RUNNING)
		{
			status = NOTLISTENING;
			MHD_quiesce_daemon(daemon);
			return 1;
		}
		return -1;
	};

	virtual int returnActivities()
	{
		if (status == CLOSED || status == NOTLISTENING)
		{
			MHD_run(daemon);
			return 1;
		}
		return -1;
	}

	virtual int close()
	{
		if (status == RUNNING)
		{
			status = CLOSED;
			MHD_stop_daemon(daemon);
			return 1;
		}
		return -1;
	};
};