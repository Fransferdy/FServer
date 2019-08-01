#include "stdafx.h"

class LauncherNewsPage : public FPage
{
	virtual void doPost()
	{
		doGet();
	}

	virtual void doGet()
	{
		int amount;
		DatabaseCore db;
		std::vector <SiteHeading> news;

		db.openDB(globalProps.readString("dbname"));
		amount = db.getHeadingsAmount();
		news = db.getHeadings(0, amount);
		db.closeDB();



		out.append("<!DOCTYPE html><html><body>");
		out.append("<html>");
		out.append("<body bgcolor=\"#FFFFD6\">");

		for (size_t i = 0, max = news.size(); i < max; i++)
		{
			out.append("<table bgcolor=\"#FFFFFF\" width=100%> ");
			out.append("<tr bgcolor=\"#CCCCCC\" >");
			out.append("<td>" + news.at(i).title + " - " + news.at(i).date + "</td>");
			out.append("</tr>");
			out.append("<tr>");
			out.append("<td>" + news.at(i).body + "</td>");
			out.append("</tr>");
			out.append("</table>");
			out.append("<br>");
			out.append("<br>");
		}

		out.append("</body>");
		out.append("</html>");


	}
};