const pass = require("generate-password")

function askUserAndPassword(q) {
  if (q.GEN_UP && !q.MYSQL_USER && !q.MYSQL_PASSWORD) {
    q.MYSQL_USER = pass.generate({
      length: 10,
      numbers: false,
      uppercase: false
    })
    q.MYSQL_PASSWORD = pass.generate({
      length: 25,
      numbers: true,
      uppercase: true,
      symbols: true,
      strict: true
    }) 
    return false
  } else if (q.MYSQL_USER && q.MYSQL_PASSWORD) {
    return false
  }
  return true
}

module.exports.prompt = { // use nested prompt
  "development": [{
    validate: (input) => {
      return /^[a-zA-Z\s\-]+$/.test(input) || 
        'Name must be only letters or dashes'.red
    },
    name: "MYSQL_DATABASE",
    message: "Database name".magenta,
    required: true
  },{
    type: 'list',
    name: 'GEN_UP',
    message: "Generate a random username and password?".magenta,
    pageSize: 2,
    choices: [{
      name: "yes",
      value: true
    }, {
      name: "no",
      value: false
    }]
  },{
    validate: (input) => { 
      return /^[a-zA-Z\s\-]+$/.test(input) ||
        'Enter a username for your database user'.red
    },
    name: "MYSQL_USER",
    message: "Database username".magenta,
    required: true,
    when: askUserAndPassword
  },{
    name: "MYSQL_PASSWORD",
    message: "Database password".magenta,
    type: "password",
    validate: (input) => { 
      return input.length > 0 ||
        'Enter a password'.red
    },
    when: askUserAndPassword
  },{
    hidden: true,
    default: 'root',
    name: "MYSQL_ROOT_PASSWORD",
    type: "password",
    validate: (input) => { 
      return input.length > 0 || 
        "Password for root user" 
    },
    when: () =>  false ,
    message: "Set a password for `root` or leave it to it's default (root)".magenta
  },{
    type: 'list',
    name: 'MYSQL_ALLOW_EMPTY_PASSWORD',
    message: "Allow a database user with an empty password?".magenta,
    pageSize: 2,
    choices: [{
      name: "yes",
      value: "yes"
    }, {
      name: "no",
      value: ""
    }],
    when: false
  }],
  "production": [{
    validate: (input) => {
      return /^[a-zA-Z\s\-]+$/.test(input) || 
        'Name must be only letters, spaces, or dashes'.red
    },
    name: "MYSQL_DATABASE",
    message: "Database name".magenta,
    required: true
  },{
    type: 'list',
    name: 'GEN_UP',
    message: "Generate a random username and password?".magenta,
    pageSize: 2,
    choices: [{
      name: "yes",
      value: true
    }, {
      name: "no",
      value: false
    }]
  },{
    validate: (input) => { 
      return /^[a-zA-Z\s\-]+$/.test(input) ||
        'Enter a username for your database user'.red
    },
    name: "MYSQL_USER",
    message: "Database username".magenta,
    required: true,
    when: askUserAndPassword
  },{
    name: "MYSQL_PASSWORD",
    message: "Database password".magenta,
    type: "password",
    validate: (input) => { 
      return input.length > 0 ||
        'Enter a password'.red
    },
    when: askUserAndPassword
  }]
}

module.exports.map = {
  MYSQL_DATABASE: "MYSQL_DATABASE",
  MYSQL_USER: "MYSQL_USER",
  MYSQL_PASSWORD: "MYSQL_PASSWORD",
  MYSQL_ROOT_PASSWORD: "MYSQL_ROOT_PASSWORD",
  MYSQL_RANDOM_ROOT_PASSWORD: "MYSQL_RANDOM_ROOT_PASSWORD",
  MYSQL_ALLOW_EMPTY_PASSWORD: "MYSQL_ALLOW_EMPTY_PASSWORD"
}

module.exports.path = "images/mysql/db"

module.exports.defaults = {
  dev: {

  },
  prod: {
    MYSQL_RANDOM_ROOT_PASSWORD: "yes"
  }
}