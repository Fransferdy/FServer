#pragma once

#include "stdafx.h"
#include "md5.h"



class ContactJSON : public FPage
{
	virtual void doPost()
	{
		json::JSON obj;
		std::string param1, param2, param3, param4;
		DatabaseCore db;

		obj["status"] = "";
		obj["message"] = "";

		param1 = pageGetP("name");
		param2 = pageGetP("email");
		param3 = pageGetP("subject");
		param4 = pageGetP("body");

		std::cout << param1 << std::endl << param2 << std::endl << param3 << std::endl << param4 << std::endl;

		if (param1.compare("NaN") == 0 || param2.compare("NaN") == 0 || param3.compare("NaN") == 0 || param4.compare("NaN") == 0)
		{
			obj["status"] = "error";
			obj["message"] = "Invalid Parameters";
			//error json		
			setOut(obj.dump());
			return;
		}

		sendMail(globalProps.readString("adm_email"), "Pokemon Regions Contact", "Name: " + param1 + "<br> E-Mail: " + param2 + "<br> Subject: " + param3 + "<br> Message: <br>" + param4);


		obj["status"] = "ok";
		obj["message"] = "";

		setOut(obj.dump());
		return;
	}
};