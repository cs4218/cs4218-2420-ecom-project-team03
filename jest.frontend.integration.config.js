export default {
  // name displayed during tests
  displayName: "frontend",

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: "jest-environment-jsdom",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  // ignore all node_modules except styleMock (needed for css imports)
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // only run these tests
  testMatch: [
    "<rootDir>/client/src/pages/Auth/*.integration.test.js",
    "<rootDir>/client/src/components/*.integration.test.js",
    "<rootDir>/client/src/components/Form/*.integration.test.js",
    "<rootDir>/client/src/pages/*.integration.test.js",
    "<rootDir>/client/src/hooks/*.integration.test.js",
    "<rootDir>/client/src/pages/admin/*.integration.test.js",
    "<rootDir>/client/src/pages/user/*.integration.test.js",
    "<rootDir>/client/src/context/*.integration.test.js",
  ],
  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "client/src/pages/Auth/**", 
    "client/src/components/**", 
    "client/src/pages/admin/**", 
    "client/src/pages/user/**", 
    "client/src/hooks/**", 
    "client/src/pages/**",
    "client/src/components/Form/**",
    "client/src/context/**"
  ],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
