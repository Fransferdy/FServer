#include "json.hpp"
#include "includes.h"

#include "FServer.hpp"

#include "HomePage.h"

FServer server;
std::string ExePath()
{
	char buffer[MAX_PATH];
	GetModuleFileNameA(NULL, buffer, MAX_PATH);
	std::string::size_type pos = std::string(buffer).find_last_of("\\/");
	return std::string(buffer).substr(0, pos);
}



int main()
{
	std::map<std::string,HINSTANCE> modules;

	FilesManager fmag;
	fmag.populateFromDir(".\\apps\\");
	fmag.filesPrintAll();
	auto files = fmag.getFiles();
	std::string appsDir = fmag.getBaseDir();
	for(int i=0;i<files.size();i++)
	{
		if (files[i].name.find(".dll")!=std::string::npos)
		{
			std::cout << appsDir << files[i].path << files[i].name << std::endl;

			HINSTANCE temp = LoadLibraryA( (appsDir+files[i].path+files[i].name).c_str() );

			if (!temp) {
				// Couldn't load the library, continue on
				std::cerr << "Couldn't load library " << appsDir << files[i].path << files[i].name << std::endl;
				continue;
			}
			modules.insert(std::pair<std::string,HINSTANCE>(files[i].name,temp));


			typedef char* (__cdecl *ExecutePageProc)(char *,char*,int);
			typedef char* (__cdecl *GetAppProc)(void);

			// Load the functions. This may or may not work, based on
			// your compiler. If your compiler created a '.def' file
			// with your DLL, copy the function names from that to
			// these functions. Look up 'name mangling' if you want
			// to know why this happens.
			ExecutePageProc executePage = (ExecutePageProc)GetProcAddress(temp, "executepage");
			GetAppProc getApp = (GetAppProc)GetProcAddress(temp, "getApp");

			FApplicationDefinition app;
			CBuffer buffer;
			char *dataBuffer = getApp();
			int *dataSize = (int*)dataBuffer;
			std::cout << "Size "<< (*dataSize) << std::endl;

			buffer.addBuffer(dataBuffer,(*dataSize));
			buffer.readint();
			app.readFromBuffer(&buffer);
			std::cout << "Pages "<< app.pages.size() << std::endl;
			for (auto it = app.pages.begin(); it!=app.pages.end();it++)
			{
				std::cout << "Page: "<< it->first << std::endl;
			}
			
		}
	}
	system("pause");
	
	//server.addPages({ "/home", [](){return new HomePage();} });
	//server.addReplaceRule("/*/","/index.html",false);
	/*
	server.setLog(true);
	server.start(8888, ExePath()+"\\web\\");
	std::cout << "Server is Live " << std::endl;

	while (true)
	{
		Sleep(5);
	}
	*/
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