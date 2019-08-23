#pragma once

#include "includes.h"


class FCookie
{
public:
	std::string value;
	std::string date;
	std::string path;
	std::time_t time;

	FCookie(std::string valuearg, std::string patharg = "")
	{
		char mbstr[150];
		std::time_t time = std::time(nullptr);
		time += 31536000; //+ one year in seconds expire date
		value = valuearg;
		std::strftime(mbstr, sizeof(mbstr), "%a, %d %b %Y %X GMT", std::gmtime(&time));
		date = mbstr;
		path = patharg;
	}

	FCookie(std::string valuearg, std::time_t timearg, std::string patharg = "")
	{
		char mbstr[200];
		time = timearg;
		value = valuearg;
		std::strftime(mbstr, sizeof(mbstr), "%a, %d %b %Y %X GMT", std::gmtime(&time));
		date = mbstr;
		//std::cout << "Cookie date " << date << std::endl;
		path = patharg;
	}

	void writeToBuffer(CBuffer *buffer)
	{
		buffer->writestring((char*)value.c_str());
		buffer->writestring((char*)date.c_str());
		buffer->writestring((char*)path.c_str());
		buffer->writedouble(time);
	}
	FCookie(CBuffer *buffer)
	{
		value = buffer->readstring();
		date = buffer->readstring();
		path = buffer->readstring();
		time = buffer->readdouble();
	}
};

void writeStringMapToBuffer(std::map <std::string, std::string> *source, CBuffer *buffer)
{
	buffer->writeint(source->size());
    for ( auto it = source->begin(); it != source->end(); it++ )
    {
		buffer->writestring((char*)it->first.c_str());
		buffer->writestring((char*)it->second.c_str());
    }
}
void readStringMapFromBuffer(std::map <std::string, std::string> *destination, CBuffer *buffer)
{
	int amount = buffer->readint();
	for(int i=0;i<amount;i++)
		destination->insert(std::pair<std::string,std::string>(buffer->readstring(),buffer->readstring()));
}

class FRequest
{
public:
	std::string method;
	std::string response;
	std::map <std::string, std::string> parameters;
	std::map <std::string, std::string> cookies;
	std::map <std::string, FCookie> newcookies;
	std::map <std::string, std::string> requestHeaders;
	std::map <std::string, std::string> responseHeaders;

	void writeToBuffer(CBuffer *buffer)
	{
		buffer->writestring((char*)method.c_str());
		buffer->writestring((char*)response.c_str());
		writeStringMapToBuffer(&parameters,buffer);
		writeStringMapToBuffer(&requestHeaders,buffer);
		writeStringMapToBuffer(&responseHeaders,buffer);
		writeStringMapToBuffer(&cookies,buffer);

		buffer->writeint(newcookies.size());
		for (std::map<std::string, FCookie>::iterator it = newcookies.begin(); it != newcookies.end(); ++it)
		{
			buffer->writestring((char*) it->first.c_str());
			it->second.writeToBuffer(buffer);
		}
	};

	void readFromBuffer(CBuffer *buffer)
	{
		method = buffer->readstring();
		response = buffer->readstring();
		readStringMapFromBuffer(&parameters,buffer);
		readStringMapFromBuffer(&requestHeaders,buffer);
		readStringMapFromBuffer(&responseHeaders,buffer);
		readStringMapFromBuffer(&cookies,buffer);
		
		int newCookiesSize = buffer->readint();
		for(int i=0;i<newCookiesSize;i++)
		{
			std::string cookieName = buffer->readstring();
			FCookie cookieVal(buffer);
			newcookies.insert(std::pair<std::string,FCookie>(cookieName,cookieVal) );
		}
	}
};

class FPage
{
protected:
	FRequest *request;
	/*
	Get a parameter from URI or POST
	@param = key
	*/
	std::string getParameter(std::string param)
	{
		try
		{
			return request->parameters.at(param);
		}
		catch (std::exception e)
		{
			return "NaN";
		}
		return "NaN";
	}

	bool paramExists(std::string param)
	{
		if (param.compare("NaN") != 0)
			return true;
		return false;
	}
	/*
	Get a cookie from request
	@param = key
	*/
	std::string getCookie(std::string cookie)
	{
		try
		{
			FCookie f = request->newcookies.at(cookie);
			if (std::difftime(f.time, std::time(nullptr))>0)
				return f.value;
			return "NaN";
		}
		catch (std::exception e)
		{
			try
			{
				return request->cookies.at(cookie);
			}
			catch (std::exception e)
			{
				return "NaN";
			}

			return "NaN";
		}
		return "NaN";
	}

	/*
	Set Cookie.
	Will expire in one year
	*/
	void setCookie(std::string key, std::string value, std::string path = "")
	{
		FCookie f(value);
		auto element = request->newcookies.emplace(key, f);
		if (element.second == 0)
			element.first->second = f;
		
	}

	/* Adds a header to the response, if overwrite is set to true it first deletes the header if it exits then adds the new value */
	void addResponseHeader(std::string headerName, std::string value, boolean overwrite=false)
	{
		if (overwrite)
			request->responseHeaders.erase(headerName);
		auto element = request->responseHeaders.emplace(headerName,value);
	}

	/*
	Set Cookie.
	*/
	void setCookie(std::string key, std::string value, std::time_t time, std::string path = "")
	{
		FCookie f(value, time, path);
		auto element = request->newcookies.emplace(key, f);
		if (element.second == 0)
		{
			element.first->second = f;
		}
	}

	/*
	Expire Cookie
	*/
	void deleteCookie(std::string key)
	{
		FCookie f("v", (std::time(nullptr) - 31536000));
		auto element = request->newcookies.emplace(key, f);
		if (element.second == 0)
		{
			element.first->second = f;
		}
	}



public:

	

	std::map <std::string, std::string> *getRequestHeaders()
	{return &(request->requestHeaders);};
	std::map <std::string, std::string> *getResponseHeaders()
	{return &(request->responseHeaders);};

	FPage()
	{
	}

	/*
	Get content Type
	default is: application/octet-stream
	*/
	std::string getMime()
	{
		auto mime = "";
		try{
		auto mime = request->responseHeaders.at("Content-Type");
		}catch(std::exception e)
		{
			std::cout<<"Tring to get mime, but it does not exist" << std::endl;
		}
		return mime;
	}

	/*
	Set content Type
	text/plain,
	application/json,
	etc
	*/
	void setMime(std::string arg)
	{
		addResponseHeader("Content-Type",arg,true);
	}

	void setOut(std::string arg)
	{
		request->response = arg;
	}

	std::map <std::string, FCookie> * getNewCookiesMap()
	{
		return &(request->newcookies);
	}
	/*
	For Internal Use Only
	*/
	void setUpPage(FRequest *requestarg)
	{
		request = requestarg;
	}



	virtual void doGet(){ };

	virtual void doPost(){ };

	virtual void doPut(){ };

	virtual void doPatch(){ };

	virtual void doDelete(){ };

	virtual void doHead(){ };

	virtual void doOptions(){ };

};