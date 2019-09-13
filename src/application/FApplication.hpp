#pragma once

#include <iostream>
#include <string>
#include <map>
#include <functional>
#include <algorithm>
#include "FPage.hpp"
#include "HomePage.h"

#define FHTTP_GET "GET"
#define FHTTP_POST "POST"
#define FHTTP_PATCH "PATCH"
#define FHTTP_PUT "PUT"
#define FHTTP_DELETE "DELETE"
#define FHTTP_HEAD "HEAD"
#define FHTTP_OPTIONS "OPTIONS"

#define MAX_MINIMUN_SIZE_T 65535

class Fapplication
{
private:
	std::map<std::string, std::function<FPage*()> > pages;
	std::map<std::string, std::pair<bool, std::string> > replaceRules;
	std::map<int,char*> pageResults;
	std::string defaultIndexName;
	int pageResultId=0;

	void printAndWait(std::string what)
	{
		std::cout << what << std::endl;
		system("pause");
	};

	int generatePageResultId()
	{
		pageResultId++;
		if (pageResultId>MAX_MINIMUN_SIZE_T)
			pageResultId=0;
		return pageResultId;
	}


public:	
	int addPageResult(CBuffer* buffer)
	{
		int handle = generatePageResultId();

		char * retData = (char*)malloc(buffer->BuffSize);
    	memcpy(retData,buffer->data,buffer->BuffSize);

		pageResults.insert(std::pair<int,char*>(handle,retData));
		std::cout << "Page Result Added to Pool" << std::endl;
		return handle;
	}
	void deleteResultPage(int handle)
	{
		char * deleteBuffer = NULL;
		try{
			deleteBuffer = pageResults.at(handle);
			free(deleteBuffer);
			pageResults.erase(handle);
			std::cout << "Page Result Erased" << std::endl;
		}catch(std::out_of_range e)
		{
			std::cout << "Error: Trying to DELETE a Page Result that does not exist" << std::endl;
		}
	}
	char* getResultPage(int handle)
	{
		char * retBuffer = NULL;
		try{
			retBuffer = pageResults.at(handle);
			std::cout << "Page Result Retrieved" << std::endl;
		}catch(std::out_of_range e)
		{
			std::cout << "Error: Trying to GET a Page Result that was not created" << std::endl;
		}
		return retBuffer;
	}


	virtual void answer(FRequest *request, const char *url)
	{
		FPage *answerPage = pages.at(url)();
		answerPage->setUpPage(request);
		try
		{
			if (request->method.compare(FHTTP_GET) == 0)
				answerPage->doGet();
			else
				if (request->method.compare(FHTTP_POST) == 0)
					answerPage->doPost();
				else
					if (request->method.compare(FHTTP_PUT) == 0)
						answerPage->doPut();
					else
						if (request->method.compare(FHTTP_PATCH) == 0)
							answerPage->doPatch();
						else
							if (request->method.compare(FHTTP_DELETE) == 0)
								answerPage->doDelete();
							else
								if (request->method.compare(FHTTP_HEAD) == 0)
									answerPage->doHead();
								else
									if (request->method.compare(FHTTP_OPTIONS) == 0)
										answerPage->doOptions();
		} catch (std::exception e)
		{
			answerPage->setOut("POTATO ERR");
		}
		delete answerPage;
	}

	/*
		Example addPages( { "/home", [](){return new HomePage(); } } )
	*/

	size_t getPagesAmount()
	{
		return pages.size();
	}

    /*Adds a regex replace rule for urls*/
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

	void addPage(std::pair<std::string, std::function<FPage*()>> page)
	{
		pages.insert(page);
	}

	virtual void start()
	{
		defaultIndexName = "/index";
		addPage( { "/index", [](){return new HomePage(); } } );
    }

	void writeToBuffer(CBuffer *buffer)
	{
		buffer->writeint(pages.size());
		for ( auto it = pages.begin(); it != pages.end(); it++ )
		{
			buffer->writestring((char*)it->first.c_str());
		}
		buffer->writeint(replaceRules.size());
		for ( auto it = replaceRules.begin(); it != replaceRules.end(); it++ )
		{
			buffer->writestring((char*)it->first.c_str());
			buffer->writebyte(it->second.first);
			buffer->writestring((char*)it->second.second.c_str());
			
		}
		buffer->writestring((char*)defaultIndexName.c_str());
	}

};

class FApplicationDefinition
{
public:


	std::map<std::string, boolean > pages;
	std::map<std::string, std::pair<bool, std::string> > replaceRules;
	
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
	}

};