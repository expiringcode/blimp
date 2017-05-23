module.exports.prompt = { // use nested prompt
  "development": [{
    name: "PUBLIC_URL",
    message: "Public URL (*.local)".magenta,
    required: true
  }],
  "production": [{
    name: "PUBLIC_URL",
    message: "Public URL (*.local)".magenta,
    required: true
  }]
}

module.exports.map = {
  //HOSTNAME: ["HOSTNAME", "HTTP_HOST"],
  PUBLIC_URL: "PUBLIC_URL"
}

module.exports.path = "images/php/php"

module.exports.defaults = {
  dev: {
    TZ: "Europe/Rome",          // Defaults
    DOCKER: "1",                // Defaults
    ENV: "local",               // Defaults
    WP_POST_REVISIONS: "false", // Defaults
    WP_USE_THEMES: "false",     // Defaults
    WP_LANG: "it_IT",           // Defaults
    WORKDIR: "/www",

    DB_HOST: "mysql",
    DB_NAME: "",          // Match with MySQL
    DB_USER: "",          // Match with MySQL
    DB_PASS: "",          // Match with MySQL

    PROJECT_NAME: "",     // Match with main
    APP_ID: "",           // Match with main
    PORT: "",             // Match with main
  },
  prod: {
    TZ: "Europe/Rome",          // Defaults
    DOCKER: "1",                // Defaults
    ENV: "local",               // Defaults
    WP_POST_REVISIONS: "false", // Defaults
    WP_USE_THEMES: "false",     // Defaults
    WP_LANG: "it_IT",           // Defaults
    WORKDIR: "/www",

    DB_HOST: "mysql",
    DB_NAME: "",          // Match with MySQL
    DB_USER: "",          // Match with MySQL
    DB_PASS: "",          // Match with MySQL

    PROJECT_NAME: "",     // Match with main
    APP_ID: "",           // Match with main
    PORT: "80",           // Match with main

    /*HTTP_HOST: "localhost",
    HOSTNAME: "localhost",
    PUBLIC_URL: "http://aeriawork.vanadio.dev"*/
  }
}

module.exports.dependencies = [
  { PROJECT_NAME: {main: "PROJECT_NAME"} },
  { APP_ID:       {main: "PROJECT_NAME"} },
  { PORT:         {main: "PROXY_HTTP"} },

  { DB_NAME:      {mysql: "MYSQL_DATABASE"} },
  { DB_USER:      {mysql: "MYSQL_USER"} },
  { DB_PASS:      {mysql: "MYSQL_PASSWORD"} },
  
  { HOSTNAME:     {nginx: "DOMAIN"} }
]