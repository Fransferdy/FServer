#include <string>
#include <map>
#include <filesystem>

class CachedFileData
{
public:
    std::string path;
    size_t size;
    char *data;
    std::filesystem::file_time_type lastWrite;

    ~CachedFileData()
    {
        free(data);
    }
};

class SmartFileReader
{
    std::map<std::string,CachedFileData*> files;
    void getFile(std::string patharg)
    {
        CachedFileData * newFile = new CachedFileData();

        std::filesystem::path path(patharg);
        std::filesystem::file_time_type lastWrite;
        newFile->lastWrite = std::filesystem::last_write_time(path);
        newFile->
    }
}