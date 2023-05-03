# state-machine

The State-machine is library to support "Wizard" user interfaces where the user is guided through a series of step which inspect the state of a server-side application, such as entering or modifying data or instructing the application to take an action.

It exports:

-   A set of types that can be imported into other libraries to define `WizardLayout`s for specific workflows.
-   A handler function to be called on the server side to validate the user input against the parameters defined in the `WizardLayout`, dispatch and resulting actions and return the state information for the next step to the client

The aim is to keep this library generic, so it could be used for `WizardLayout` describing any workflow and any data model.

## Diagram

[![](https://mermaid.ink/img/pako:eNqdlD1v3DAMhv8KoaFLL-juAlmapUOmQzYtrEWficqSS9FJDkH-e2QrF-sa5wPRYlt8H5J4QfPBtNGRaUyifxOFlq4YD4KDDSOKcssjBoWbRGKDDZDPL8-Ury4uL7_vSW5JGpCZTQocWBk9JEWloi6SRX2FinuNQivg8lXRvQT_S6yThEq2pittNOc1AYODjiWnTkrjq4ZP0DS6WX3zG-5Y-zOiMD7GEQ4RtJc4HfollkpoPrMfdRN78tQqYKscA_zICb2HLsqwIhu2DdFxxy0u0IhHH9GtQOXcCbhFz0vjNbkSf4TwL3D3Ym-H7NOJytKfq7auUDvz7Hhx8xuQSBQYKCU80Dm9YavjNHo8buu_4NkbvgW6-8A7CttGbozgtpXvjmNByFVzuT2bZ8JlNgPd16P5ufHcgELM8TiXK8wO1h5HQs0PbPtcWXsCa7r8l6T8aU2VZzHJ7MxAMiC7vAMe5oA1mRnImia_Oupw8mqNDY9ZipPG_TG0plGZaGdKo88rwzQd-pRvyXG27rrslWW9PD4BILJvaQ?type=png)](https://mermaid.live/edit#pako:eNqdlD1v3DAMhv8KoaFLL-juAlmapUOmQzYtrEWficqSS9FJDkH-e2QrF-sa5wPRYlt8H5J4QfPBtNGRaUyifxOFlq4YD4KDDSOKcssjBoWbRGKDDZDPL8-Ury4uL7_vSW5JGpCZTQocWBk9JEWloi6SRX2FinuNQivg8lXRvQT_S6yThEq2pittNOc1AYODjiWnTkrjq4ZP0DS6WX3zG-5Y-zOiMD7GEQ4RtJc4HfollkpoPrMfdRN78tQqYKscA_zICb2HLsqwIhu2DdFxxy0u0IhHH9GtQOXcCbhFz0vjNbkSf4TwL3D3Ym-H7NOJytKfq7auUDvz7Hhx8xuQSBQYKCU80Dm9YavjNHo8buu_4NkbvgW6-8A7CttGbozgtpXvjmNByFVzuT2bZ8JlNgPd16P5ufHcgELM8TiXK8wO1h5HQs0PbPtcWXsCa7r8l6T8aU2VZzHJ7MxAMiC7vAMe5oA1mRnImia_Oupw8mqNDY9ZipPG_TG0plGZaGdKo88rwzQd-pRvyXG27rrslWW9PD4BILJvaQ)

You can edit a [live version of the diagram here](https://mermaid.live/edit#pako:eNqdlD1v3DAMhv8KoaFLL-juAlmapUOmQzYtrEWficqSS9FJDkH-e2QrF-sa5wPRYlt8H5J4QfPBtNGRaUyifxOFlq4YD4KDDSOKcssjBoWbRGKDDZDPL8-Ury4uL7_vSW5JGpCZTQocWBk9JEWloi6SRX2FinuNQivg8lXRvQT_S6yThEq2pittNOc1AYODjiWnTkrjq4ZP0DS6WX3zG-5Y-zOiMD7GEQ4RtJc4HfollkpoPrMfdRN78tQqYKscA_zICb2HLsqwIhu2DdFxxy0u0IhHH9GtQOXcCbhFz0vjNbkSf4TwL3D3Ym-H7NOJytKfq7auUDvz7Hhx8xuQSBQYKCU80Dm9YavjNHo8buu_4NkbvgW6-8A7CttGbozgtpXvjmNByFVzuT2bZ8JlNgPd16P5ufHcgELM8TiXK8wO1h5HQs0PbPtcWXsCa7r8l6T8aU2VZzHJ7MxAMiC7vAMe5oA1mRnImia_Oupw8mqNDY9ZipPG_TG0plGZaGdKo88rwzQd-pRvyXG27rrslWW9PD4BILJvaQ).

## Running unit tests

Run `nx test state-machine` to execute the unit tests via [Jest](https://jestjs.io).

## Running lint

Run `nx lint state-machine` to execute the lint via [ESLint](https://eslint.org/).
