#!/bin/bash

# Run npm publish command
npm publish --access public

# Check the exit code of the previous command
exit_code=$?

# If the exit code is 1 (error), check if it's a 403 error
if [[ $exit_code -eq 1 ]]; then
    if [[ $(npm publish 2>&1) == *"403"* ]]; then
        echo "Error: Publishing failed due to a 403 Forbidden error. Package may not have required an update"
    else
        echo "Error: Publishing failed."
    fi
else
    echo "Success: Package published successfully."
fi
