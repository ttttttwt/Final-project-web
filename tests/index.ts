/**
 * Test mocks and utilities index
 * Re-exports all mock data and utilities for easy importing in tests
 */

// Mock data
export * from "./mocks/mockData";

// Test utilities (from test-utils.tsx)
export {
  render,
  screen,
  waitFor,
  within,
  fireEvent,
} from "../utils/test-utils";
