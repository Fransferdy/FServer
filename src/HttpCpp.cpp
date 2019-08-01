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
	std::string name ("/home");
	server.addPages({ name, [](){return new HomePage();} });
	server.addReplaceRule("/*/","/index.html",false);
	server.setLog(false);
	server.start(8888, ExePath()+"\\web\\");
	std::cout << "Server is Live " << std::endl;

	while (true)
	{
		system("pause");
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