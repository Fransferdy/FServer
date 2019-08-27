#pragma once

#include "includes.h"

void printAndWait(std::string what)
{
	std::cout << what << std::endl;
	system("pause");
};

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

typedef char* (__cdecl *ExecutePageProc)(char * bufferizedRequest,char* url,int length);

class FApplicationDefinition
{
public:
	std::string appName;
	std::string defaultIndexName;
	std::map<std::string, boolean > pages;
	std::map<std::string, std::pair<bool, std::string> > replaceRules;
	ExecutePageProc executePage;
	void *dllHandle;

	FApplicationDefinition(std::string appNameArg, ExecutePageProc executePageArg,void *dllHandleArg)
	{
		appName = appNameArg;
		executePage = executePageArg;
		dllHandle = dllHandleArg;
	}
	~FApplicationDefinition()
	{
		FreeLibrary((HINSTANCE)dllHandle);
	}

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

	void readFromBuffer(CBuffer *buffer)
	{
		auto size = buffer->readint();
		for ( size_t i = 0; i< size; i++)
		{
			pages.insert(std::pair<std::string, boolean>(buffer->readstring(),true) );
		}

		size = buffer->readint();
		bool ruleState = false;
		for ( size_t i = 0; i< size; i++)
		{
			replaceRules.insert(std::pair<std::string, std::pair<bool, std::string> >(buffer->readstring(), std::pair<bool, std::string>(buffer->readdouble,buffer->readstring()) ) );
		}
		defaultIndexName = buffer->readstring();
	}

	void printMe()
	{
		std::cout << "App Name/Path: " << appName << std::endl;
		std::cout << "Default HomePage: " << defaultIndexName <<std::endl;

		std::cout << "Pages Amount: " << pages.size() << std::endl;
		for ( auto it = pages.begin(); it != pages.end(); it++ )
		{
			std::cout << "Page: " << it->first << std::endl;
		}
		std::cout << "Replace Rules Amount: " << replaceRules.size() << std::endl;
		for ( auto it = replaceRules.begin(); it != replaceRules.end(); it++ )
		{
			std::cout << "Find For: " << it->first << " - Replace With: " << it->second.second << " Active? "<< it->second.first <<  std::endl;
		}
	}

};

class FServer
{
private:
	std::map<std::string,FApplicationDefinition*> applications;

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
	std::string rootPath;
	virtual void completed(void *cls, struct MHD_Connection *connection,void **con_cls, enum MHD_RequestTerminationCode toe)
	{
		FRequest *session = (FRequest*)*con_cls;
 
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
		FRequest *session;
		char * myOut;
		if (*con_cls==NULL)
		{
			session = new FRequest();
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

		session = (FRequest*)*con_cls;

		std::string stdurl = url;
		//stdurl = applyReplaceRule(stdurl);

		if (log)
		{
			std::cout << url << std::endl;
			std::cout << "After Replace Rules: " << stdurl << std::endl;
		}
		std::string selectAppName;
		std::string requestedPath;

		selectAppName = stdurl.substr(1);
		size_t barPos = selectAppName.find("/");
		if (barPos!=std::string::npos)
		{
			requestedPath = selectAppName.substr(barPos,std::string::npos);
			selectAppName = "/" + selectAppName.substr(0,barPos);
		}
		else
		{
			selectAppName = "/" + selectAppName;
			requestedPath = "";
		}
		if (log)
			std::cout << "AppName " << selectAppName << " Request Path: " <<  requestedPath << std::endl;
		
		FApplicationDefinition* selectedApp = NULL;
		bool appNotFound;
		try{
			selectedApp = applications.at(selectAppName);
			if (requestedPath.compare("")==0)
				requestedPath = selectedApp->defaultIndexName;
		}catch(std::out_of_range e)
		{
			if (log)
				std::cout << "Base Path - App Not Found" << std::endl;
			appNotFound = true;
		}
		if (appNotFound)
		{
			
		}

		try
		{
			bool pageExist = selectedApp->pages.at(requestedPath);
			session->method = method;
			CBuffer buffer;
			buffer.clear();
			session->writeToBuffer(&buffer);
			char * filledRequest = selectedApp->executePage(buffer.data,(char*)requestedPath.c_str(),buffer.BuffSize);
			int *filledRequestSize = (int*)filledRequest;

			FRequest *newSession = new FRequest();
			buffer.clear();
			buffer.addBuffer(filledRequest,*filledRequestSize);
			buffer.readint();
			newSession->readFromBuffer(&buffer);
			newSession->pp = session->pp;
			//delete session;
			session = newSession;

			std::cout << session->response;

			myOut = (char*)malloc(session->response.length()+1);
			if (myOut == NULL)
			{
				response = MHD_create_response_from_buffer(strlen(PINTERNAL_ERROR),
					(void *)PINTERNAL_ERROR,
					MHD_RESPMEM_PERSISTENT);

				ret = MHD_queue_response(connection, MHD_HTTP_INTERNAL_SERVER_ERROR, response);
				MHD_destroy_response(response);
			}
			strcpy(myOut, session->response.c_str());
			
			response = MHD_create_response_from_buffer(strlen(myOut),
				(void *)myOut,
				MHD_RESPMEM_MUST_FREE);

			std::map<std::string, std::string> *responseHeaders = session->getResponseHeaders();
			//add response headers
			for ( auto it = responseHeaders->begin(); it != responseHeaders->end(); it++ )
			{
				MHD_add_response_header(response, it->first.c_str(), it->second.c_str());
			}
			
			auto newcookiesmap = session->getNewCookiesMap();
			std::string endCookie;
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
			delete session;
		}
		catch (std::out_of_range e)
		{
			//std::cout << "Looking for file " << url << std::endl;
			
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

	void setLog(bool state)
	{
		log = state;
	}

	void addReplaceApplication(std::string appName,FApplicationDefinition * newApp)
	{
		FApplicationDefinition *oldApp;
		try{
			oldApp = applications.at(appName);
			delete oldApp;
			applications.erase(appName);
		}catch(std::out_of_range e)
		{
		}
		applications.insert(std::pair<std::string,FApplicationDefinition*>(appName,newApp));
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