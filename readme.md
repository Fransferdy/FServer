
# Building in Windows

I use mingw-64 to build FServer in windows, the compiler you use for your app indepents on how FServer was built.

I install mingw-64 using MSYS2, because it seems to be the best most updated project. This is good because it is easier to make the project cross platform.

# Getting MSYS2

The best way to work with this project is to get MYSYS2
https://www.msys2.org/
It is best if you download the x86_64 version.
Follow all steps in their installation tutorial, until the end of the page.
It is best if you use the default location for installation (c://mysys64/) this will make all paths defined in this workspace to work by default.

# Installing GCC - G++

In this section, everything should be run using the MYSYS2 shell.
Once you have MYSYS2 you should update it using 

pacman -Syuu

Everytime you you finish running "pacman -Syuu" you have to close the terminal window, open it again and run the command again, until there is nothing else
to update.

After that you need to install developer tools, the following command will get you everything you need with the right configuration.

pacman -S --needed base-devel mingw-w64-i686-toolchain mingw-w64-x86_64-toolchain \
                    git subversion mercurial \
                    mingw-w64-i686-cmake mingw-w64-x86_64-cmake

For more info look here:
FullTutorial: https://github.com/orlp/dev-on-windows/wiki/Installing-GCC--&-MSYS2

# Configuring VS Code

When you open VSCode, it will ask if you allow the project settings to change the vscode environment (in the right bottom corner), allow everything to make intellisense work.

# Installing Dependecies

Once you have the toolchain installed it is time to install the depencies.

pacman -S mingw64/mingw-w64-x86_64-libmicrohttpd

# Building FServer

Go to the project folder.
Before you can build FServer you need to create two folders.

mkdir obj

mkdir obj/src

mkdir deployfiles/runningapps

After that just run 

make 

In the project folder.

You can build a sample container application and deploy it by running

make test1 ; mv ./src/application/app1.dll ./deployfiles/runningapps