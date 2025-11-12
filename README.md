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

The app will be available at [here](https://newsletters-tool.local.dev-gutools.co.uk/)

See the documentation for the [API](apps/newsletters-api/README.md) for the configuration options.

## Development

**NOTE** Merging changes to the 'newsletters-data-client' library can impact the newsletters data used in PROD by other Guardian applications. Please check the notes at the [README for that project](libs/newsletters-data-client/README.md) for more details.

**NOTE** Any changes to the legacy API data structure should be communicated to the [Data Design](mailto:data.design@theguardian.com) **before** merging to main.

## UI Tool Deployment

The newsletters-tool is deployed to PROD
https://newsletters-tool.gutools.co.uk/

CODE environment (for testing) deployed to:
https://newsletters-tool.code.dev-gutools.co.uk/

Continuous Integration (CI) is configured on this Repo. Merging to main will trigger redeployment to of PROD using [RiffRaff](https://riffraff.gutools.co.uk/). To deploy a build to CODE, push your branch to github and create a PR (draft will do). The build can be selected and deployed from [RiffRaff's deploy page](https://riffraff.gutools.co.uk/deployment/request) (project=newsletters::newsletters-tool).

## User Permissions for the UI Tool

Users need to log to a Guardian account in using google auth to access the UI. The web application auth configuration in the google console can be accessed (requires membership of the newsletters admin group) at
https://console.cloud.google.com/apis/credentials?project=newsletter-source-api

By default, Guardian staff have "viewer" permissions, which lets them access the tool but not make any changes to the data. Spefic users can be granted extra permissions by updating the userPermissions data, which is held in the AWS Parameter store in the 'frontend' account (accessable via [Janus](https://janus.gutools.co.uk/)). There is a separate param for each stage:

-   /CODE/newsletters/newsletters-tool/userPermissions
-   /DEV/newsletters/newsletters-tool/userPermissions
-   /PROD/newsletters/newsletters-tool/userPermissions

The API application will check for updates to the data once per 15 minute interval - so updates to the data take up to 15 minutes to take effect for the user in the UI.

**TO DO** - it would be peferable for access to the Tool to be managed using the existing [Permissions system](https://github.com/guardian/permissions).

[![](https://mermaid.ink/img/pako:eNplUc1ugzAMfhUr5_ICHDZR6KoeNiFtPSUcMmJKNEg2J6hCpe8-U4q0ajlZ8ffjz76I2hsUqWg6f65bTRE-CuWA3xaS5Gk6BiQoyTe2wwmypZVJ-Ybn0GGMSCE5HqrqBu78CaybYCvl3vtTh5ANsa2qO-uG-fRmTCErD0D4M2CISrkWtUnh0Sp_9GDCqpPPOoWUpSbdQ4iecG0Vs8PAOgF0XWMIYHTUU34n_gu0u7R6hfIc80SW0HDZeFoHfIbrwt_NfOenF5kt4gU6i6b60x0xTHtZIjG_XwUqsRE9Uq-t4U1fZrgSscUelUi5NJq-lFDuyjg9RP8-ulqkkQbciOGbE2Bh9YnDirTRXeBfNJZjvy6nu13w-gtKPpnr?type=png)](https://mermaid.live/edit#pako:eNplUc1ugzAMfhUr5_ICHDZR6KoeNiFtPSUcMmJKNEg2J6hCpe8-U4q0ajlZ8ffjz76I2hsUqWg6f65bTRE-CuWA3xaS5Gk6BiQoyTe2wwmypZVJ-Ybn0GGMSCE5HqrqBu78CaybYCvl3vtTh5ANsa2qO-uG-fRmTCErD0D4M2CISrkWtUnh0Sp_9GDCqpPPOoWUpSbdQ4iecG0Vs8PAOgF0XWMIYHTUU34n_gu0u7R6hfIc80SW0HDZeFoHfIbrwt_NfOenF5kt4gU6i6b60x0xTHtZIjG_XwUqsRE9Uq-t4U1fZrgSscUelUi5NJq-lFDuyjg9RP8-ulqkkQbciOGbE2Bh9YnDirTRXeBfNJZjvy6nu13w-gtKPpnr)
