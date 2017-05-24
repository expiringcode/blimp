module.exports.prompt = [{
    type: 'checkbox',
    name: 'services',
    message: "Which services will you use?".magenta,
    pageSize: 5,
    choices: [{
      name: "Php",
      value: "php"
    }, {
      name: "HHVM",
      value: "hhvm"
    }, {
      name: "Redis",
      value: "redis"
    }, {
      name: "NodeJS",
      value: "node"
    }, {
      name: "MySQL",
      value: "mysql"
    }, {
      name: "Nginx",
      value: "nginx"
    }]
  }]

module.exports.map = {}

module.exports.path = null

module.exports.dependencies = null