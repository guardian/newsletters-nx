export function createColumnVisbilityObject<TableData>(
	tableData: TableData,
): Record<string, boolean> {
	const columnVisibility: Record<string, boolean> = {};
	if (tableData === null || tableData === undefined) {
		return columnVisibility;
	}
	for (const key in tableData) {
		if (Object.prototype.hasOwnProperty.call(tableData, 'key')) {
			columnVisibility[key] = true;
		}
	}
	return columnVisibility;
}


