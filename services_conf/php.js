module.exports.prompt = { // use nested prompt
  "development": [{
    name: "HOSTNAME",
    message: "Hostname".magenta,
    default: "localhost",
    required: true
  },{
    name: "PUBLIC_URL",
    message: "Public URL (*.local)".magenta,
    required: true
  }],
  "production": [{
    name: "HOSTNAME",
    message: "Hostname".magenta,
    default: "localhost",
    required: true
  },{
    name: "PUBLIC_URL",
    message: "Public URL (*.local)".magenta,
    required: true
  }]
}

module.exports.map = {
  HOSTNAME: ["HOSTNAME", "HTTP_HOST"],
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

    DB_NAME: "",          // Match with MySQL
    DB_HOST: "",          // Match with MySQL
    DB_USER: "",          // Match with MySQL
    DB_PASS: "",          // Match with MySQL

    PROJECT_NAME: "test", // Match with main
    APP_ID: "aeriawork",  // Match with main
    PORT: "8880",         // Match with main

    HTTP_HOST: "localhost",
    HOSTNAME: "localhost",
    PUBLIC_URL: "http://aeriawork.vanadio.dev"
  },
  prod: {
    TZ: "Europe/Rome",          // Defaults
    DOCKER: "1",                // Defaults
    ENV: "local",               // Defaults
    WP_POST_REVISIONS: "false", // Defaults
    WP_USE_THEMES: "false",     // Defaults
    WP_LANG: "it_IT",           // Defaults

    DB_NAME: "",          // Match with MySQL
    DB_HOST: "",          // Match with MySQL
    DB_USER: "",          // Match with MySQL
    DB_PASS: "",          // Match with MySQL

    PROJECT_NAME: "test", // Match with main
    APP_ID: "aeriawork",  // Match with main
    PORT: "8880",         // Match with main

    HTTP_HOST: "localhost",
    HOSTNAME: "localhost",
    PUBLIC_URL: "http://aeriawork.vanadio.dev"
  }
}