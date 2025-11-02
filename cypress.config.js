const { defineConfig } = require('cypress');

module.exports = defineConfig({
  retries: {
    openMode: 0,
    runMode: 1,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // register mochawesome reporter plugin (requires installation of cypress-mochawesome-reporter)
      try {
        require('cypress-mochawesome-reporter/plugin')(on);
      } catch (e) {
        // ignore if package is not installed yet; npm install will be required
      }
    },
  },
});
