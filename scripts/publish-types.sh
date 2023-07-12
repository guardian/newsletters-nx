#!/usr/bin/env bash

# MOVING TO DIST FOLDER
cd ./dist/libs/editorial-newsletters-ts
echo "publishing package"
npx changeset publish
# https://github.com/guardian/recommendations/blob/main/npm-packages.md#publishing
# For this to work, need the NPM_TOKEN secret


