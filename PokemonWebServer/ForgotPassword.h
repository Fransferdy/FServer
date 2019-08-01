#pragma once

#include "stdafx.h"




class ForgotPasswordJSON : public FPage
{
	virtual void doPut()
	{
		json::JSON obj;
		std::string param5;
		DatabaseCore db;

		obj["status"] = "ha";
		obj["message"] = "";

		param5 = pageGetP("email");

		if (!(pageParamExists(param5)))
		{
			obj["status"] = "error";
			obj["message"] = "Please, Complete all mandatory fields.";
			//error json		
			setOut(obj.dump());
			return;
		}

		db.openDB("website.db");
		if (!db.gameUserEmailExists(param5))
		{
			obj["status"] = "bad";
			obj["message"] = "This e-mail is not in our system.";
			//error json		
			setOut(obj.dump());
			db.closeDB();
			return;
		}
		db.closeDB();

		std::string folderemail;
		Player pl;
		std::string saltedPass;
		std::string token;

		folderemail = FUtils::toFolderMail(param5);

		pl.clear();
		pl.name = folderemail; //email
		pl.loadFromContainer(folderemail);


		token = "";
		token += pl.pass.at(8);
		token += pl.pass.at(9);
		token += pl.pass.at(10);
		token += pl.pass.at(11);
		token += pl.pass.at(12);

		//send activation email
		sendMail(pl.email, "Pokemon Regions Password Recovery", "Hello, " + pl.firstName + "! \n\nYou will have to enter a new password at our website,\n click in the following link to set a new password: <a href=" + globalProps.readString("domain") + "passwordreset.html?email=" + pl.email + "&token=" + token + ">" + globalProps.readString("domain") + "passwordreset.html?email=" + pl.email + "&token=" + token + "</a> \n\n Best Regards \n Pokemon Regions Team");

		obj["status"] = "ok";
		obj["message"] = "";
		setOut(obj.dump());
		return;
	}

	virtual void doPatch()
	{
		json::JSON obj;
		std::string param1, param2, param3;
		DatabaseCore db;

		obj["status"] = "ha";
		obj["message"] = "";

		param1 = pageGetP("email");
		param2 = pageGetP("token");
		param3 = pageGetP("npass");

		if (!(pageParamExists(param1) && pageParamExists(param2) && pageParamExists(param3)))
		{
			obj["status"] = "error";
			obj["message"] = "Please, Complete all mandatory fields.";
			//error json		
			setOut(obj.dump());
			return;
		}

		db.openDB("website.db");
		if (!db.gameUserEmailExists(param1))
		{
			obj["status"] = "bad";
			obj["message"] = "This e-mail is not in our system.";
			//error json		
			setOut(obj.dump());
			db.closeDB();
			return;
		}
		db.closeDB();

		//std::cout << "Got 1" << std::endl;

		std::string folderemail;
		Player pl;
		std::string saltedPass;
		std::string token;

		folderemail = FUtils::toFolderMail(param1);
		saltedPass = FUtils::getSaltedPassword(param3, param1);

		pl.clear();
		pl.loadFromContainer(folderemail);

		//std::cout << "Got 2" << std::endl;

		token = "";
		token += pl.pass.at(8);
		token += pl.pass.at(9);
		token += pl.pass.at(10);
		token += pl.pass.at(11);
		token += pl.pass.at(12);

		if (!token.compare(param2) == 0)//token does not match
		{
			obj["status"] = "error";
			obj["message"] = "Tokens do not match. Please request a new password reset.";
			//error json		
			setOut(obj.dump());
			return;
		}

		pl.pass = saltedPass;
		pl.saveToContainer();

		//std::cout << "Got 3" << std::endl;

		db.changeForumPassword(param1, param3);

		

		obj["status"] = "ok";
		obj["message"] = "";
		//error json		
		setOut(obj.dump());
		return;
	}
};