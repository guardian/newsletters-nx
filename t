
> newsletters-nx@0.0.0 lint
> nx run-many --target=lint --all


 >  NX   Running target lint for 6 projects:

    - newsletters-data-client
    - newsletter-workflow
    - metrics-metrics-api
    - newsletters-api
    - newsletters-ui
    - state-machine

 

> nx run newsletters-data-client:lint  [existing outputs match the cache, left as is]


Linting "newsletters-data-client"...

All files pass linting.


> nx run state-machine:lint  [existing outputs match the cache, left as is]


Linting "state-machine"...

All files pass linting.


> nx run newsletter-workflow:lint  [existing outputs match the cache, left as is]


Linting "newsletter-workflow"...

All files pass linting.


> nx run newsletters-api:lint  [existing outputs match the cache, left as is]


Linting "newsletters-api"...
[0m[0m
[0m[4m/Users/delliott/Documents/GitHub/newsletters-nx/apps/newsletters-api/src/app/routes/newsletters.ts[24m[0m
[0m   [2m9:44[22m  [33mwarning[39m  'req' is defined but never used  [2m@typescript-eslint/no-unused-vars[22m[0m
[0m   [2m9:49[22m  [33mwarning[39m  'res' is defined but never used  [2m@typescript-eslint/no-unused-vars[22m[0m
[0m  [2m14:37[22m  [33mwarning[39m  'req' is defined but never used  [2m@typescript-eslint/no-unused-vars[22m[0m
[0m  [2m14:42[22m  [33mwarning[39m  'res' is defined but never used  [2m@typescript-eslint/no-unused-vars[22m[0m
[0m[0m
[0m[4m/Users/delliott/Documents/GitHub/newsletters-nx/apps/newsletters-api/src/register-ui-server.ts[24m[0m
[0m  [2m3:8[22m  [33mwarning[39m  Using exported name 'fastifyStatic' as identifier for default export  [2mimport/no-named-as-default[22m[0m
[0m[0m
[0m[33m[1m✖ 5 problems (0 errors, 5 warnings)[22m[39m[0m
[0m[33m[1m[22m[39m[0m

> nx run newsletters-ui:lint  [existing outputs match the cache, left as is]


Linting "newsletters-ui"...
[0m[0m
[0m[4m/Users/delliott/Documents/GitHub/newsletters-nx/apps/newsletters-ui/src/app/components/SchemaForm/SchemaField.tsx[24m[0m
[0m  [2m10:28[22m  [33mwarning[39m  'T' is defined but never used  [2m@typescript-eslint/no-unused-vars[22m[0m
[0m[0m
[0m[33m[1m✖ 1 problem (0 errors, 1 warning)[22m[39m[0m
[0m[33m[1m[22m[39m[0m

> nx run metrics-metrics-api:lint


Linting "metrics-metrics-api"...

/Users/delliott/Documents/GitHub/newsletters-nx/libs/metrics/metrics-api/src/lib/metrics-api.spec.ts
  1:35  error  Unable to resolve path to module './metrics-metrics-api'  import/no-unresolved

✖ 1 problem (1 error, 0 warnings)

Lint errors found in the listed files.


 

 >  NX   Running target lint for 6 projects failed

   Failed tasks:
   
   - metrics-metrics-api:lint

   View structured, searchable error logs at https://nx.app/runs/SMTQCggRae

