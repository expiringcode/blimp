module.exports.prompt = { // use nested prompt
  "development": [{
    validate: (input) => { 
      return /^[a-zA-Z\s\-]+$/.test(input) || 
        'Name must be only letters, spaces, or dashes'.red
    },
    name: "MYSQL_DATABASE",
    message: "Database name".magenta,
    required: true
  },{
    validate: (input) => { 
      return /^[a-zA-Z\s\-]+$/.test(input) ||
        'Enter a username for your database user'.red
    },
    name: "MYSQL_USER",
    message: "Database username".magenta,
    required: true
  },{
    name: "MYSQL_PASSWORD",
    message: "Database password".magenta,
    type: "password",
    validate: (input) => { 
      return input.length > 0 ||
        'Enter a password'.red
    }
  },{
    hidden: true,
    default: 'root',
    name: "MYSQL_ROOT_PASSWORD",
    type: "password",
    validate: (input) => { 
      return input.length > 0 || 
        "Password for root user" 
    },
    when: () => { return true },
    message: "Set a password for `root` or leave it to it's default (root)".magenta
  },{
  //   name: "databaseAllowEmpty",
  //   message: "Allow the creation of users without a password".magenta,
  //   type: 'confirm',
  //   validate: (input) => { return /y[es]*|n[o]?/.test(input) },
  //   check: 'Must respond yes or no'.red,
  // },{
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
    }]
  }],
  "production": [{
    pattern: /^[a-zA-Z\s\-]+$/,
    name: "MYSQL_DATABASE",
    message: 'Name must be only letters, spaces, or dashes',
    required: true
  }, {
    pattern: /^[a-zA-Z\d]+$/,
    name: "MYSQL_USER",
    message: 'Name must be only letters, numbers',
    required: true
  }, {
    hidden: true
  }, {
    name: "MYSQL_PASSWORD",
    message: "Database password".magenta,
    type: "password",
    validate: (input) => { 
      return input.length > 7 ||
        'Enter a password at least 8 characters long'.red
    }
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