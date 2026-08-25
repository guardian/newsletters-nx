# newsletters-data-client

This library provides:

- schemas and types used by other projects in this repo, notably the `newsletterDataSchema` and the `NewsletterData` type inferred from it
- shared utility functions for handling newletter data
- the class definitions for service classes used to interact with AWS services such as S3 and SES

## How not to break the API

Merging changes to this library, especially to the `newsletterDataSchema` or the sub-schemas it uses, can potentially make newsletters disappear from the API data in production. Merging changes will not change the data persisted in s3, but the `newsletterDataSchema` is used validate that data and filter out any items that do not conform to the schema.

For example, if you made an optional property required or change the shape of an object field, any newsletters in s3 that no longer conformed would be excluded from the API response. Reverting the change would restore the items in the API (assuming the files in s3 had not been removed).

There is a [unit test for the schema validation function](./src/lib/schemas/newsletter-data-type.spec.ts) which checks that changes to the schema will not exclude any of the newsletters in a fixture file containing an array of newsletters. There is a Deno script for updating the fixture file with a copy of the current newsletters data from the PROD api - it can be run from the project root with:

```bash
./tools/scripts/fetch-sample-data-fixtures.sh
```

### Strategies for breaking changes

If you do need to make a breaking change to the schema, such as adding a new required string field, this may have to be done in stages E.G. :

- merge PR to add the new field as an optional property
- backfill all existing newsletters to have the new field
- run the script to update the fixture file
- merge the PR to make the new field required - the test should fail if any newsletters in the fixture woudl be excluded
