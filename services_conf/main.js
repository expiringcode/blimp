module.exports.prompt = [{
  validate: (input) => { 
    return /^\d{4,5}$/.test(input) || 
      'A port is made only of numbers.'.red
  },
  name: "PROXY_HTTP",
  message: "HTTP Port (You shouldn't be needing this if you set up the load balancer correctly)".magenta,
  default: 8888,
  required: true
},{
  validate: (input) => { 
    return true
  },
  name: "PROXY_HTTPS",
  message: "HTTPS Port (You shouldn't be needing this if you set up the load balancer correctly)".magenta,
  default: 8443,
  required: true
},{
  name: "FRONTEND_HTTP",
  default: 8190,
  message: "Frontend Port (You shouldn't be needing this if you set up the load balancer correctly)".magenta
},{
  name: "DB_PORT",
  default: 8806,
  message: "DBMS Port".magenta
},{
  default: process.cwd().split("/").pop(),
  name: "PROJECT_NAME",
  required: true,
  validate: input => !/(?=.*[A-Z])/g.test(input) || "Project name must be lowercase",
  message: "Project name".magenta
},{
  default: '1.0.0',
  name: "VERSION",
  message: "Version of the project".magenta
},{
  name: "GIT_REMOTE",
  message: "Version control remote url".magenta
},{
  default: 'master',
  name: "GIT_BRANCH",
  message: "Version control branch".magenta
}]

module.exports.map = {
  PROXY_HTTP: "PROXY_HTTP",
  PROXY_HTTPS: "PROXY_HTTPS",
  DB_PORT: "DB_PORT",
  PROJECT_NAME: ["PROJECT_NAME", "COMPOSE_PROJECT_NAME"],
  GIT_BRANCH: "GIT_BRANCH",
  GIT_REMOTE: "GIT_REMOTE",
  VERSION: "VERSION",
  FRONTEND_HTTP: "FRONTEND_HTTP"
}

module.exports.path = ""

module.exports.defaults = {
  PHP_MODS: "curl"
}

module.exports.dependencies = [
  { PHP_MODS:     {php: "PHP_MODS"} }
]