module.exports = [{
    validate: (input) => { 
      return /^\d{4,5}$/.test(input) || 
        'A port is made only of numbers.'.red
    },
    name: "PROXY_HTTP",
    message: "HTTP Port".magenta,
    required: true
  },{
    validate: (input) => { 
      return true
    },
    name: "PROXY_HTTPS",
    message: "HTTPS Port".magenta,
    required: true
  },{
    name: "DB_PORT",
    message: "DBMS Port".magenta
  },{
    default: 'test',
    name: "PROJECT_NAME",
    message: "Project name".magenta
  }];