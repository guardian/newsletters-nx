import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
	title: string;
	children: ReactNode;
	defaultExpanded?: boolean;
	id?: string;
}

export const DetailAccordian = ({
	title,
	children,
	defaultExpanded,
	id,
}: Props) => (
	<Accordion disableGutters defaultExpanded={defaultExpanded}>
		<AccordionSummary
			expandIcon={<span>▼</span>}
			aria-controls={id ?? `detail-accordian-${title}`}
			id={id ?? `detail-accordian-${title}`}
		>
			<Typography>{title}</Typography>
		</AccordionSummary>
		<AccordionDetails>{children}</AccordionDetails>
	</Accordion>
);
