#include <string>
#include <map>
#include <filesystem>
#include <iostream>
#include <fstream>
#include <chrono>

#define MEGABYTE 1048576

class CachedFileData
{
public:
    std::string path;
    size_t size;
    char *data;
    std::filesystem::file_time_type lastWrite;;
    std::chrono::time_point<std::chrono::system_clock> timeWhenLoaded; 
    size_t accessNumber;

    CachedFileData()
    {
        timeWhenLoaded = std::chrono::system_clock::now();
        data = NULL;
    }
    ~CachedFileData()
    {
        if (data!=NULL)
            delete data;
    }
    double getCacheValue()
    {
        return (double)accessNumber / (double)(computeFileLoadedPeriodInSeconds()+1);
    }
    int64_t computeFileLoadedPeriodInSeconds()
    {
        return (std::chrono::duration_cast<std::chrono::seconds>(( std::chrono::system_clock::now()-timeWhenLoaded )).count());
    }
    void refreshDiskLoadCheck()
    {
        timeWhenLoaded = std::chrono::system_clock::now();
    }
};

class SmartFileReader
{
private:
    std::map<std::string,CachedFileData*> files;
    double maxAllowedCacheMemoryUse;
    double totalMemoryInUse;
    int64_t gracePeriod;
    void cleanCache()
    {
        double lowestCacheValue = 9999999;
        if (maxAllowedCacheMemoryUse==0)
            return;

        std::cout <<"Cache "<< (totalMemoryInUse)/(maxAllowedCacheMemoryUse)*100 << "% full" << std::endl;
        if (files.size()>0)
        {
            if ((totalMemoryInUse)/(maxAllowedCacheMemoryUse)>0.9)
            {
                CachedFileData* del;
                for( auto const& [key, fileData] : files )
                {
                    double thisCacheValue = fileData->getCacheValue();
                    if (thisCacheValue<lowestCacheValue)
                    {
                        lowestCacheValue = thisCacheValue;
                        del = fileData;
                    }
                }
                std::cout << "Removing " << del->path << " Cache Value " << lowestCacheValue << std::endl;
                removeFile(del);
                std::cout << "TotalCachedMemory After cleanup " << totalMemoryInUse << "b , " << (totalMemoryInUse/MEGABYTE) <<"/" << (maxAllowedCacheMemoryUse/MEGABYTE) << "mb" << std::endl;
            }
        }
    }
    void removeFile(CachedFileData* del)
    {
            totalMemoryInUse-= del->size;
            files.erase(del->path);
            delete del;
    }


public:
    /*@param1: MaxAllowed Memory Use in Mega Bytes, use 0 for no limits*/
    SmartFileReader(double maxAllowedCacheMemoryUseArg)
    {
        setMaxAllowedCacheMemoryUse(maxAllowedCacheMemoryUseArg);
        totalMemoryInUse=0;
        gracePeriod=0;
    }
    SmartFileReader()
    {
        setMaxAllowedCacheMemoryUse(500);
        totalMemoryInUse=0;
        gracePeriod=0;
    }
    /*@param1: MaxAllowed Memory Use in Mega Bytes, use 0 for no limits*/
    void setMaxAllowedCacheMemoryUse(double maxAllowedCacheMemoryUseArg)
    {
        maxAllowedCacheMemoryUse = maxAllowedCacheMemoryUseArg*MEGABYTE;
    }
    /*@param1: how many seconds the cache manager will not check the disk for file change*/
    void setFileCacheGracePeriod(double gracePeriodArg)
    {
        gracePeriod = gracePeriodArg;
    }

    CachedFileData* getFile(std::string patharg)
    {
        CachedFileData * newFile = new CachedFileData();

        std::filesystem::path path(patharg);
        std::filesystem::file_time_type lastWrite;
        try {
            CachedFileData *ret;
            bool addNewFile = false;
            try
            {
                ret = files.at(patharg);
                if (ret->computeFileLoadedPeriodInSeconds()>gracePeriod)
                {
                    newFile->lastWrite = std::filesystem::last_write_time(path);
                    newFile->size = std::filesystem::file_size(path);
                    if (!(ret->lastWrite.time_since_epoch()<newFile->lastWrite.time_since_epoch() ))
                    {
                        delete newFile;
                        ret->refreshDiskLoadCheck();
                    }
                    else
                    {
                        removeFile(ret);
                        addNewFile=true;
                    }
                }
                else
                {
                    std::cout << "File still in grace period" << std::endl;
                }
            }catch(std::out_of_range e)
            {
                addNewFile=true;
                newFile->lastWrite = std::filesystem::last_write_time(path);
                newFile->size = std::filesystem::file_size(path);
            }
            if (addNewFile)
            {
                cleanCache();
                std::ifstream filedata (patharg, std::ios::binary);
                newFile->data = new char [newFile->size];
                filedata.read(newFile->data,newFile->size);
                filedata.close();
                files.insert(std::pair<std::string,CachedFileData*>(patharg,newFile) );
                ret = newFile;
                totalMemoryInUse+=ret->size;
                std::cout << "File loaded from disk: TotalCachedMemory " << totalMemoryInUse << "b , " << (totalMemoryInUse/MEGABYTE) <<"/" << (maxAllowedCacheMemoryUse/MEGABYTE) << "mb" << std::endl;
            }else
            {
                std::cout << "File loaded from cache " <<std::endl;
            }
            ret->accessNumber++;
            return ret;
        }catch(std::filesystem::filesystem_error& e) 
        {
            std::cout<< e.what() << std::endl;
            return NULL;
        }

        std::cout<< "SmartFileReader Line 139, reached a supposed impossible path" << std::endl;
        return NULL;
    }

};