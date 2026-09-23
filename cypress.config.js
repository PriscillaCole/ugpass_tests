const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'sqfzr9',
  e2e: {
    baseUrl: 'https://stgsign.ugpass.go.ug',

    defaultCommandTimeout: 20000,
    pageLoadTimeout: 120000,

    setupNodeEvents(on, config) {
      return config
    },
  },
})
