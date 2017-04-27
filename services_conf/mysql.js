module.exports = { // use nested prompt
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
  "production": {
    properties: {
      database: {
        pattern: /^[a-zA-Z\s\-]+$/,
        message: 'Name must be only letters, spaces, or dashes',
        required: true
      },
      user: {
        pattern: /^[a-zA-Z\d]+$/,
        message: 'Name must be only letters, numbers',
        required: true
      },
      password: {
        hidden: true
      },
      select: {
        type: 'checkbox',
        name: 'random_root_password',
        message: "Generate a random root password: ",
        choices: [{
          name: "yes",
          value: true
        }]
      }
    }
  }
};