# NewslettersNx

This is a monorepo for:

-   defining the data model for editorial newsletters at the Guardian
-   serving an API to access the newsletter data
-   serving a user interface for editorial to manage their newsletters
-   the state-machine library used between UI and API

## Running locally

To run the UI and API locally with the default options:

### Run set-up script

```bash
./scripts/setup.sh
```

### Run the app

fetch some `frontend` credentials from [Janus](https://janus.gutools.co.uk/credentials?permissionId=frontend-dev&tzOffset=1)

`npm run dev`

See the documentation for the [API](apps/newsletters-api/README.md) for the configuration options.

## Development

**NOTE** Merging changes to the 'newsletters-data-client' library can impact the newsletters data used in PROD by other Guardian applications. Please check the notes at the [README for that project](libs/newsletters-data-client/README.md) for more details.

**NOTE** Any changes to the legacy API data structure should be communicated to the [Data Design](mailto:data.design@theguardian.com) **before** merging to main.

## UI Tool Deployment and Access

The newsletters-tool is deployed to PROD
https://newsletters-tool.gutools.co.uk/

CODE environment (for testing) deployed to:
https://newsletters-tool.code.dev-gutools.co.uk/

Continuous Integration (CI) is configured on this Repo. Merging to main will trigger redeployment to of PROD using [RiffRaff](https://riffraff.gutools.co.uk/). To deploy a build to CODE, push your branch to github and create a PR (draft will do). The build can be selected and deployed from [RiffRaff's deploy page](https://riffraff.gutools.co.uk/deployment/request) (project=newsletters::newsletters-tool).

Users need to log to a Guardian account in using google auth to access the UI. The web application auth configuration in the google console can be accessed (requires membership of the newsletters admin group) at
https://console.cloud.google.com/apis/credentials?project=newsletter-source-api
