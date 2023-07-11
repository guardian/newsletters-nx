#!/usr/bin/env bash

# MOVING BACK TO SOURCE FOLDER
cd ./libs/editorial-newsletters-ts

npx changeset
npx changeset version

# MOVING BACK TO ROOT
cd ../../
nx run editorial-newsletters-ts:build

# MOVING TO DIST FOLDER
cd ./dist/libs/editorial-newsletters-ts
echo "publishing dry run... "
npm publish --dry-run

# MOVING BACK TO ROOT
cd ../../
