import type { WizardStatic } from './types';

export function createTestStateMachine(): WizardStatic {
	return {
		createNewsletter: {
			markdownToDisplay: `# Create a new newsletter
    
This is the first step of the wizard. You can use markdown here.
On the first step you can ask the user to enter the name of the newsletter.`,
			buttons: {
				cancel: {
					buttonType: 'RED',
					label: 'Cancel',
					stepToMoveTo: 'exit',
				},
				next: {
					buttonType: 'GREEN',
					label: 'Select Template',
					stepToMoveTo: 'newsletterName',
					executeStep: async (
						state,
						staticState,
					): Promise<string | undefined> => {
						return Promise.resolve('An error occurred');
					},
				},
			},
		},
		exit: {
			markdownToDisplay: `# Cancelled

This newsletter was cancelled.`,
			buttons: {},
		},
		newsletterName: {
			markdownToDisplay: `# Newsletter name

The newsletter name will be displayed on the newsletter page.

// Embed an image showing the rendered text.
![Newsletter name](https://unsplash.com/photos/5Zg8ZQZJ9qM/download?force=true&w=640)
`,
			buttons: {
				cancel: {
					buttonType: 'RED',
					label: 'Cancel',
					stepToMoveTo: 'exit',
				},
				next: {
					buttonType: 'GREEN',
					label: 'Select Template',
					stepToMoveTo: 'selectTemplate',
				},
			},
		},
	};
}
