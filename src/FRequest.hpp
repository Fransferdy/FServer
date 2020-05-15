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
	struct MHD_PostProcessor *pp;
	std::map <std::string, std::string> parameters;
	std::map <std::string, std::string> cookies;
	std::map <std::string, FCookie> newcookies;
	std::map <std::string, std::string> requestHeaders;
	std::map <std::string, std::string> responseHeaders;

	std::map <std::string, std::string> *getRequestHeaders()
	{return &requestHeaders;};
	std::map <std::string, std::string> *getResponseHeaders()
	{return &responseHeaders;};
		std::map <std::string, FCookie> * getNewCookiesMap()
	{return &newcookies;}

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
