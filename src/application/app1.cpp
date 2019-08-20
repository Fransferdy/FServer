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

char* executepage(char * bufferizedRequest, char* pageMapping,int length)
{
    FRequest request;
    CBuffer buffer;
    buffer.addBuffer(bufferizedRequest,length);
    request.readFromBuffer(&buffer);
    application.answer(&request,pageMapping);
    buffer.clear();
    buffer.writeint(0);
    request.writeToBuffer(&buffer);
    buffer.replaceint(buffer.BuffSize,0);
    return buffer.data;
}


extern "C"
{
    char* executepage(char * source)
    {
        return executePage(source); 
    }
}




extern "C" DLLAPI BOOL APIENTRY DllMain(HINSTANCE hinstDLL, DWORD reason_for_call, LPVOID lpvReserved)
{
    switch (reason_for_call)
    {
        case DLL_PROCESS_ATTACH:
            // attach to process
            application.start();
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
    }
    return TRUE; // succesful
}
