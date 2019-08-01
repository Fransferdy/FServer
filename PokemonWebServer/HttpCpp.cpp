// HttpCpp.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"

#include "GlobalConfig.h"
#include <thread>
#include <mutex>
#include <fstream>

#include "md5.h"

#include <mysql.h>

#include "json.hpp"
#include "DatabaseCore.h"

#include "HomePage.h"
#include "ErrorReport.h"
#include "NewsJSON.h"
#include "LoginJSON.h"
#include "AccountJSON.h"
#include "Contact.h"
#include "ForgotPassword.h"
#include "AdminLoginJSON.h"
#include "LauncherNews.h"

std::mutex fileLock;
std::thread *updateChangeThread;
FServer server;

void updateChangeWorker()
{
	std::ifstream inFile;
	std::string in;
	std::string stateNames[2];
	stateNames[0] = "/gupdate";
	stateNames[1] = "/gupdat2";
	bool state = false;
	std::cout << "Update Rule Thread is Live " << std::endl;
	while (true)
	{
		std::this_thread::sleep_for(std::chrono::seconds(30));
		fileLock.lock();
		inFile.open("routeState.rst");
		if (inFile.is_open())
		{
			std::getline(inFile,in);
			try
			{
				state = std::stoi(in);
				server.changeReplaceRuleState("/gupdate", state);
				std::cout << "\nThread - Update Rule Changed to " << stateNames[state] << std::endl;
			}
			catch (std::invalid_argument e)
			{
				std::cout << e.what() << std::endl;
			}
			inFile.close();
		}
		fileLock.unlock();
	}
}


std::string ExePath()
{

	char buffer[MAX_PATH];
	GetModuleFileNameA(NULL, buffer, MAX_PATH);
	std::string::size_type pos = std::string(buffer).find_last_of("\\/");
	return std::string(buffer).substr(0, pos);
}



int main()
{
	globalProps.loadContainerFromFile();

	mysql_library_init(0, nullptr, nullptr);
	std::ofstream outFile;

	//DatabaseCore db;
	//db.createForumAccount("Frow","fernando60794@gmail.com","barbosa");

	server.addPages({ "/home", [](){return new HomePage(); }});
	server.addPages({ "/gamecrash", [](){return new ErrorReportPage(); } });
	server.addPages({ "/news", [](){return new NewsJSON(); } });
	server.addPages({ "/login", [](){return new LoginJSON(); } });
	server.addPages({ "/contact", [](){return new ContactJSON(); } });
	server.addPages({ "/account", [](){return new AccountJSON(); } });
	server.addPages({ "/forgotpassword", [](){return new ForgotPasswordJSON(); } });
	server.addPages({ "/admlogin", [](){return new AdminLoginJSON(); } });
	server.addPages({ "/launchernews", [](){return new LauncherNewsPage(); } });
	server.addReplaceRule("/gupdate","/gupdat2",false);
	server.setLog(false);
	server.start(8888, ExePath()+"\\web\\");
	std::cout << "Server is Live " << std::endl;

	updateChangeThread = new std::thread(updateChangeWorker);
	 
	bool alterState = true;
	std::string stateNames[2];
	stateNames[0] = "/gupdate";
	stateNames[1] = "/gupdat2";
	while (true)
	{
		system("pause");
		fileLock.lock();
		server.changeReplaceRuleState("/gupdate", alterState);
		std::cout << "Update Rule Changed to " << stateNames[alterState] << std::endl;
		outFile.open("routeState.rst");
		if (outFile.is_open())
		{
			std::cout << "Change Saved to Route File" << std::endl;
			outFile << (int)alterState << std::endl;
			outFile.close();
		}
		alterState = !alterState;
		fileLock.unlock();
	}
	
	return 0;
} 

 


/*
json::JSON obj;
// Create a new Array as a field of an Object.
obj["array"] = json::Array(true, "Two", 3, 4.0);
// Create a new Object as a field of another Object.
obj["obj"] = json::Object();
// Assign to one of the inner object's fields
obj["obj"]["inner"] = "Inside";

// We don't need to specify the type of the JSON object:
obj["new"]["some"]["deep"]["key"] = "Value";
obj["array2"].append(false, "three");
std::cout << obj << std::endl;
*/