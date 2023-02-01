export const filterObjects = <PassedObjectType>(
	objectsToFilter: PassedObjectType[],
	filter: string,
): PassedObjectType[] => {
	const filterString = Object.entries(filter)
		.map(([key, value]) => `${key}:${value}`)
		.join(',');

	return objectsToFilter.filter((objectToFilter) => {
		const objectString = Object.entries(objectsToFilter)
			.map(([key, value]) => `${key}:${value}`)
			.join(',');
		return objectString.includes(filterString);
	});
};
