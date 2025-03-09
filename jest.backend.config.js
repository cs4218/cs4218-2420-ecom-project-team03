export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  transform: {},
  
  // which test to run
  testMatch: [
    "<rootDir>/controllers/*.test.js",
    "<rootDir>/helpers/*.test.js"
  ],

  transform: {},

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**", "helpers/**"],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
  transform: {},
};
