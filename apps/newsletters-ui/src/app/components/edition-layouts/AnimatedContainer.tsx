import { css } from '@emotion/react';
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

type Props<DataType> = {
	list: DataType[];
	represent: { (item: DataType, index: number): ReactNode };
	getId: { (item: DataType): string };
};

type Ordering = {
	last: string[];
	now: string[];
};

type PositionList = Array<{ left: number; top: number }>;

const itemCss = css({
	transition: 'transform .3s ease-in-out',
	transformOrigin: 'center',
	transformBox: 'content-box',
});

const getInlineTransition = (
	isNew: boolean,
	wasAt?: { left: number; top: number },
	nowAt?: { left: number; top: number },
): CSSProperties | undefined => {
	if (isNew) {
		return {
			transform: 'scaleX(0%)',
			transition: 'transform 0s',
		};
	}

	if (wasAt && nowAt) {
		const xShift = wasAt.left - nowAt.left;
		const yShift = wasAt.top - nowAt.top;
		return {
			transform: `translateX(${xShift}px) translateY(${yShift}px) `,
			transition: 'transform 0s',
		};
	}

	return undefined;
};

export const AnimatedContainer = <DataType,>({
	list,
	getId,
	represent,
}: Props<DataType>) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const positionRef = useRef<PositionList>([]);
	const [ordering, setOrdering] = useState<Ordering>(() => ({
		last: list.map(getId),
		now: list.map(getId),
	}));

	const [tansformsOn, setTransformsOn] = useState(false);

	const runTransforms = useCallback(() => {
		setTransformsOn(true);
		setTimeout(() => setTransformsOn(false), 300);
	}, []);

	useLayoutEffect(() => {
		setOrdering((oldOrdering) => ({
			last: oldOrdering.now,
			now: list.map(getId),
		}));

		const { current: container } = containerRef;

		if (container) {
			const items = Array.from(container.children) as HTMLDivElement[];
			positionRef.current = items.map((el) => ({
				left: el.offsetLeft,
				top: el.offsetTop,
			}));
		}
		runTransforms();
	}, [list, getId, runTransforms]);

	return (
		<div
			style={{
				display: 'contents',
				position: 'relative',
			}}
			ref={containerRef}
		>
			{list.map((item, index) => {
				const oldPlace = ordering.last.indexOf(getId(item));
				const newPlace = ordering.now.indexOf(getId(item));
				const wasAt = positionRef.current[oldPlace];
				const nowAt = positionRef.current[newPlace];

				return (
					<div
						data-old-left={wasAt?.left}
						data-new-left={nowAt?.left}
						data-old-top={wasAt?.top}
						css={itemCss}
						key={getId(item)}
						style={
							tansformsOn
								? getInlineTransition(oldPlace === -1, wasAt, nowAt)
								: undefined
						}
					>
						{represent(item, index)}
					</div>
				);
			})}
		</div>
	);
};
