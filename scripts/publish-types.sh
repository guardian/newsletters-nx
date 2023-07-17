#!/bin/bash

pushd libs/editorial-newsletters-ts || exit

npm publish --access public

exit_code=$?

if [[ $exit_code -eq 1 ]]; then
	# this is brittle. We want to error when it 's something other than this version exists. Will do for now.
    if [[ $(npm publish 2>&1) == *"cannot publish over"* ]]; then
        echo "The current package version has already been published. Exiting..."
    else
        echo "Error: Publishing failed."
        exit 1
    fi
else
    echo "Success: Package published successfully."
fi

popd || exit
