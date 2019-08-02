#include <iostream>
#include <windows.h>

#define DLLAPI __declspec(dllexport)

MyApplication application;

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
