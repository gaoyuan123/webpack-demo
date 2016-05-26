@echo off 
cls 
title webpack
rem color 04

:init
	rem cls
	echo -------------------------------------------------
	echo                    编译发布
	echo -------------------------------------------------
	echo.
	npm run build && echo 发布成功,按任意键退出... & pause>nul


	
	
	