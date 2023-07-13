import { z } from 'zod';

const stringRecordSchema = z.record(z.string(), z.any());

export const isStringRecord = (v: unknown): v is Record<string, unknown> =>
	stringRecordSchema.safeParse(v).success;
