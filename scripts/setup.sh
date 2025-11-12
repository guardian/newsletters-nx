#!/usr/bin/env bash

SCRIPT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" || exit ; pwd -P )

# Copy the .env file
NEWSLETTERS_API_PROJECT_PATH=$SCRIPT_PATH/../apps/newsletters-api

copy_env_file() {
		cp "$NEWSLETTERS_API_PROJECT_PATH/env.local.example.txt" "$NEWSLETTERS_API_PROJECT_PATH/.env.local";
		echo "The .env.local file has been $1."
}

setupNginx() {
	while true; do
          read -p "Setup dev-nginx? (y/n) " yn
          case $yn in
              [Yy]* ) dev-nginx setup-app "$SCRIPT_PATH"/../nginx/nginx-mapping.yml; break;;
              [Nn]* ) continue ;;
              * ) echo "Please select yes or no.";;
          esac
      done

}

# check if the config file already exists
if [ -f "$NEWSLETTERS_API_PROJECT_PATH/.env.local" ]; then
		while true; do
        read -p "The .env.local file already exists. Do you want to replace the file? (y/n) " yn
        case $yn in
            [Yy]* ) copy_env_file "replaced"; break;;
            [Nn]* ) break ;;
            * ) echo "Please answer yes or no.";;
        esac
    done
else
		copy_env_file "created"
fi

setupNginx
