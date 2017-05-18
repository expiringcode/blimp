module.exports.prompt = { // use nested prompt
  "development": [{
    name: "DOMAIN",
    message: "Domain name".magenta,
    default: "localhost",
    required: true
  }],
  "production": [{
    validate: (input) => { 
      return /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})$/.test(input) || 
        'Domain name should be of the following pattern subdomain.domain.tld or domain.tld'.red
    },
    name: "DOMAIN",
    message: "Domain name".magenta,
    default: "localhost",
    required: true
  }]
}

module.exports.map = {
  DOMAIN: "DOMAIN"
}

module.exports.defaults = {
  dev: {
    TZ: "Europe/Rome",
    ENVIRONMENT: "DEVELOPMENT"
  },
  prod: {
    TZ: "Europe/Rome",
    ENVIRONMENT: "PRODUCTION"
  }
}

module.exports.path = "images/php/php"