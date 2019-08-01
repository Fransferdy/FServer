#include "stdafx.h"



#define QUERY_OK 1
#define QUERY_NOT_OK 0

enum PERMISSIONLEVEL
{
	PL_GUEST,
	PL_USER,
	PL_MODERATOR,
	PL_ADMINISTRATOR
};

class SiteHeading
{
public:
	std::string title;
	std::string body;
	std::string date;
	std::string email;
	int id;
	SiteHeading(int argid, std::string argtitle, std::string argbody, std::string argdate, std::string argemail)
	{
		title = argtitle;
		body = argbody;
		date = argdate;
		id = argid;
		email = argemail;
	}
};

class SiteUser
{
public:
	std::string name;
	std::string email;
	int permission;
};

class DatabaseCore
{
public:
	bool opened;
	sqlite3 *db;

	DatabaseCore()
	{
		opened = false;
	};

	~DatabaseCore()
	{
		if (opened)
			sqlite3_close(db);
	};

	bool openDB(std::string dbname)
	{
		int result;

		result = sqlite3_open(dbname.c_str(), &db);

		opened = false;
		if (result == SQLITE_OK)
			opened = true;

		return opened;
	};

	int closeDB()
	{
		if (!opened)
			return -1;

		sqlite3_close(db);
		opened = false;
		return 1;
	}

	std::vector<SiteHeading> getHeadings(int start, int amount)
	{
		int rc, step;
		std::vector<SiteHeading> result;
		std::string sql;
		sqlite3_stmt *res;

		if (!opened)
			return result;

		sql = " SELECT id,name,body,newsdate,email FROM News WHERE Id <= ((SELECT MAX(id) FROM News) - ?) ORDER BY Id DESC LIMIT ?;"; // AND id > ((SELECT count(id) FROM News) - ?) 
		rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &res, 0);
		if (rc == SQLITE_OK)
		{
			sqlite3_bind_int(res, 1, start);
			//sqlite3_bind_int(res, 2, start + amount);
			sqlite3_bind_int(res, 2, amount);

			step = sqlite3_step(res);

			while (step == SQLITE_ROW)
			{
				result.emplace_back(sqlite3_column_int(res, 0), (char*)sqlite3_column_text(res, 1), (char*)sqlite3_column_text(res, 2), (char*)sqlite3_column_text(res, 3), (char*)sqlite3_column_text(res, 4));
				step = sqlite3_step(res);
			}
			sqlite3_finalize(res);
		}

		return result;
	}

	int getHeadingsAmount()
	{
		int result = 0;
		int rc, step;
		std::string sql;
		sqlite3_stmt *res;

		if (!opened)
			return result;

		sql = " SELECT count(id) FROM News;";
		rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &res, 0);
		if (rc == SQLITE_OK)
		{
			step = sqlite3_step(res);

			if (step == SQLITE_ROW)
				result = sqlite3_column_int(res, 0);

			sqlite3_finalize(res);
		}

		return result;
	}

	int addHeading(SiteHeading argheading)
	{
		int rc, step;
		int result = -1;

		std::string sql;
		sqlite3_stmt *res;

		if (!opened)
			return result;

		sql = "INSERT INTO News (name,body,newsdate, email) VALUES (? , ?, date(), ?); ";

		step = SQLITE_BUSY;
		rc = SQLITE_OK;
		while (step == SQLITE_BUSY && rc == SQLITE_OK)
		{
			rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &res, 0);
			if (rc == SQLITE_OK)
			{
				sqlite3_bind_text(res, 1, argheading.title.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_text(res, 2, argheading.body.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_text(res, 3, argheading.email.c_str(), -1, SQLITE_STATIC);
				step = sqlite3_step(res);

				sqlite3_finalize(res);
				if (step == SQLITE_DONE)
					result = 1;
			}
		}
		return result;
	}

	int updateHeading(SiteHeading argheading)
	{
		int rc, step;
		int result = -1;

		std::string sql;
		sqlite3_stmt *res;

		if (!opened)
			return result;

		sql = "UPDATE News SET name = ?, body= ? WHERE id = ?;";

		step = SQLITE_BUSY;
		rc = SQLITE_OK;
		while (step == SQLITE_BUSY && rc == SQLITE_OK)
		{
			rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &res, 0);
			if (rc == SQLITE_OK)
			{
				sqlite3_bind_text(res, 1, argheading.title.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_text(res, 2, argheading.body.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_int(res, 3, argheading.id);
				step = sqlite3_step(res);

				sqlite3_finalize(res);
				if (step == SQLITE_DONE)
					result = 1;
			}
		}
		return result;
	}

	int deleteHeading(int id)
	{
		int rc, step;
		int result = -1;

		std::string sql;
		sqlite3_stmt *res;

		if (!opened)
			return result;

		sql = "DELETE FROM News WHERE id = ?;";
		rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &res, 0);
		if (rc == SQLITE_OK)
		{
			sqlite3_bind_int(res, 1, id);

			step = sqlite3_step(res);
			sqlite3_finalize(res);
			if (step == SQLITE_DONE)
				result = 1;
		}
		return result;
	
	}

	SiteUser adminAuthenticateLogin(std::string email, std::string pass)
	{
		int rc, step;
		std::string sql;
		sqlite3_stmt *res;
		SiteUser result;
		result.permission= PL_GUEST;
		result.name = "Guest";
		result.email = "";

		if (!opened)
			return result;

		sql = " SELECT name,permission FROM Users WHERE email=? AND pass=?;";
		rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &res, 0);
		if (rc == SQLITE_OK)
		{
			sqlite3_bind_text(res, 1, email.c_str(), -1, SQLITE_STATIC);
			sqlite3_bind_text(res, 2, pass.c_str(), -1, SQLITE_STATIC);

			step = sqlite3_step(res);

			if (step == SQLITE_ROW)
			{
				result.name = (char*)sqlite3_column_text(res, 0);
				result.permission = sqlite3_column_int(res, 1);
				result.email = email;
			}
			sqlite3_finalize(res);
		}

		return result;
	}

	std::string updateUserCookieDB(SiteUser user)
	{
		int rc, step;
		std::string result = "";

		std::string sql;
		sqlite3_stmt *res;
		std::string token = randString(8);

		if (!opened)
			return result;

		sql = "UPDATE Users SET token = ? WHERE name = ? AND email = ? AND permission = ?;";

		step = SQLITE_BUSY;
		rc = SQLITE_OK;
		while (step == SQLITE_BUSY && rc == SQLITE_OK)
		{
			rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &res, 0);
			if (rc == SQLITE_OK)
			{
				sqlite3_bind_text(res, 1, token.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_text(res, 2, user.name.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_text(res, 3, user.email.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_int(res, 4, user.permission);

				step = sqlite3_step(res);
				sqlite3_finalize(res);
				if (step == SQLITE_DONE)
					result = token;
			}
		}
		return result;
	}

	SiteUser adminAuthenticateCookie(std::string email, std::string userToken)
	{
		int rc, step;
		std::string sql;
		sqlite3_stmt *res;
		SiteUser result;
		result.permission = PL_GUEST;
		result.name = "Guest";
		result.email = "";

		if (!opened)
			return result;

		sql = " SELECT name,permission FROM Users WHERE email=? AND token=?;";
		rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &res, 0);
		if (rc == SQLITE_OK)
		{
			sqlite3_bind_text(res, 1, email.c_str(), -1, SQLITE_STATIC);
			sqlite3_bind_text(res, 2, userToken.c_str(), -1, SQLITE_STATIC);

			step = sqlite3_step(res);

			if (step == SQLITE_ROW)
			{
				result.name = (char*)sqlite3_column_text(res, 0);
				result.permission = sqlite3_column_int(res, 1);
				result.email = email;
				//std::cout << "name " <<result.name << " per "<< result.permission << " mail "<< result.email << std::endl;
			}
			sqlite3_finalize(res);
		}

		return result;
	}

	bool gameUserEmailExists(std::string email)
	{
		int rc, step;
		std::string sql;
		sqlite3_stmt *res;
		bool result = true;

		if (!opened)
			return result;

		sql = " SELECT id FROM GameUsers WHERE email=?;";
		rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &res, 0);
		if (rc == SQLITE_OK)
		{
			sqlite3_bind_text(res, 1, email.c_str(), -1, SQLITE_STATIC);

			step = sqlite3_step(res);

			if (step != SQLITE_ROW)
			{
				result = false;
			}
			sqlite3_finalize(res);
		}

		return result;
	};

	bool gameUserNicknameExists(std::string nickname)
	{
		int rc, step;
		std::string sql;
		sqlite3_stmt *res;
		bool result = true;

		if (!opened)
			return result;

		sql = " SELECT id FROM GameUsers WHERE nickname=?;";
		rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &res, 0);
		if (rc == SQLITE_OK)
		{
			sqlite3_bind_text(res, 1, nickname.c_str(), -1, SQLITE_STATIC);

			step = sqlite3_step(res);

			if (step != SQLITE_ROW)
			{
				result = false;
			}
			sqlite3_finalize(res);
		}

		return result;
	};

	bool createGameUser(std::string email, std::string fname, std::string lname, std::string bdate, std::string country, std::string nickname, std::string gjname, int gender, std::string referrer)
	{
		int rc, step;
		int result = -1;

		std::string sql;
		sqlite3_stmt *res;

		if (!opened)
			return result;

		sql = "INSERT INTO GameUsers (email,fname,lname,bdate,country,nickname,gjname,gender,referrer,receiveEmails) VALUES (? , ?, ?, ?, ?, ?, ?, ?, ?,1); ";

		step = SQLITE_BUSY;
		rc = SQLITE_OK;
		while (step == SQLITE_BUSY && rc == SQLITE_OK)
		{
			rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &res, 0);
			if (rc == SQLITE_OK)
			{
				sqlite3_bind_text(res, 1, email.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_text(res, 2, fname.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_text(res, 3, lname.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_text(res, 4, bdate.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_text(res, 5, country.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_text(res, 6, nickname.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_text(res, 7, gjname.c_str(), -1, SQLITE_STATIC);
				sqlite3_bind_int(res, 8, gender);
				sqlite3_bind_text(res, 9, referrer.c_str(), -1, SQLITE_STATIC);
				step = sqlite3_step(res);

				sqlite3_finalize(res);
				if (step == SQLITE_DONE)
					result = 1;
			}
		}
		return result;
	}

	std::string saltPassword(std::string password, std::string salt)
	{
		std::string md5pass;
		std::string md5salt;
		std::string saltedPass;
		static char retStringPass[33];
		static char retStringSalt[33];
		static char retStringSaltPass[33];

		md5pass = password;
		//CalculateMD5((char*)password.c_str(), password.length(), retStringPass);
		//md5pass = retStringPass;

		CalculateMD5((char*)salt.c_str(), salt.length(), retStringSalt);
		md5salt = retStringSalt;

		saltedPass = md5salt.append(md5pass);
		CalculateMD5((char*)saltedPass.c_str(), saltedPass.length(), retStringSaltPass);
		saltedPass = retStringSaltPass;

		return saltedPass;
	}

	bool createForumAccount(std::string argname, std::string argemail,std::string argpass)
	{
		MYSQL *con = mysql_init(NULL);
		MYSQL_STMT *stmt;
		MYSQL_BIND param[4];

		char salt[9];
		std::string stdsalt;
		for (size_t i = 0; i < 8; i++)
		{
			salt[i] = 64 + rand() % 56;
			if (salt[i] == 94 || salt[i] == 96)
				salt[i] = 64;
		}
		salt[8] = '\0';
		stdsalt = salt;

		std::string sql;
		std::string username,password,email;
		unsigned long usernamelength, passwordlength,emaillength,saltlength;

		username = argname;
		password = saltPassword(argpass, stdsalt);
		email = argemail;

		sql = "INSERT INTO pokemonforum.mybb_users (username,password,email,salt,usergroup,regdate,allownotices,receivepms,buddyrequestspm,showimages,showvideos,showsigs,showavatars,showquickreply,showredirect,showcodebuttons) VALUES ( ? , ? , ?, ?,5,NOW(),1,1,1,1,1,1,1,1,1,1) ";
		//	some info in the right >>																																																				 VALUES ( ? , ? , ?,?, AwatingActivation,DATENOW,)                

		if (con == NULL)
		{
			return false;
		}

		if (mysql_real_connect(con, "localhost", "pokeadmin", "InZ5Yz5M2SAcAEnm",
			NULL, 0, NULL, 0) == NULL)
		{
			fprintf(stderr, "%s\n", mysql_error(con));
			mysql_close(con);
			return false;
		}

		stmt = mysql_stmt_init(con);

		if (stmt == NULL) {
			fprintf(stderr, "Could not initialize statement handler %s", mysql_error(con));
			mysql_close(con);
			return false;
		}

		if (mysql_stmt_prepare(stmt, sql.c_str(), sql.length()+1) != 0) 
		{
			fprintf(stderr, "%s\n", mysql_error(con));
			mysql_close(con);
			return false;
		}

		memset(param, 0, sizeof(param));

		usernamelength = username.length();
		passwordlength = password.length();
		emaillength = email.length();
		saltlength = stdsalt.length();

		param[0].buffer_type = MYSQL_TYPE_VARCHAR;
		param[0].buffer = (void *)username.c_str();
		param[0].is_unsigned = 0;
		param[0].is_null = 0;
		param[0].length = &usernamelength;

		param[1].buffer_type = MYSQL_TYPE_VARCHAR;
		param[1].buffer = (void *)password.c_str();
		param[1].is_unsigned = 0;
		param[1].is_null = 0;
		param[1].length = &passwordlength;

		param[2].buffer_type = MYSQL_TYPE_VARCHAR;
		param[2].buffer = (void *)email.c_str();
		param[2].is_unsigned = 0;
		param[2].is_null = 0;
		param[2].length = &emaillength;

		param[3].buffer_type = MYSQL_TYPE_VARCHAR;
		param[3].buffer = (void *)stdsalt.c_str();
		param[3].is_unsigned = 0;
		param[3].is_null = 0;
		param[3].length = &saltlength;

		// Bind param structure to statement
		if (mysql_stmt_bind_param(stmt, param) != 0) 
		{
			fprintf(stderr, "%s\n", mysql_error(con));
			mysql_close(con);
			return false;
		}

		// Execute!!
		if (mysql_stmt_execute(stmt) != 0) 
		{
			fprintf(stderr, "%s\n", mysql_error(con));
			mysql_close(con);
			return false;
		}

		mysql_close(con);
		return true;

	}

	bool activateForumAccount(std::string argemail)
	{
		MYSQL *con = mysql_init(NULL);
		MYSQL_STMT *stmt;
		MYSQL_BIND param[1];

		std::string sql;
		std::string email;
		unsigned long emaillength;

		email = argemail;

		sql = "UPDATE pokemonforum.mybb_users SET usergroup=2 WHERE email LIKE ( ? );";
			
		if (con == NULL)
		{
			return false;
		}

		if (mysql_real_connect(con, "localhost", "pokeadmin", "InZ5Yz5M2SAcAEnm",
			NULL, 0, NULL, 0) == NULL)
		{
			fprintf(stderr, "%s\n", mysql_error(con));
			mysql_close(con);
			return false;
		}

		stmt = mysql_stmt_init(con);

		if (stmt == NULL) 
		{
			fprintf(stderr, "Could not initialize statement handler %s", mysql_error(con));
			mysql_close(con);
			return false;
		}

		if (mysql_stmt_prepare(stmt, sql.c_str(), sql.length() + 1) != 0)
		{
			fprintf(stderr, "%s\n", mysql_error(con));
			mysql_close(con);
			return false;
		}

		memset(param, 0, sizeof(param));

		emaillength = email.length();

		param[0].buffer_type = MYSQL_TYPE_VARCHAR;
		param[0].buffer = (void *)email.c_str();
		param[0].is_unsigned = 0;
		param[0].is_null = 0;
		param[0].length = &emaillength;


		// Bind param structure to statement
		if (mysql_stmt_bind_param(stmt, param) != 0) 
		{
			fprintf(stderr, "%s\n", mysql_error(con));
			mysql_close(con);
			return false;
		}

		// Execute!!
		if (mysql_stmt_execute(stmt) != 0) 
		{
			fprintf(stderr, "%s\n", mysql_error(con));
			mysql_close(con);
			return false;
		}

		mysql_close(con);
		return true;

	}

	bool changeForumPassword(std::string argemail, std::string argpass)
	{
		MYSQL *con = mysql_init(NULL);
		MYSQL_STMT *stmt;
		MYSQL_BIND param[3];

		char salt[9];
		std::string stdsalt;
		for (size_t i = 0; i < 8; i++)
		{
			salt[i] = 64 + rand() % 56;
			if (salt[i] == 94 || salt[i] == 96)
				salt[i] = 64;
		}
		salt[8] = '\0';
		stdsalt = salt;

		std::string sql;
		std::string password, email;
		unsigned long passwordlength, emaillength, saltlength;

		password = saltPassword(argpass, stdsalt);
		email = argemail;

		sql = "UPDATE pokemonforum.mybb_users SET password=?, salt=? WHERE email LIKE (?);";
		if (con == NULL)
		{
			return false;
		}

		if (mysql_real_connect(con, "localhost", "pokeadmin", "InZ5Yz5M2SAcAEnm",
			NULL, 0, NULL, 0) == NULL)
		{
			fprintf(stderr, "%s\n", mysql_error(con));
			mysql_close(con);
			return false;
		}

		stmt = mysql_stmt_init(con);

		if (stmt == NULL)
		{
			fprintf(stderr, "Could not initialize statement handler %s", mysql_error(con));
			mysql_close(con);
			return false;
		}

		if (mysql_stmt_prepare(stmt, sql.c_str(), sql.length() + 1) != 0)
		{
			fprintf(stderr, "%s\n", mysql_error(con));
			mysql_close(con);
			return false;
		}

		memset(param, 0, sizeof(param));

		passwordlength = password.length();
		saltlength = stdsalt.length();
		emaillength = email.length();

		param[0].buffer_type = MYSQL_TYPE_VARCHAR;
		param[0].buffer = (void *)password.c_str();
		param[0].is_unsigned = 0;
		param[0].is_null = 0;
		param[0].length = &passwordlength;

		param[1].buffer_type = MYSQL_TYPE_VARCHAR;
		param[1].buffer = (void *)stdsalt.c_str();
		param[1].is_unsigned = 0;
		param[1].is_null = 0;
		param[1].length = &saltlength;

		param[2].buffer_type = MYSQL_TYPE_VARCHAR;
		param[2].buffer = (void *)email.c_str();
		param[2].is_unsigned = 0;
		param[2].is_null = 0;
		param[2].length = &emaillength;

		// Bind param structure to statement
		if (mysql_stmt_bind_param(stmt, param) != 0)
		{
			fprintf(stderr, "%s\n", mysql_error(con));
			mysql_close(con);
			return false;
		}

		// Execute!!
		if (mysql_stmt_execute(stmt) != 0)
		{
			fprintf(stderr, "%s\n", mysql_error(con));
			mysql_close(con);
			return false;
		}

		mysql_close(con);
		return true;
	}


protected:

	int executeSQL(std::string query)
	{
		char *error;
		int result;

		if (!opened)
			return -1;

		result = sqlite3_exec(db, query.c_str(), NULL, NULL, &error);

		if (result != SQLITE_OK)
		{
			std::cout << "DB Err " << sqlite3_errmsg(db) << std::endl;
			sqlite3_free(error);
		}
		return result;
	}

	std::string randString(int len)
	{
		std::string result;
		static const char alphanum[] =
			"0123456789"
			"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
			"abcdefghijklmnopqrstuvwxyz";


		for (int i = 0; i < len; ++i) 
		{
			result.append(" ");
			result.at(i) = alphanum[rand() % (sizeof(alphanum) - 1)];
		}

		return result;
	}
};
/*
CREATE DB

CREATE TABLE Users (id INTEGER PRIMARY KEY, email TEXT,name TEXT,pass TEXT,token TEXT,permission INTEGER);
CREATE TABLE News (id INTEGER PRIMARY KEY, name TEXT,body TEXT,newsdate TEXT, email TEXT);

CREATE TABLE GameUsers (id INTEGER PRIMARY KEY, email TEXT,fname TEXT, lname TEXT, bdate TEXT, country TEXT, nickname TEXT, gjname TEXT, gender INTEGER, referrer TEXT, receiveEmails INTEGER);
*/

/*
sqlite3_stmt *res;

PREPARED STATEMENT WITH PARAMETERS

char *sql = "SELECT Id, Name FROM Cars WHERE Id = ?";
rc = sqlite3_prepare_v2(db, sql, -1, &res, 0);
if (rc == SQLITE_OK)
{
sqlite3_bind_int(res, 1, 3);
}

SELECT id,name,body,newsdate FROM News WHERE Id > ((SELECT count(Id) FROM News) - 5) ORDER BY Id DESC LIMIT 5

GET QUERY RESULTS

int step = sqlite3_step(res);

if (step == SQLITE_ROW) {
printf("%s: ", sqlite3_column_text(res, 0));
printf("%s\n", sqlite3_column_text(res, 1));
}


AFTER FINISHING USING PREPARED STATEMENT

sqlite3_finalize(res);


*/