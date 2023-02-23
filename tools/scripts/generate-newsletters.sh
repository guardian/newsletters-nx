#! /bin/bash

red=31
amber=33
green=32
background_color=48

if [[ $(deno --version) ]];
	then printf "\n\033[1;${green};${background_color}mGenerating fake newsletters...\n\n\033[0m"
	deno run --allow-write ./tools/scripts/deno/generate-newsletters.js
	else printf "\n\033[1;${red};${background_color}mNo Deno version found. Please install Deno first.\033[0m\n\033[1;${amber};${background_color}mInstructions here: https://deno.land/manual@v1.30.3/getting_started/installation#download-and-install\033[0m"
fi;

