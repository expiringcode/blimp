module.exports.prompt = { // use nested prompt
  "development": [{
    validate: (input) => { 
      return /^[a-zA-Z\s\-]+$/.test(input) || 
        'Name must be only letters, spaces, or dashes'.red
    },
    name: "databaseName",
    message: "Database name".magenta,
    required: true
  },{
    validate: (input) => { 
      return /^[a-zA-Z\s\-]+$/.test(input) ||
        'Enter a username for your database user'.red
    },
    name: "databaseUser",
    message: "Database username".magenta,
    required: true
  },{
    name: "databasePassword",
    message: "Database password".magenta,
    type: "password",
    validate: (input) => { 
      return input.length > 0 ||
        'Enter a password'.red
    }
  },{
    hidden: true,
    default: 'root',
    name: "databaseRootPassword",
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
    name: 'allowEmpyPassword',
    message: "Allow a database user with an empty password?".magenta,
    pageSize: 2,
    choices: [{
      name: "yes",
      value: true
    }, {
      name: "no",
      value: false
    }]
  }],
  "production": [{
      validate: (input) => { 
        return /^[a-zA-Z\s\-]+$/.test(input) || 
          'Name must be only letters, spaces, or dashes'.red
      },
      name: "databaseName",
      message: "Database name".magenta,
      required: true
    },{
      validate: (input) => { 
        return /^[a-zA-Z\s\-]+$/.test(input) ||
          'Enter a username for your database user'.red
      },
      name: "databaseUser",
      message: "Database username".magenta,
      required: true
    },{
      name: "databasePassword",
      message: "Database password".magenta,
      type: "password",
      validate: (input) => { 
        return input.length > 0 ||
          'Enter a password'.red
      }
    },{
      hidden: true,
      default: 'root',
      name: "databaseRootPassword",
      type: "password",
      validate: (input) => { 
        return input.length > 0 || 
          "Password for root user" 
      },
      when: () => { return true },
      message: "Set a password for `root` or leave it to it's default (root)".magenta
  }]
}

module.exports.map = {
  databaseName: "",
  databaseUser: "",
  databasePassword: "",
  databaseRootPassword: ""
}

module.exports.path = "images/php/php"