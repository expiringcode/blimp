module.exports.prompt = {
  development: [{
    validate: (input) => { 
      return /^\d{4,5}$/.test(input) || 
        'Port must contain 4/5 numbers'.red
    },
    name: "PORT",
    message: "App Port".magenta,
    default: 3000,
    required: true
  }, {
    name: "DOMAIN",
    message: "[DOMAIN] Endpoint to access this container (equals VIRTUAL_HOST by default)".magenta,
    required: false
  }],
  production: [{
    validate: (input) => { 
      return /^\d{4,5}$/.test(input) || 
        'Port must contain 4/5 numbers'.red
    },
    name: "PORT",
    message: "App Port".magenta,
    default: 3000,
    required: true
  }, {
    name: "DOMAIN",
    message: "[DOMAIN] Endpoint to access this container (equals VIRTUAL_HOST by default)".magenta,
    required: false
  }]
}

module.exports.map = {
  PORT: "PORT"
}

module.exports.path = "images/node/node"

module.exports.defaults = {
  dev: {
    VERSION: "7-alpine",
    PORT: "3000",
    WORKDIR: "/app"
  },
  prod: {
    VERSION: "7-alpine",
    PORT: "3000",
    WORKDIR: "/app"
  }
}