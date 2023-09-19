console.log('Fetching current newsletters from PROD read-only api');

const promptForFileNameAndWriteFile = (json) => {
	console.log('there are', json.data.length, 'newsletters');

	const filename = prompt(
		'What should the filename be called?',
		'sample-data.json',
	);
	const filepath = `./libs/newsletters-data-client/src/fixtures/${filename}`;
	Deno.writeTextFile(filepath, JSON.stringify(json.data, undefined, 2));

	console.log(`Written ${json.data.length} newsletters to ${filepath}`);
};

fetch('https://newsletters.guardianapis.com/api/newsletters')
	.then((result) => result.json())
	.then(promptForFileNameAndWriteFile);
