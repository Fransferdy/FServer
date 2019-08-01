#pragma once

#include "stdafx.h"




class AdminLoginJSON : public FPage
{
	virtual void doPut()
	{
		json::JSON obj;
		std::string param1, param2;
		DatabaseCore db;

		obj["status"] = "";
		obj["message"] = "";

		param1 = pageGetP("pname");
		param2 = pageGetP("ppass");

		if (param1.compare("NaN") == 0 || param2.compare("NaN") == 0)
		{
			obj["status"] = "error";
			obj["message"] = "Invalid Parameters";
			//error json		
			setOut(obj.dump());
			return;
		}

		param2 = FUtils::getSaltedPassword(param2, param1);
		db.openDB(globalProps.readString("dbname"));
		SiteUser user = db.adminAuthenticateLogin(param1,param2);
		std::string token;


		if (user.name.compare("Guest") == 0)
		{
			obj["status"] = "error";
			obj["message"] = "Authentication Failed";
			//error json		
			setOut(obj.dump());
			db.closeDB();
			return;
		}
		token = db.updateUserCookieDB(user);
		db.closeDB();

		std::cout << param1 << std::endl;
		std::cout << param2 << std::endl;
		std::cout << token << std::endl;
		std::cout << user.email << std::endl;
		std::cout << user.name << std::endl;
		std::cout << user.permission << std::endl;

		obj["status"] = "ok";
		obj["message"] = "";
		obj["data"]["mail"] = param1;
		obj["data"]["token"] = token;

		setOut(obj.dump());
		return;
	}


};
