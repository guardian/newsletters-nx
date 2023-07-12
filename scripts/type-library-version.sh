#!/usr/bin/env bash

# MOVING BACK TO SOURCE FOLDER
cd ./libs/editorial-newsletters-ts

# check there are valid changesets to add to the next version
echo "Checking for changeset files for editorial-newsletters-ts project"
npx changeset status
status=$?
if [ $status -gt 0 ]
	then
	exit 1
fi


# https://github.com/changesets/changesets/blob/main/packages/cli/README.md#version :
npx changeset version

echo "Version number for editorial-newsletters-ts project updated."
echo "Please do not attempt to publish to NPM locally - this will be done within the github action for merging to main."



