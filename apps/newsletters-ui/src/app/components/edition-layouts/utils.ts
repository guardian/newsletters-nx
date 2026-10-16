export function getSectionAriaLabel(title?: string) {
	if (title === undefined) {
		return 'Unnamed section';
	}
	return title.length > 0 ? title : 'Unnamed section';
}
