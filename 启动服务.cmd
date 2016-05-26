@echo off 
cls 
title webpack
rem color 04

:init
	rem cls
	echo -------------------------------------------------
	echo                    启动服务
	echo -------------------------------------------------
	echo.
	npm run start && echo 启动成功 & pause>nul 
	goto end
:end
	echo  按任意键退出...
	pause>nul && exit


	
	
	