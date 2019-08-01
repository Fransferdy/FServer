##################Pasta:sub-make ## Makefile ###################
CC=g++
CPPFLAGS=-fno-trapping-math -O3 -std=c++17 -D_FORCE_INLINES
LIBS =-lm -lmicrohttpd #### -lcurl####
EXEC=fserver.exe
SRC_DIR := src
SRC_FILES := $(wildcard $(SRC_DIR)/*.cpp)
DEP_FILES := $(wildcard $(SRC_DIR)/*.h)
DEP_FILES2 := $(wildcard $(SRC_DIR)/*.hpp)
_OBJ= $(SRC_FILES:.cpp=.o)
ODIR=obj
OBJ = $(patsubst %,$(ODIR)/%,$(_OBJ))

all: $(EXEC)
	@echo "Compiling All"
	
fserver.exe: $(OBJ)
# $@ = nome do case
# $^ = objects do case
	$(CC) -o $@ $^ $(LIBS)

$(ODIR)/%.o: %.cpp $(DEP_FILES) $(DEP_FILES2)
	$(CC) -o $@ -c $< $(CPPFLAGS)



.PHONY: clean cleanall
clean: 
	rm -rf $(ODIR)/*.o
	rm -rf $(ODIR)/src/*.o
cleanall: clean
	rm -rf $(EXEC)
