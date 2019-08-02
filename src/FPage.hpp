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
};

class FRequest
{
public:
	std::string method;
	struct MHD_PostProcessor *pp;
	std::map <std::string, std::string> parameters;
	std::map <std::string, std::string> cookies;
	std::map <std::string, FCookie> newcookies;
	std::map <std::string, std::string> requestHeaders;
	std::map <std::string, std::string> responseHeaders;
};

class FPage
{
protected:
	FRequest *request;

	
	/*
	Get a parameter from URI or POST
	@param = key
	*/
	std::string pageGetP(std::string param)
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

	bool pageParamExists(std::string param)
	{
		if (param.compare("NaN") != 0)
			return true;
		return false;
	}
	/*
	Get a cookie from request
	@param = key
	*/
	std::string pageGetC(std::string cookie)
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
	void pageSetC(std::string key, std::string value, std::string path = "")
	{
		FCookie f(value);
		auto element = request->newcookies.emplace(key, f);
		if (element.second == 0)
		{
			element.first->second = f;
		}
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
	void pageSetC(std::string key, std::string value, std::time_t time, std::string path = "")
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
	void pageExpireC(std::string key)
	{
		FCookie f("v", (std::time(nullptr) - 31536000));
		auto element = request->newcookies.emplace(key, f);
		if (element.second == 0)
		{
			element.first->second = f;
		}
	}



public:

	std::string out;

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
		out = arg;
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

};