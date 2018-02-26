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
    }, {
      name: "Tensorflow",
      value: "tensorflow"
    }, {
      name: "ElasticSearch",
      value: "elasticsearch"
    }, {
      name: "Kibana",
      value: "kibana"
    }, {
      name: "Logstash",
      value: "logstash"
    }, {
      name: "Email Server",
      value: "mailer"
    }, {
      name: "Registry",
      value: "registry"
    }, {
      name: "LDAP Server",
      value: "ldapserver"
    }]
  }]

module.exports.map = {}

module.exports.path = null

module.exports.dependencies = null