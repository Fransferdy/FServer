#pragma once

#include "includes.h"


class HomePage : public FPage
{
	virtual void doPost()
	{
		doGet();
	}

	virtual void doGet()
	{
		
		setOut("{\"potato\":\"value\"}");
		addResponseHeader("Lucao","WoW");
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
		

		for ( auto it = getRequestHeaders()->begin(); it != getRequestHeaders()->end(); it++ )
		{
			out.append(it->first);
			out.append(":");
			out.append(it->second);
			out.append("<br>");
		}

		out.append("<!DOCTYPE html><html><body>");
		out.append(pageGetP("say"));
		out.append(pageGetP("to"));
		out.append("<br> " + pageGetC("username"));
		out.append("<br>Pass " + pageGetC("password"));
		pageExpireC("password");
		out.append("</body></html> ");
		out.append("\n");
		*/
	}
};