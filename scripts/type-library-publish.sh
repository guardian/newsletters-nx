#!/usr/bin/env bash
# MOVING BACK TO SOURCE FOLDER
cd ./libs/editorial-newsletters-ts || exit

npx changeset publish --access=public
