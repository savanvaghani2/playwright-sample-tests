/** @type {import('@testdino/playwright').TestdinoConfig} */
export default {
  coverage: {
    enabled: process.env.COVERAGE === 'true',
    include: ['**/src/**'],
    exclude: ['**/node_modules/**', 'tests/**', 'pages/**'],
    thresholds: {
      lines: 40,
      branches: 25,
      functions: 30,
      statements: 40,
    },
  },
};
