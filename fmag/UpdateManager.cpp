// UpdateManager.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include "FilesManager.h"
#include "bsdiff.h"

/*
void populateFromDir(std::string path)
{
	DIR *dir;
	struct dirent *ent;
	std::string fileName;
	if ((dir = opendir (path.c_str())) != NULL) 
	{
		//print all the files and directories within directory 
		while ((ent = readdir (dir)) != NULL) 
		{
			if (ent->d_type==DT_DIR)
			{
				if (strstr(ent->d_name,".")!=NULL && strlen(ent->d_name)==1)continue;
				if (strstr(ent->d_name,"..")!=NULL)continue;
				populateFromDir(path+ent->d_name+"\\");
			}
			printf ("Path: %s \n, File Name: %s \n, type %d\n\n",path.c_str(), ent->d_name,ent->d_type);
			//fileName = ent->d_name;
		}
		closedir (dir);
	}
	else
	{
	// could not open directory 
	perror ("Could Not Open Directory \n");
	}
}
*/

int _tmain(int argc, _TCHAR* argv[])
{
	std::string launcherName = "Pokemon Launcher V2.exe";
	std::string launcherUpdaterName = "Pokemon Updater For Launcher.exe";
	std::string fullpath;
	FilesManager fmag(0);
	FilesManager base(0);
	FilesManager updateBase(0);
	FilesManager patches(0);
	FilesManager flauncher(0);
	std::vector <FileData> updateFiles;
	std::vector <FileData> patchFiles;
	FileData patch;

	//FilesManager fmag2;
	std::cout << "Starting Patch Create" << std::endl;

	std::vector <FileData> launcherDataList;
	FileData launcherData;
	launcherData.name = launcherName;
	launcherData.path = "";
	launcherDataList.push_back(launcherData);
	flauncher.setFiles(launcherDataList);
	flauncher.filesGetInfo();
	flauncher.saveToFile("launcher.updata");

	launcherDataList.clear();
	launcherData.name = launcherUpdaterName;
	launcherData.path = "";
	launcherDataList.push_back(launcherData);
	flauncher.setFiles(launcherDataList);
	flauncher.filesGetInfo();

	launcherDataList = flauncher.getFiles();
	launcherDataList[0].path = "util\\";
	flauncher.clearFiles();
	flauncher.setFiles(launcherDataList);
	flauncher.saveToFile("launcherupdater.updata");

	std::cout << "Reading /game" << std::endl;
	fmag.populateFromDir("game\\");
	fmag.filesGetInfo();
	fmag.saveToFile("game.updata");

	std::cout << "Reading /base" << std::endl;
	base.populateFromDir("base\\");
	base.filesGetInfo();

	std::cout << "Copying new game files to base" << std::endl;

	updateBase.setFiles(FilesManager::differentNamedFiles(fmag.getFiles(), base.getFiles()));
	//updateBase.filesPrintAll();
	
	updateFiles = updateBase.getFiles();

	for (size_t i = 0; i < updateFiles.size(); i++)
	{
		fullpath = updateFiles[i].path + updateFiles[i].name;
		FilesManager::createDir("base\\" + updateFiles[i].path);
		FilesManager::copyFileTo("game\\" + fullpath, "base\\" + fullpath);
	}

	base.clearFiles();
	base.populateFromDir("base\\");
	base.filesGetInfo();
	base.saveToFile("base.updata");

	updateBase.setFiles(FilesManager::differenceFiles(fmag.getFiles(), base.getFiles()));
	updateFiles = updateBase.getFiles();
	//updateBase.filesPrintAll();
	int ret;
	bool skip=false;
	patches.loadFromFile("patchmeta.updata");
	patchFiles = patches.getFiles();

	std::cout << "Creating Patches" << std::endl;

	for (size_t i = 0; i < updateFiles.size(); i++)
	{
		fullpath = updateFiles[i].path + updateFiles[i].name;
		for (size_t j = 0; j < patchFiles.size(); j++)
		{
			if (fullpath.compare(patchFiles[j].path + patchFiles[j].name) == 0)
			{
				if (updateFiles[i].md5hash.compare(patchFiles[j].md5hash) == 0)
				{
					std::cout << fullpath << " patch is up to date." << std::endl;
					skip = true;
					break;
				}
			}
		}
		if (skip == false)
		{
			std::cout << "Creating patch for " << fullpath << std::endl;
			FilesManager::createDir("patch\\" + updateFiles[i].path);
			ret = createPatch(("base\\" + fullpath).c_str(), ("game\\" + fullpath).c_str(), ("patch\\" + fullpath + ".patch").c_str());
			if (ret == 0)
			{
				patch.md5hash = updateFiles[i].md5hash;
				patch.name = updateFiles[i].name;
				patch.path = updateFiles[i].path;
				patchFiles.push_back(patch);
				patches.setFiles(patchFiles);
				patches.saveToFile("patchmeta.updata");
			}
			std::cout << ret << std::endl;
		}
		skip = false;
	}
	patches.clearFiles();
	patches.populateFromDir("patch\\");
	patches.filesGetInfo();
	patches.saveToFile("patchfiles.updata");
	
	std::cout << "Patcher Done" << std::endl;
	//fmag.filesPrintAll();

	//fmag.saveToFile("update.updata");
	//fmag.filesPrintAll();

	/*
	fmag.clearFiles(); 
	fmag.loadFromFile("update.data");
	fmag.filesPrintAll();
	system("pause");
	fmag2.populateFromDir("C:\\Dev\\Projects\\Pokemon Launcher V2\\Pokemon Launcher V2\\game2\\");
	fmag2.filesGetInfo();
	fmag2.filesPrintAll();
	*/
	//system("pause");
	return 0;
}

