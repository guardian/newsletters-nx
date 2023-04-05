# Newsletters API

## Running locally

The API can be run locally from the _workspace_ root rather than the _project_ root - IE /newsletters-nx/ not /newsletters-nx/apps/newsletters-api/
From the _workspace_ root: `npm run dev` will run the API on http://localhost:3000/

On the default configuration, the API serves a the UI on its index page, so http://localhost:3000/ will display the UI, but the API response can be accessed at thier path, e.g. http://localhost:3000/api/newsletters

### Configuring the local instance with environment variables

Copy **apps/newsletters-api/env.local.example.txt** and rename it **.env.local**. This file will be .gitignored.

By default, the local application uses and in-memory storage system(so data you enter will not persist when the application restarts). To use an S3 bucket for storage instead, you will need to set the s3 parameters in **.env.local**. You will need credentials for the right AWS account (IE the account the S3 bucket it in) from [Janus](https://janus.gutools.co.uk/), for the API to be able to access the bucket and read/write files.

⚠ Avoid committing the names of S3 bucket into the repository. **.env.local** is gitignored. You should not need to enter them in any other files.

⚠☣☢ Do not give your local instance access to the PROD S3 bucket containing the live data! ⚠☣☢
