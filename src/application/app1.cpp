#include <iostream>
#include <windows.h>

#include <iostream>
#include <string>
#include <map>
#include <functional>
#include <algorithm>
#include "FPage.hpp"
#include "FApplication.hpp"

#define DLLAPI __declspec(dllexport)


Fapplication application;

void printAndWait(std::string what)
{
    std::cout << what << std::endl;
    system("pause");
};


int executePagepp(char * bufferizedRequest, char* pageMapping,int bufferLength)
{
    FRequest request;
    CBuffer buffer;
    buffer.addBuffer(bufferizedRequest,bufferLength);
    request.readFromBuffer(&buffer);
    application.answer(&request,pageMapping);

    buffer.clear();
    buffer.writeint(0);
    request.writeToBuffer(&buffer);
    buffer.replaceint(buffer.BuffSize,0);

    
    int bufferHandle = application.addPageResult(&buffer);

    return bufferHandle;
}
char * getResultPage(int handle)
{
    return application.getResultPage(handle);
}
void deleteResultPage(int handle)
{
    application.deleteResultPage(handle);
}

char * getApplicationDefinitions()
{
    CBuffer buffer;
    buffer.clear();
    buffer.writeint(0);
    application.writeToBuffer(&buffer);
    buffer.replaceint(buffer.BuffSize,0);
    char * retData = (char*)malloc(buffer.BuffSize);
    memcpy(retData,buffer.data,buffer.BuffSize);
    return retData;
}


extern "C"
{
    DLLAPI int executepage(char * source,char* pageMapping,int bufferLength)
    {
        return executePagepp(source,pageMapping,bufferLength); 
    }
    DLLAPI char* getPageResult(int handle)
    {
        return getResultPage(handle); 
    }
    DLLAPI void deletePageResult(int handle)
    {
        return deleteResultPage(handle); 
    }
    DLLAPI char* getApp()
    {
        return getApplicationDefinitions();
    }
}

extern "C" DLLAPI BOOL APIENTRY DllMain(HINSTANCE hinstDLL, DWORD reason_for_call, LPVOID lpvReserved)
{
    switch (reason_for_call)
    {
        case DLL_PROCESS_ATTACH:
            // attach to process
            application.start();
            std::cout << "P Sizes: " << application.getPagesAmount() << std::endl;
            printf("DLL PROCESS ATTACHED\n");
            // return FALSE to fail DLL load
            break;

        case DLL_PROCESS_DETACH:
            printf("DLL PROCESS DETTACHED\n");
            // detach from process
            break;

        case DLL_THREAD_ATTACH:
            printf("DLL THREAD ATTACHED\n");
            // attach to thread
            break;

        case DLL_THREAD_DETACH:
            printf("DLL THREAD DETTACHED\n");
            // detach from thread
            break;
        default:
            printf("UNRECOGNIZED REASON, %d",reason_for_call);
    }
    return TRUE; // succesful
}
