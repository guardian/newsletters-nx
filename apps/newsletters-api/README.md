# newsletters-api

The Express backend: storage, auth and authorisation, workflow routes, and
serving the UI bundle.

For setup, environment variables and permission levels, see
[Local development](../../docs/local-development.md).

## Serving the UI

On the default configuration the API serves the UI on its index page, so
http://localhost:3000/ shows the UI while API responses stay on their own paths,
e.g. http://localhost:3000/api/newsletters.

Set `NEWSLETTERS_UI_SERVE=false` to turn that off — this is how the
`readonly-newsletters` deployment runs. See
[Infrastructure](../../docs/infrastructure.md#the-two-apps).
