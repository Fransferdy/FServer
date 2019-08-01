#pragma once

#include "stdafx.h"
#include "md5.h"



class AccountJSON : public FPage
{

	virtual void doGet()
	{
		json::JSON obj;
		std::string param1, param2;
		DatabaseCore db;

		obj["status"] = "";
		obj["message"] = "";

		param1 = pageGetC("usermail");
		param2 = pageGetC("usertoken");

		if (param1.compare("NaN") == 0 || param2.compare("NaN") == 0)
		{
			obj["status"] = "error";
			obj["message"] = "Invalid Parameters";
			//error json		
			setOut(obj.dump());
			return;
		}

		DataContainer *container;
		std::string token,email, paramemail, paramtoken;
		std::string folderemail;

		paramemail = FUtils::urlDecode(param1);
		paramtoken = FUtils::urlDecode(param2);

		folderemail = FUtils::toFolderMail(paramemail);

		container = new DataContainer("Users\\UsersData", folderemail);
		if (container->retrieveContainer())
		{
			token = container->readString("P>Token");

			std::cout << "file token  " << token << std::endl;
			if (token.compare(paramtoken) == 0)
			{
				Player pl;

				obj["status"] = "ok";
				obj["message"] = "";
				container->close();
				pl.loadFromContainer(folderemail);
				obj["account"] = json::Object();
				obj["account"]["name"] = pl.firstName;
				obj["account"]["playername"] = pl.log_nameshown;
				obj["account"]["trainerset"] = pl.trainerSet;
				obj["account"]["money"] = pl.gold;
				obj["account"]["playtime"] = ""+std::to_string(pl.timeh)+":"+std::to_string(pl.timem);
				obj["account"]["playerlevel"] = pl.playerlevel / EXPFORPLAYERLEVEL;
				obj["account"]["battleText"] = pl.battleText;


				obj["account"]["badges"] = json::Array();
				for (size_t i = 0; i < 50; i++)
				{
					obj["account"]["badges"][i] = pl.badges[i];
				}

				obj["account"]["pokemont"] = json::Array();
				for (size_t i = 0; i < 6; i++)
				{
					obj["account"]["pokemont"][i] = json::Object();
					obj["account"]["pokemont"][i]["name"] = pl.pokemontn[i];
					obj["account"]["pokemont"][i]["dexid"] = pl.pokemont[i][1];
					obj["account"]["pokemont"][i]["gender"] = pl.pokemont[i][36];
					obj["account"]["pokemont"][i]["lvl"] = pl.pokemont[i][3];
					obj["account"]["pokemont"][i]["happiness"] = pl.pokemont[i][11];
					obj["account"]["pokemont"][i]["shiny"] = pl.pokemont[i][12];
					obj["account"]["pokemont"][i]["nature"] = pl.pokemont[i][17];
					obj["account"]["pokemont"][i]["hp"] = pl.pokemont[i][24];
					obj["account"]["pokemont"][i]["attack"] = pl.pokemont[i][25];
					obj["account"]["pokemont"][i]["defense"] = pl.pokemont[i][26];
					obj["account"]["pokemont"][i]["spattack"] = pl.pokemont[i][27];
					obj["account"]["pokemont"][i]["spdefense"] = pl.pokemont[i][28];
					obj["account"]["pokemont"][i]["speed"] = pl.pokemont[i][29];
				}

				for (size_t i = 0; i < MAXPCSIZE; i++)
				{
					obj["account"]["pokemonpc"][i] = json::Object();
					obj["account"]["pokemonpc"][i]["name"] = pl.pokemonpcn[i];
					obj["account"]["pokemonpc"][i]["dexid"] = pl.pokemonpc[i][1];
					obj["account"]["pokemonpc"][i]["gender"] = pl.pokemonpc[i][36];
					obj["account"]["pokemonpc"][i]["lvl"] = pl.pokemonpc[i][3];
					obj["account"]["pokemonpc"][i]["happiness"] = pl.pokemonpc[i][11];
					obj["account"]["pokemonpc"][i]["shiny"] = pl.pokemonpc[i][12];
					obj["account"]["pokemonpc"][i]["nature"] = pl.pokemonpc[i][17];
					obj["account"]["pokemonpc"][i]["hp"] = pl.pokemonpc[i][24];
					obj["account"]["pokemonpc"][i]["attack"] = pl.pokemonpc[i][25];
					obj["account"]["pokemonpc"][i]["defense"] = pl.pokemonpc[i][26];
					obj["account"]["pokemonpc"][i]["spattack"] = pl.pokemonpc[i][27];
					obj["account"]["pokemonpc"][i]["spdefense"] = pl.pokemonpc[i][28];
					obj["account"]["pokemonpc"][i]["speed"] = pl.pokemonpc[i][29];
				}
				
			}
			else
			{
				obj["status"] = "bad";
				obj["message"] = "Wrong Token or E-mail t";
				container->close();
			}
		}
		else
		{
			obj["status"] = "bad";
			obj["message"] = "Wrong Token or E-mail e";
		}
		setOut(obj.dump());
		return;
	}
};
