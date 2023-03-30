import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { startLayout } from './start';

export const renderingOptionsLayout: WizardLayout = {
	start: startLayout,
	cancel: cancelLayout,
};
