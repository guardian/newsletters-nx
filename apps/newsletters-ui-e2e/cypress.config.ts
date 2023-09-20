import { nxE2EPreset } from '@nrwl/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

// eslint-disable-next-line import/no-default-export -- config file
export default defineConfig({
	e2e: nxE2EPreset(__dirname, {
		bundler: 'vite',
	}),
});
