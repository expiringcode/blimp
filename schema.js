module.exports.mysql = {
  "development": {
    properties: {
      database: {
        pattern: /^[a-zA-Z\s\-]+$/,
        message: 'Name must be only letters, spaces, or dashes',
        required: true
      },
      user: {
        pattern: /^[a-zA-Z\s\-]+$/,
        message: 'Name must be only letters, spaces, or dashes',
        required: true
      },
      password: {
        hidden: true
      },
      root_password: {
        hidden: true,
        default: 'root',             // Default value to use if no value is entered. 
      },
      allow_empy_password: {
        default: true,
        type: 'boolean'
      },
      select: {
        type: 'checkbox',
        name: 'allow_empy_password',
        message: "Allow a database user with an empty password: ",
        choices: [{
          name: "yes",
          value: true
        }, {
          name: "no",
          value: false
        }]
      }
    }
  },
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