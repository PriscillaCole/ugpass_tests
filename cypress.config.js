const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://sign.ugpass.go.ug',

    defaultCommandTimeout: 20000,
    pageLoadTimeout: 120000,

    setupNodeEvents(on, config) {
      return config
    },
  },
})
