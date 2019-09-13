#pragma once
#include "includes.h"
#include <direct.h>//for mkdir
#include "md5.h"

class FileData
{
public:
	std::string path;
	std::string name;
	std::string md5hash;
	size_t size;

	std::string getHash(std::string basedir)
	{
		FILE *binarFile;
		char *data;
		char retString[33];
		binarFile = fopen((basedir+path+name).c_str(), "rb");
		if (binarFile)
		{
			fseek(binarFile, 0, SEEK_END);
			size = ftell(binarFile);
			rewind(binarFile);
			data = (char*)malloc(size);
			if (data == NULL)
				return "";
			fread(data, size, 1, binarFile);
			CalculateMD5(data, size, retString);
			md5hash = retString;
			fclose(binarFile);
			free(data);
			return md5hash;
		}
		return "";
	}
};

class FilesManager
{
private:
	std::vector <FileData> files;
	std::vector <std::string> ignoredPaths;
	std::string basedir;
	int packageVersion;
	/*
	write an std::string to a binary file, it's just a function to make things easier
	*/
	void writeStringToFile(std::string stringToWrite,int sizearg, FILE *file)
	{
		int size=sizearg;
		const char *string = stringToWrite.c_str();
		//int size = strlen(string);
		//printf("Saving: Size: %d, Data: %s\n\n",size, string);
		fwrite(&size,sizeof(int),1,file);
		fwrite(string,size,1,file);
	}
	/*
	read an std::string to a binary file, it's just a function to make things easier
	*/
	void readStringFromFile(std::string *string, FILE *file)
	{
		int size;
		fread(&size,sizeof(int),1,file);
		//printf("%d \n",size);
		char* data;
		data = (char*)malloc(size+1); //alloc size of string + 1 for \0
		if (data == NULL)
			return;
		fread(data,size,1,file);
		data[size]='\0';
		(*string) = data;
		free(data);
	}

public:
	FilesManager()
	{
		basedir = "";
		packageVersion = 0;
	}
	FilesManager(int version)
	{
		basedir = "";
		packageVersion = version;
	}

	std::string getBaseDir()
	{
		return basedir;
	}
	/*
	Clear the files vector rom all of its elements
	*/
	void clearFiles()
	{
		while(files.size()>0)
		{
			files.pop_back();
		}
	}

	void addIgnoredPath(std::string path)
	{
		ignoredPaths.push_back(path);
	}

	/*
	Populates the file vector with all files from a given directory(and the subdirectories inside it)
	*/
	void populateFromDir(std::string path, bool first = true)
	{
		DIR *dir;
		struct dirent *ent;
		std::string fileName;
		bool ignored = false;
		
		if ((dir = opendir (path.c_str())) != NULL) 
		{
			/* print all the files and directories within directory */
			while ((ent = readdir (dir)) != NULL) 
			{
				FileData fileRead;
				if (ent->d_type==DT_DIR)
				{
					if (strstr(ent->d_name,".")!=NULL && strlen(ent->d_name)==1)continue;
					if (strstr(ent->d_name,"..")!=NULL)continue;
					fileName = ent->d_name;
					ignored = false;
					for (size_t i = 0; i < ignoredPaths.size(); i++)
					{
						if (fileName.find(ignoredPaths[i]) != std::string::npos)
						{
							ignored = true;
							break;
						}
					}
					if (!ignored)
						populateFromDir(path+ent->d_name+"\\",false);
				}
				else
				{
					fileRead.name = ent->d_name;
					fileRead.path = path;
					files.push_back(fileRead);
				}
				//printf ("Path: %s \n, File Name: %s \n, type %d\n\n",path.c_str(), ent->d_name,ent->d_type);
			}
			closedir (dir);
		}
		else
		{
		// could not open directory 
		perror ("Could Not Open Directory \n");
		}
		if (first)
		{
			basedir = path;
			for (size_t i = 0; i < files.size(); i++)
			{
				files[i].path = files[i].path.substr(path.length(), std::string::npos);
				//std::cout << files[i].path << std::endl;
			}
		}
	}

	/*
	Create a relative directory, creates all directories necessary to get to the path argument. (only works for relative dirs)
	*/
	/*
	static int find_first_of(char *str,char c)
	{
		int pos = 0;
		while (str[pos] != '\0')
		{
			if (str[pos] == c)
				return pos;
			pos++;
		}
		return -1;
	}

	static char* getPath(char *str)
	{
		char *ret;
		for (int i = strlen(str); i >=0; i--)
		{
			if (str[i] == '\\')
			{
				ret = (char*)malloc(i + 1);
				memcpy(ret, str, i);
				ret[i + 1] = '\0';
				return ret;
			}
		}
		return "";
	}

	static void createDir(char* path)
	{
		//string::npos
		int fullsize = strlen(path);
		int cuttensize;
		char* cuttenPath;
		cuttenPath = (char*)malloc(fullsize);
		cuttenPath = strcpy(cuttenPath,path);
		int barPos;
		int lastBarPos = 0;
		if (opendir(path) == NULL)
		{
			barPos = find_first_of(cuttenPath,'\\');
			while (barPos != -1)
			{
				free(cuttenPath);
				cuttenPath = (char*)malloc(barPos + 1);
				cuttenPath = (char*)memcpy(cuttenPath, path, barPos);
				cuttenPath[barPos] = '\0';
				//std::cout << cuttenPath << std::endl;
				//printf("Path: %s \n", cuttenPath.c_str());
				lastBarPos = barPos + 1;

				if (opendir(cuttenPath) == NULL)
					_mkdir(cuttenPath);

				if (find_first_of(&(path[lastBarPos]), '\\') == -1)
					break;
				barPos = find_first_of(&(path[lastBarPos]), '\\') + lastBarPos;
			}
			if (strlen(path) - lastBarPos > 0)
			{
				if (opendir(path) == NULL)
					_mkdir(path);
			}
		}
	}
	*/

	
	static void createDir(std::string path)
	{    
		//string::npos
		std::string cuttenPath;
		cuttenPath = path;
		size_t barPos;
		size_t lastBarPos=0;
		if (opendir (path.c_str()) == NULL)
		{
			barPos = cuttenPath.find_first_of('\\');
			while (barPos!=std::string::npos)
			{
				cuttenPath = path.substr(0,barPos);
				//printf("Path: %s \n", cuttenPath.c_str());
				lastBarPos = barPos+1;

				if (opendir (cuttenPath.c_str()) == NULL)
					_mkdir(cuttenPath.c_str());

				barPos = path.find_first_of('\\',lastBarPos);
			}
			if (path.substr(lastBarPos).size() > 0)
			{
				if (opendir (path.c_str()) == NULL)
					_mkdir(path.c_str());
				//printf("Path: %s \n", path.c_str());
			}
		}
		//else
		//{
		//	printf("This folder already exists!!\n");
		//}
	}
	

	static int copyFileTo(std::string sourcepath, std::string destinationpath)
	{
		std::ifstream source(sourcepath, std::ios::binary);
		std::ofstream dest(destinationpath, std::ios::binary);
		if (dest.is_open() && source.is_open())
		{
			dest << source.rdbuf();

			source.close();
			dest.close();
			return 0;
		}
		else
		{
			return -1;
		}
	}

	/*
	Opens all Files and retrieve size and md5hash data from them, then save this data in the files vector.
	*/
	void filesGetInfo()
	{
		FILE *binarFile;
		std::string pathToFile;
		int size;
		char *data;
		static char retString[33];
		for (size_t i = 0; i < files.size(); i++)
		{
			pathToFile = basedir+files[i].path+files[i].name;
			//printf("Opening File: %s\n",pathToFile.c_str());
			binarFile=fopen(pathToFile.c_str(),"rb");
			if (binarFile)
			{
				fseek (binarFile , 0 , SEEK_END);
				size = ftell (binarFile);
				rewind (binarFile);
				files[i].size=size;
				data = (char*)malloc(size);
				fread(data,size,1,binarFile);
				CalculateMD5(data,size,retString);
				files[i].md5hash = retString;
				fclose(binarFile);
				free(data);
			}
		}
	}

	/*
	Print the information from each file stored in the files vector
	*/
	void filesPrintAll()
	{
		printf("Package Version: %d\n", packageVersion);
		for (size_t i = 0; i < files.size(); i++)
		{
			printf ("Basedir: %s Path: %s \nFile Name: %s \nSize: %d\nMD5Hash: %s\n\n",basedir.c_str(),files[i].path.c_str(),files[i].name.c_str(),files[i].size,files[i].md5hash.c_str());
		}
	}

	/*
	Returns the file vector, where all data is stored
	*/
	std::vector <FileData> getFiles()
	{
		return files;
	}

	/*
	Set the file vector, where all data is stored
	*/
	void setFiles(std::vector <FileData> filesarg)
	{
		files = filesarg;
	}

	/*
	Returns the file data version
	*/
	int getVersion()
	{
		return packageVersion;
	}


	/*
	Makes a new FileData vector containing all files that are the same from oldfiles
	(a file is the same when they match in md5hash and name)
	*/
	static std::vector <FileData> sameFiles(std::vector <FileData> newFiles, std::vector <FileData> oldFiles)
	{
		//otherMag.files;
		std::vector <FileData> result;
		std::string fileFullPath;
		bool fileInLastUpdate = false;
		for (size_t i = 0; i < newFiles.size(); i++)
		{
			fileFullPath = newFiles[i].path + newFiles[i].name;

			for (size_t j = 0; j < oldFiles.size(); j++)
			{
				if (fileFullPath.compare(oldFiles[j].path + oldFiles[j].name) == 0)
				{
					if (newFiles[i].md5hash.compare(oldFiles[j].md5hash) == 0)
					{
						result.push_back(newFiles[i]);
					}
					break;
				}
			}
		}
		return result;
	}


	/*
	Makes a new FileData vector containing all files from newFiles, except for the ones that are the same from oldFiles
	(a file is the same when they match in md5hash and name)
	*/
	static std::vector <FileData> differenceFiles(std::vector <FileData> newFiles,std::vector <FileData> oldFiles)
	{
		//otherMag.files;
		std::vector <FileData> result;
		std::string fileFullPath;
		bool fileInLastUpdate=false;
		for (size_t i = 0; i < newFiles.size(); i++)
		{
			fileFullPath = newFiles[i].path+newFiles[i].name;

			for (size_t j= 0; j < oldFiles.size(); j++)
			{
				if (fileFullPath.compare(oldFiles[j].path+oldFiles[j].name)==0)
				{
					if (newFiles[i].md5hash.compare(oldFiles[j].md5hash)!=0)
					{
						result.push_back(newFiles[i]);
					}
					fileInLastUpdate=true;
					break;
				}
			}
			if (fileInLastUpdate==false)result.push_back(newFiles[i]);
			fileInLastUpdate=false;
		}
		return result;
	}


	/*
	Makes a new FileData vector containing all files with different names in relation to old files
	*/
	static std::vector <FileData> differentNamedFiles(std::vector <FileData> newFiles, std::vector <FileData> oldFiles)
	{
		//otherMag.files;
		std::vector <FileData> result;
		std::string fileFullPath;
		bool fileInLastUpdate = false;
		for (size_t i = 0; i < newFiles.size(); i++)
		{
			fileFullPath = newFiles[i].path + newFiles[i].name;

			for (size_t j = 0; j < oldFiles.size(); j++)
			{
				if (fileFullPath.compare(oldFiles[j].path + oldFiles[j].name) == 0)
				{
					fileInLastUpdate = true;
					break;
				}
			}
			if (fileInLastUpdate == false)result.push_back(newFiles[i]);
			fileInLastUpdate = false;
		}
		return result;
	}

	/*
	Makes a new FileData vector containing the files only newFiles have. potato
	*/
	static std::vector <FileData> differenceFilesExclusive(std::vector <FileData> newFiles, std::vector <FileData> oldFiles)
	{
		//otherMag.files;
		std::vector <FileData> result;
		std::string fileFullPath;
		std::string otherFileFullPath;
		bool fileInLastUpdate = false;
		for (size_t i = 0; i < newFiles.size(); i++)
		{
			fileFullPath = newFiles[i].path + newFiles[i].name;
			for (size_t j = 0; j < oldFiles.size(); j++) 
			{
				otherFileFullPath = oldFiles[j].path + oldFiles[j].name;
				if (fileFullPath.compare(otherFileFullPath) == 0)
				{
					fileInLastUpdate = true;
					break;
				}
			}
			if (fileInLastUpdate == false)result.push_back(newFiles[i]);
			fileInLastUpdate = false;
		}
		return result;
	}

	/*
	Save the FileManager data into a binary file
	*/
	bool saveToFile(std::string path)
	{
		return saveToFile(path,packageVersion);
	}

	/*
	Save the FileManager data into a binary file
	*/
	bool saveToFile(std::string path,int version)
	{
		FILE *binarFile;
		binarFile=fopen(path.c_str(),"wb");
		int totalSize=files.size();
		int size=0;
		if (binarFile)
		{
			writeStringToFile(basedir, basedir.size(), binarFile);
			fwrite(&version,sizeof(int),1,binarFile);
			fwrite(&totalSize,sizeof(int),1,binarFile);
			for (int i = 0; i < totalSize; i++)
			{
				writeStringToFile(files[i].path,files[i].path.size(),binarFile);
				writeStringToFile(files[i].name,files[i].name.size(),binarFile);
				fwrite(&files[i].size,sizeof(int),1,binarFile);
				writeStringToFile(files[i].md5hash,files[i].md5hash.size(),binarFile);
			}
			fclose(binarFile);
			return 1;
		}else
		{
			return false;
		}
	}
	
	/*
	Read the FileManager data into a binary file
	*/
	bool loadFromFile(std::string path)
	{

		FILE *binarFile;
		int totalSize;
		binarFile=fopen(path.c_str(),"rb");
		FileData file;
		if (binarFile)
		{
			readStringFromFile(&basedir, binarFile);
			fread(&packageVersion,sizeof(int),1,binarFile);
			fread(&totalSize,sizeof(int),1,binarFile);
			printf("%d \n",totalSize);
			
			for (int i = 0; i < totalSize; i++)
			{
				readStringFromFile(&file.path,binarFile);
				readStringFromFile(&file.name,binarFile);
				fread(&file.size,sizeof(int),1,binarFile);
				readStringFromFile(&file.md5hash,binarFile);
				files.push_back(file);
			}
			fclose(binarFile);
			return true;
		}else
		{
		return false;
		}
	}

};