#!/bin/bash

pushd libs/editorial-newsletters-ts || exit

npm publish --access public

exit_code=$?

if [[ $exit_code -eq 1 ]]; then
	# swallow failure if package already exists
    if [[ $(npm publish 2>&1) == *"cannot publish over"* ]]; then
        echo "The current package has already been published. Exiting..."
    else
        echo "Error: Publishing failed."
        exit 1
    fi
else
    echo "Success: Package published successfully."
fi

popd || exit
