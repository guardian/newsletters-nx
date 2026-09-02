import { createBdd, test as base } from 'playwright-bdd';

/**
 * Custom test instance for BDD scenarios.
 * Extend here to add project-specific fixtures as the step library grows.
 */
export const test = base;

export const { Given, When, Then, Before, After } = createBdd(test);
