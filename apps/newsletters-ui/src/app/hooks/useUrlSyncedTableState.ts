import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { IdType, SortingRule, TableState } from 'react-table';

export function useUrlSyncedTableState<TData extends object>(
	defaultSortId?: keyof TData,
) {
	const [searchParams, setSearchParams] = useSearchParams();

	const queryToState = useCallback(
		(params: URLSearchParams): Partial<TableState<TData>> => {
			const sortBy: Array<SortingRule<TData>> = [];
			const filters: Array<{ id: string; value: string[] }> = [];

			const sort = params.get('sort');
			const order = params.get('order');
			if (sort) {
				sortBy.push({ id: sort as IdType<TData>, desc: order === 'desc' });
			}

			params.forEach((value, key) => {
				if (key.startsWith('filter_')) {
					const id = key.replace('filter_', '');
					filters.push({ id, value: value.split(',') });
				}
			});

			const hidden = params.get('hidden');
			const hiddenColumns: Array<IdType<TData>> = hidden
				? (hidden.split(',') as Array<IdType<TData>>)
				: [];

			return { sortBy, filters, hiddenColumns };
		},
		[],
	);

	const stateToQuery = useCallback(
		(
			state: {
				sortBy: Array<SortingRule<TData>>;
				filters: Array<{ id: string; value: string[] }>;
				hiddenColumns: Array<IdType<TData>>;
			},
			defaultSortId?: keyof TData,
		) => {
			const params = new URLSearchParams();

			const sort = state.sortBy[0];
			if (
				sort &&
				!(defaultSortId && sort.id === defaultSortId && sort.desc === false)
			) {
				params.set('sort', String(sort.id));
				params.set('order', sort.desc ? 'desc' : 'asc');
			}

			state.filters.forEach(({ id, value }) => {
				if (value.length) {
					params.set(`filter_${id}`, value.join(','));
				}
			});

			if (state.hiddenColumns.length) {
				params.set('hidden', state.hiddenColumns.join(','));
			}

			return params;
		},
		[],
	);

	const initialState = useMemo(() => {
		const state = queryToState(searchParams);
		if (!state.sortBy?.length && defaultSortId) {
			state.sortBy = [{ id: defaultSortId as IdType<TData>, desc: false }];
		}
		return state;
	}, [searchParams, defaultSortId, queryToState]);

	const syncStateToUrl = useCallback(
		(state: {
			sortBy: Array<SortingRule<TData>>;
			filters: Array<{ id: string; value: string[] }>;
			hiddenColumns: Array<IdType<TData>>;
		}) => {
			const params = stateToQuery(state, defaultSortId);
			setSearchParams(params, { replace: true });
		},
		[defaultSortId, setSearchParams, stateToQuery],
	);

	return { initialState, syncStateToUrl };
}
