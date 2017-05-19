module.exports.prompt = {
  development: [{
    validate: (input) => { 
      return /^\d{4,5}$/.test(input) || 
        'Port must containt 4/5 numbers'.red
    },
    name: "PORT",
    message: "App Port".magenta,
    default: 3000,
    required: true
  }],
  production: [{
    validate: (input) => { 
      return /^\d{4,5}$/.test(input) || 
        'Port must containt 4/5 numbers'.red
    },
    name: "PORT",
    message: "App Port".magenta,
    default: 3000,
    required: true
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