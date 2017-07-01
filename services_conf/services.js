module.exports.prompt = [{
    type: 'checkbox',
    name: 'services',
    message: "Which services will you use?".magenta,
    pageSize: 5,
    choices: [{
      name: "Php 7",
      value: "php7"
    }, {
      name: "Php 5",
      value: "legacy"
    }, {
      name: "Php Alpine",
      value: "phpa"
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
      name: "influxDB",
      value: "influxdb"
    }, {
      name: "MongoDB",
      value: "mongodb"
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