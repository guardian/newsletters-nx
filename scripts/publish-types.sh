#!/bin/bash

pushd libs/editorial-newsletters-ts || exit

npm publish --access public

exit_code=$?

if [[ $exit_code -eq 1 ]]; then
    if [[ $(npm publish 2>&1) == *"403"* ]]; then
        echo "Error: Publishing failed due to a 403 Forbidden error. Package may not have required an update"
    else
        echo "Error: Publishing failed."
        exit 1
    fi
else
    echo "Success: Package published successfully."
fi

popd || exit
