import { getTestConfig } from './test-config';

beforeAll(() => {
  const testConfig = getTestConfig();
  Object.keys(testConfig).forEach((key) => {
    process.env[key] = String(testConfig[key]);
  });
});

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
});

const originalLog = console.log;
console.log = (...args: any[]) => {
  if (process.env.VERBOSE_TESTS === 'true') {
    originalLog(...args);
  }
};
