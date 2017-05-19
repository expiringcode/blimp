module.exports.prompt = [{
    type: 'checkbox',
    name: 'services',
    message: "Which services will you use?".magenta,
    pageSize: 5,
    choices: [{
      name: "Php 7 (suggested Nginx, Redis)",
      value: "php7"
    }, {
      name: "Php 5.6 (suggested Nginx, Redis and HHVM)",
      value: "php5.6"
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
      name: "MariaDB",
      value: "mariadb"
    }, {
      name: "NGinx",
      value: "nginx"
    }, {
      name: "NGinx-Built",
      value: "nginxb"
    }],
    validate: (choices) => {
      // checking php
      let concurrent = ["php7", "php5.6"]
      let php = 0
      concurrent.forEach((ch) => {
        php = choices.indexOf(ch) != -1 ? ++php : php
      })
      php = php <= 1 || "Can't use 2 different versions of the same service at once (php)"
      if (typeof php == 'string') return php

      //mysql
      concurrent = ["mysql", "mariadb"]
      let mysql = 0
      concurrent.forEach((ch) => {
        mysql = choices.indexOf(ch) != -1 ? ++mysql : mysql
      })
      mysql = mysql <= 1 || "Can't use 2 different versions of the same service at once (mysql)"
      if (typeof mysql == 'string') return mysql

      //mysql
      concurrent = ["nginx", "nginxb"]
      let nginx = 0
      concurrent.forEach((ch) => {
        nginx = choices.indexOf(ch) != -1 ? ++nginx : nginx
      })
      nginx = nginx <= 1 || "Can't use 2 different versions of the same service at once (nginx)"
      if (typeof nginx == 'string') return nginx
      
      return true
    }
  }]

module.exports.map = {}

module.exports.path = null

module.exports.dependencies = null