#pragma once

#include "stdafx.h"
#include <ctime>

class ErrorReportPage : public FPage
{
	virtual void doPost()
	{
		doGet();
	}

	virtual void doGet()
	{
		std::string emailbody;
		/*
		time_t rawtime;
		struct tm * timeinfo;
		char buffer[80];

		time(&rawtime);
		timeinfo = localtime(&rawtime);

		strftime(buffer, 80, "%d-%m-%Y-%I-%M-%S", timeinfo);
		std::string str(buffer);

		std::ofstream outf("gamecrashes\\crash" + str +".txt");

		outf << "User input:" << std::endl << pageGetP("u") << std::endl << "Crash Info " << std::endl << std::endl << pageGetP("crash") << std::endl;
		outf.close();
		*/
		emailbody = "User Provided Information: \n " + pageGetP("u") + "\n Crash Details <br>" +pageGetP("crash");
		//emailbody = emailbody.replace(emailbody.begin(), emailbody.end(), "\n", "<br>");
		sendMail(globalProps.readString("adm_email"), "CrashReport", emailbody);

		out.append("<!DOCTYPE html><html><body>");
		out.append("Thanks");
		out.append("</body></html>");
		out.append("\n");
	}
};