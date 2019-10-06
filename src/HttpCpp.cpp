#include "jsoncons/json.hpp"
#include "includes.h"

#include "FServer.hpp"
#include "SmartFileReader.hpp"

FServer server;
std::string ExePath()
{
	char buffer[MAX_PATH];
	GetModuleFileNameA(NULL, buffer, MAX_PATH);
	std::string::size_type pos = std::string(buffer).find_last_of("\\/");
	return std::string(buffer).substr(0, pos);
}

//imported function typedefs

typedef char* (__cdecl *GetAppProc)(void);

int main()
{

	SmartFileReader myReader(0.00008);
	myReader.setFileCacheGracePeriod(1);
	CachedFileData* cacheFile = myReader.getFile(".\\deployfiles\\fconfig.json");
	system("pause");
	cacheFile = myReader.getFile(".\\deployfiles\\fconfig.json");
	std::string fileData;
	fileData.insert(0,cacheFile->data,cacheFile->size);
	jsoncons::json config = jsoncons::json::parse(fileData);
	std::cout << config << std::endl;
	
	std::map<std::string,HINSTANCE> modules;

	FilesManager fmag;
	fmag.populateFromDir(".\\deployfiles\\runningapps\\");
	fmag.filesPrintAll();
	auto files = fmag.getFiles();
	std::string appsDir = fmag.getBaseDir();
	for(int i=0;i<files.size();i++)
	{
		std::size_t endPos = files[i].name.find(".dll");
		if (endPos!=std::string::npos)
		{
			std::string appName = "/"+files[i].name.substr(0,endPos);
			std::cout << "AppName " << appName <<std::endl;

			std::cout << appsDir << files[i].path << files[i].name << std::endl;

			HINSTANCE temp = LoadLibraryA( (appsDir+files[i].path+files[i].name).c_str() );

			if (!temp) {
				// Couldn't load the library, continue on
				std::cerr << "Couldn't load library " << appsDir << files[i].path << files[i].name << std::endl;
				continue;
			}
			modules.insert(std::pair<std::string,HINSTANCE>(files[i].name,temp));

			ExecutePageProc executePage = (ExecutePageProc)GetProcAddress(temp, "executepage");
			GetAppProc getApp = (GetAppProc)GetProcAddress(temp, "getApp");
			DeletePageProc deletePage = (DeletePageProc)GetProcAddress(temp, "deletePageResult");
			GetPageProc getPage = (GetPageProc)GetProcAddress(temp, "getPageResult");

			FApplicationDefinition *newApp = new FApplicationDefinition(appName,executePage,deletePage,getPage,(void*)temp);

			CBuffer buffer;
			char *dataBuffer = getApp();
			int *dataSize = (int*)dataBuffer;
			buffer.addBuffer(dataBuffer,(*dataSize));
			buffer.readint();
			newApp->readFromBuffer(&buffer);

			newApp->printMe();
			server.addReplaceApplication(appName,newApp);
		}
	}


	server.setLog(false);
	server.start(8888, ExePath()+"\\web\\");
	std::cout << "Server is Live " << std::endl;

	while (true)
	{
		Sleep(5);
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