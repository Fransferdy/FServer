#pragma once

#include "stdafx.h"
#include "md5.h"


class NewsJSON : public FPage
{
	virtual void doPut()
	{
		DatabaseCore db;
		json::JSON obj;
		int result;
		
		std::string title = pageGetP("title");
		std::string body = pageGetP("body");

		if (title.compare("NaN") == 0 || body.compare("NaN")== 0)
		{
			obj["status"] = "error";
			obj["message"] = "Invalid Parameters";
			setOut(obj.dump());
			return;
		}

		std::string userEmail = pageGetC("userEmail");
		std::string userToken = pageGetC("userToken");
		std::string gravatarMailString;

		db.openDB(globalProps.readString("dbname"));

		SiteUser user = db.adminAuthenticateCookie(userEmail, userToken);

		if (user.permission != PL_ADMINISTRATOR && user.permission != PL_MODERATOR)
		{
			db.closeDB();
			obj["status"] = "error";
			obj["message"] = "Authentication Invalid";
			setOut(obj.dump());
			return;
		}

		static char retString[33];

		//generate gravatar mail string
		userEmail.erase(std::remove_if(userEmail.begin(), userEmail.end(), std::isspace), userEmail.end());
		std::transform(userEmail.begin(), userEmail.end(), userEmail.begin(), ::tolower);
		CalculateMD5((char*)userEmail.c_str(), userEmail.length(), retString);
		gravatarMailString = retString;

		std::cout <<"Gravatar " << gravatarMailString << std::endl;

		SiteHeading news(0, title, body, "", gravatarMailString);

		result = db.addHeading(news);
		db.closeDB();

		if (result > 0)
		{
			obj["status"] = "ok";
			obj["message"] = "";
		}
		else
		{
			obj["status"] = "error";
			obj["message"] = "Unable to save to DB";
		}

		setOut(obj.dump());

	}
	
	virtual void doPatch()
	{
		DatabaseCore db;
		json::JSON obj;
		int result;
		int newsid;

		std::string title = pageGetP("title");
		std::string body = pageGetP("body");
		std::string newidstr = pageGetP("nid");

		if (title.compare("NaN") == 0 || body.compare("NaN") == 0 || newidstr.compare("NaN") == 0)
		{
			obj["status"] = "error";
			obj["message"] = "Invalid Parameters";
			setOut(obj.dump());
			return;
		}

		newsid = std::stoi(newidstr);

		std::string userEmail = pageGetC("userEmail");
		std::string userToken = pageGetC("userToken");


		db.openDB(globalProps.readString("dbname"));

		SiteUser user = db.adminAuthenticateCookie(userEmail, userToken);

		if (user.permission != PL_ADMINISTRATOR)
		{
			db.closeDB();
			obj["status"] = "error";
			obj["message"] = "Authentication Invalid";
			setOut(obj.dump());
			return;
		}

		SiteHeading news(newsid, title, body, "","");

		result = db.updateHeading(news);
		db.closeDB();

		if (result > 0)
		{
			obj["status"] = "ok";
			obj["message"] = "";
		}
		else
		{
			obj["status"] = "error";
			obj["message"] = "Unable to save to DB";
		}

		setOut(obj.dump());

	}

	virtual void doDelete()
	{
		DatabaseCore db;
		json::JSON obj;
		int result;
		int newsid;

		std::string newsidstr = pageGetP("nid");
		
		if (newsidstr.compare("NaN") == 0)
		{
			obj["status"] = "error";
			obj["message"] = "Invalid Parameters";
			setOut(obj.dump());
			return;
		}
		newsid = std::stoi(newsidstr);


		std::string userEmail = pageGetC("userEmail");
		std::string userToken = pageGetC("userToken");

		std::cout << userEmail << std::endl;
		std::cout << userToken << std::endl;

		db.openDB(globalProps.readString("dbname"));

		SiteUser user = db.adminAuthenticateCookie(userEmail, userToken);

		if (user.permission != PL_ADMINISTRATOR)
		{
			db.closeDB();
			obj["status"] = "error";
			obj["message"] = "Authentication Invalid";
			setOut(obj.dump());
			return;
		}

		result = db.deleteHeading(newsid);
		db.closeDB();

		if (result > 0)
		{
			obj["status"] = "ok";
			obj["message"] = "";
		}
		else
		{
			obj["status"] = "error";
			obj["message"] = "Unable to edit to DB";
		}

		setOut(obj.dump());
	}

	virtual void doGet()
	{
		json::JSON obj;
		std::string param1,param2;
		DatabaseCore db;
		std::vector <SiteHeading> news;
		int start, end;

		obj["status"] = "";
		obj["message"] = "";

		param1 = pageGetP("start");
		param2 = pageGetP("amount");

		if (param1.compare("NaN") == 0 || param2.compare("NaN")==0)
		{
			obj["status"] = "error";
			obj["message"] = "Invalid Parameters";
			//error json		
			setOut(obj.dump());
			return;
		}

		obj["news"] = json::Array();

		start = std::stoi(param1);
		end = std::stoi(param2);
		
		db.openDB(globalProps.readString("dbname"));
		obj["newsamount"] = db.getHeadingsAmount();
		news = db.getHeadings(start,end);
		db.closeDB();

		
		for (size_t i = 0, newsSize = news.size(); i < newsSize; i++)
		{
			obj["news"][i] = json::Object();
			obj["news"][i]["title"] = news[i].title;
			obj["news"][i]["body"] = news[i].body;
			obj["news"][i]["date"] = news[i].date;
			obj["news"][i]["email"] = news[i].email;
			obj["news"][i]["did"] = news[i].id;

		}

		obj["status"] = "ok";

		setOut(obj.dump());
	}
};