#!/usr/bin/env bash

# MOVING BACK TO SOURCE FOLDER
cd ./libs/editorial-newsletters-ts

# check there are valid changesets to add to the next version
npx changeset status
status=$?
if [ $status -gt 0 ]
	then
	exit 1
fi


# https://github.com/changesets/changesets/blob/main/packages/cli/README.md#version :
npx changeset version
# From changeset docs:
# "We recommend making sure changes made from this command are merged back into the base branch before you run publish."

# MOVING BACK TO ROOT
cd ../../
nx run editorial-newsletters-ts:build

# MOVING TO DIST FOLDER
cd ./dist/libs/editorial-newsletters-ts
echo "publishing package"
npx changeset publish
# https://github.com/guardian/recommendations/blob/main/npm-packages.md#publishing
# For this to work, need the NPM_TOKEN secret


# MOVING BACK TO ROOT
cd ../../
