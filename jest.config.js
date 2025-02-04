/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  detectOpenHandles: true,
  openHandlesTimeout: 10 * 1000,
  testTimeout: 10 * 1000,
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
};