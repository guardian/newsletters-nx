#! /bin/bash

# ---- Exit if using yarn ------

text_color=35 # Purple
background_color=48
please_use_npm="█▀█ █░░ █▀▀ ▄▀█ █▀ █▀▀   █░█ █▀ █▀▀   █▄░█ █▀█ █▀▄▀█
█▀▀ █▄▄ ██▄ █▀█ ▄█ ██▄   █▄█ ▄█ ██▄   █░▀█ █▀▀ █░▀░█"

if [[ $npm_execpath =~ 'yarn' ]];
	then echo -e "\033[1;${text_color};${background_color}m${please_use_npm}\033[0m" && exit 1;
fi
