#pragma once

#include "includes.h"

class FUtils
{
public:
	static std::string absolutePath(std::string path)
	{
		char resolved_path[4096]; //4096 = PATH_MAX as defined in linux
		#ifdef _WIN32
				if (_fullpath(resolved_path, path.c_str(), 4096) != NULL)
					return resolved_path;
				return "";
		#else
				if (realpath(path.c_str(), resolved_path) != NULL)
					return resolved_path;
				return "";
		#endif
	}

	static std::ifstream::pos_type filesize(const char* filename)
	{
		std::ifstream in(filename, std::ifstream::ate | std::ifstream::binary);
		return in.tellg();
	}

	static std::string urlDecode(std::string SRC) {
		std::string ret;
		char ch;
		int i, ii;
		
		for (i = 0; i<SRC.length(); i++)
		{
			if (int(SRC[i]) == 37) {
				sscanf(SRC.substr(i + 1, 2).c_str(), "%x", &ii);
				ch = static_cast<char>(ii);
				ret += ch;
				i = i + 2;
			}
			else {
				ret += SRC[i];
			}
		}
		return (ret);
	}

};