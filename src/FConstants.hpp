
#pragma once

#define PMETHOD_ERROR = "<html><head><title>Illegal request</title></head><body>Go away.</body></html>"
#define PNOT_FOUND "<html><head><title>Page not found 404</title></head><body>Page not found 404</body></html>"
#define PFORBIDDEN "<html><head><title>Forbidden</title></head><body>Forbidden 403</body></html>"
#define PINTERNAL_ERROR "<html><head><title>Internal Error</title></head><body>Internal Error</body></html>"

enum ServerStatus{
	UNITIALIZED,
	RUNNING,
	STARTUP_ERROR,
	CLOSED,
	NOTLISTENING
};