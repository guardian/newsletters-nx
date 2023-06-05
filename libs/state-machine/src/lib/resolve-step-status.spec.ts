import { z } from 'zod';
import { resolveStepStatus, StepStatus } from './resolve-step-status';

describe('resolveStepStatus', () => {
	test('should return StepStatus.Complete when all fields are set and not Optional', () => {
		const step = {
			id: 'foo',
			schema: z.object({
				foo: z.string(),
				bar: z.string(),
			}),
			isOptional: false,
		};
		const formData = {
			foo: 'foo',
			bar: 'bar',
		};
		expect(resolveStepStatus(step, formData)).toBe(StepStatus.Complete);
	});

	test('should return StepStatus.Complete when all fields are set and Optional', () => {
		const step = {
			id: 'foo',
			schema: z.object({
				foo: z.string(),
				bar: z.string(),
			}),
			isOptional: true,
		};
		const formData = {
			foo: 'foo',
			bar: 'bar',
		};
		expect(resolveStepStatus(step, formData)).toBe(StepStatus.Complete);
	});

	test('should return StepStatus.Optional when Optional and some fields set', () => {
		const step = {
			id: 'foo',
			schema: z.object({
				foo: z.string(),
				bar: z.string(),
			}),
			isOptional: true,
		};
		const formData = {
			foo: 'foo',
		};
		expect(resolveStepStatus(step, formData)).toBe(StepStatus.Optional);
	});

	test('should return StepStatus.Incomplete when not Optional and some fields are set', () => {
		const step = {
			id: 'foo',
			schema: z.object({
				foo: z.string(),
				bar: z.string(),
			}),
			isOptional: false,
		};
		const formData = {
			foo: 'foo',
		};
		expect(resolveStepStatus(step, formData)).toBe(StepStatus.Incomplete);
	});
});
