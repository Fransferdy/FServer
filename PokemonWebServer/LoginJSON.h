#pragma once

#include "stdafx.h"




class LoginJSON : public FPage
{

	virtual void doPut()
	{
		json::JSON obj;
		std::string param1, param2,param3,param4,param5,param6,param7,param8,param9,param10,param11;
		DatabaseCore db;

		obj["status"] = "ha";
		obj["message"] = "";

		param1 = pageGetP("fname");
		param2 = pageGetP("lname");
		param3 = pageGetP("bdate");
		param4 = pageGetP("country");
		param5 = pageGetP("email");
		param6 = pageGetP("playname");
		param7 = pageGetP("pass");
		param8 = pageGetP("gjname");
		param9 = pageGetP("gjtoken");
		param10 = pageGetP("ref");
		param11 = pageGetP("gender");


		if (!(pageParamExists(param1) && pageParamExists(param3) && pageParamExists(param4) && pageParamExists(param5) && pageParamExists(param6)
			&& pageParamExists(param7) ))
		{
			obj["status"] = "error";
			obj["message"] = "Please, Complete all mandatory fields.";
			//error json		
			setOut(obj.dump());
			return;
		}

		if (param8.compare("NaN") == 0)
			param8 = "";
		if (param9.compare("NaN") == 0)
			param9 = "";
		if (param10.compare("NaN") == 0)
			param10 = "";

		db.openDB("website.db");

		if (db.gameUserEmailExists(param5))
		{
			obj["status"] = "bad";
			obj["message"] = "This e-mail is already in use.";
			//error json		
			setOut(obj.dump());
			db.closeDB();
			return;
		}

		if (db.gameUserNicknameExists(param6))
		{
			obj["status"] = "bad";
			obj["message"] = "This player nickname is already in use.";
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
		saltedPass = FUtils::getSaltedPassword(param7, param5);

		pl.clear();
		pl.ptype = AC_NONACTIVATED;
		pl.name = folderemail; //email
		pl.firstName = param1;
		pl.lastName = param2;
		pl.log_nameshown = param6;
		pl.pass = saltedPass;
		pl.gender = std::stoi(param11);
		pl.bday = param3;
		pl.country = param4;
		pl.email = param5;
		pl.gamejoltUserId = param8;
		pl.gamejoltUserToken = param9;
		pl.referrer = param10;
		pl.battleText = "Team! Show what we can do!";
		pl.ptype = 0;
		pl.cash = 0;
		pl.ptype = 0;
		pl.gold = 600;
		pl.map = 1;
		pl.x = 160;
		pl.y = 160;
		pl.timem = 0;
		pl.timeh = 0;
		pl.lastpkmcenter = 1;
		pl.animestate = 0;
		pl.dondays = 0;
		pl.colorr = 200;
		pl.colorg = 200;
		pl.colorb = 200;
		pl.insideid = -1;
		pl.continent = CONTINENT_NOCONTINENT;
		pl.playerlevel = 0;
		pl.itensballs[0][0] = 1;//pokeball
		pl.itensballs[0][1] = 5;
		if (pl.referrer.compare("") != 0)//referrer bonus
		{
			pl.itensballs[1][0] = 4;//greatball
			pl.itensballs[1][1] = 3;
		}

		if (pl.gender == 0) //FIRST OUTFIT
		{
			pl.itensother[0][0] = 30;
			pl.trainerSet = 0;
		}
		else
		{
			pl.itensother[0][0] = 31;
			pl.trainerSet = 1;
		}
		pl.itensother[0][1] = 1;

		pl.saveToContainer();

		std::cout << pl.firstName << std::endl;

		db.openDB("website.db");
		db.createGameUser(pl.email,pl.firstName,pl.lastName,pl.bday,pl.country,pl.log_nameshown,pl.gamejoltUserId,pl.gender,pl.referrer);
		db.closeDB();

		db.createForumAccount(pl.log_nameshown, pl.email, param7);

		token = "";
		token += pl.pass.at(8);
		token += pl.pass.at(9);
		token += pl.pass.at(10);
		token += pl.pass.at(11);
		token += pl.pass.at(12);

		//send activation email
		sendMail(pl.email, "Pokemon Regions Account Activation", "Hello, it's good to know you want to play with us " + pl.firstName + "! \n\n Before you play you must first activate your account,\n click in the following link to activate your account: <a href=" + globalProps.readString("domain") + "activate.html?email=" + pl.email + "&token=" + token + ">" + globalProps.readString("domain") + "activate.html?email=" + pl.email + "&token=" + token + "</a> \n\n Best Regards \n Pokemon Regions Team");

		obj["status"] = "ok";
		obj["message"] = "";	
		setOut(obj.dump());
		return;
	}

	virtual void doPost()
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

		DataContainer *container;
		std::string firstName,pass,email;
		int token;
		std::string folderemail;
		folderemail = FUtils::toFolderMail(param1);


		container = new DataContainer("Users\\UsersData", folderemail);
		if (container->retrieveContainer())
		{
			firstName = container->readString("P>FName");
			pass = container->readString("P>Pass");
			email = container->readString("P>Email");

			param2 = FUtils::getSaltedPassword(param2, param1);


			if (pass.compare(param2) == 0)
			{
				token = rand() % 1000;
				container->replaceString("P>Token", std::to_string(token));
				container->asyncStoreAndCloseContainer();
				obj["status"] = "ok";
				obj["user"]["name"] = firstName;
				obj["user"]["email"] = email;
				obj["user"]["token"] = std::to_string(token);
			}
			else
			{
				obj["status"] = "bad";
				obj["message"] = "Wrong Password or E-mail";
				container->close();
			}
		}
		else
		{
			obj["status"] = "bad";
			obj["message"] = "Wrong Password or E-mail";
		}
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

		if (!(pageParamExists(param1) && pageParamExists(param2)))
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
		std::string token;

		folderemail = FUtils::toFolderMail(param1);

		pl.clear();
		if (!pl.loadFromContainer(folderemail))
		{
			obj["status"] = "error";
			obj["message"] = "E-mail not in our system.";

			setOut(obj.dump());
			return;
		}

		//std::cout << "Got 2" << std::endl;

		token = "";
		token += pl.pass.at(8);
		token += pl.pass.at(9);
		token += pl.pass.at(10);
		token += pl.pass.at(11);
		token += pl.pass.at(12);

		if (!(token.compare(param2) == 0))//token does not match
		{
			obj["status"] = "error";
			obj["message"] = "Tokens do not match. Please use the activation link.";
			//error json		
			setOut(obj.dump());
			return;
		}

		pl.ptype = AC_USER;
		pl.saveToContainer();

		db.activateForumAccount(param1);

		obj["status"] = "ok";
		obj["message"] = "";
		//error json		
		setOut(obj.dump());
		return;
	}
};