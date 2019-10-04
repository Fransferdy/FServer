#include <string>
#include <map>
#include <filesystem>
#include <iostream>
#include <fstream>

class CachedFileData
{
public:
    std::string path;
    size_t size;
    char *data;
    std::filesystem::file_time_type lastWrite;
    size_t accessNumber;

    CachedFileData()
    {
        data = NULL;
    }
    ~CachedFileData()
    {
        if (data!=NULL)
            delete data;
    }
};

class SmartFileReader
{
    static std::map<std::string,CachedFileData*> files;
    static char* getFile(std::string patharg)
    {
        CachedFileData * newFile = new CachedFileData();

        std::filesystem::path path(patharg);
        std::filesystem::file_time_type lastWrite;
        try {
            newFile->lastWrite = std::filesystem::last_write_time(path);
            newFile->size = std::filesystem::file_size(path);

            CachedFileData *ret;
            bool addNewFile = false;
            try
            {
                ret = files.at(patharg);
                if (!(ret->lastWrite.time_since_epoch()<newFile->lastWrite.time_since_epoch() ))
                {
                    delete newFile;
                    return ret->data;
                }
                else
                {
                    delete ret;
                    files.erase(patharg);
                    addNewFile=true;
                }
            }catch(std::out_of_range e)
            {
                addNewFile=true;
            }
            if (addNewFile)
            {
                std::ifstream filedata (patharg, std::ios::binary);
                newFile->data = new char [newFile->size];
                filedata.read(newFile->data,newFile->size);
                filedata.close();
                files.insert(std::pair<std::string,CachedFileData*>(patharg,newFile) );
                ret = newFile;
            }
            
            return ret->data;
        }catch(std::filesystem::filesystem_error& e) 
        {
            std::cout<< e.what() << std::endl;
            return NULL;
        }

    }
};