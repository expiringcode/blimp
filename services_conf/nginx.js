module.exports.prompt = { // use nested prompt
  "development": [{
    validate: (input) => { 
      return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(input) || 
        'Domain name should be of the following pattern subdomain.domain.tld or domain.tld'.red
    },
    name: "DOMAIN",
    message: "Domain name".magenta,
    default: "localhost",
    required: true
  }],
  "production": [{
    validate: (input) => { 
      return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(input) || 
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
    WORKDIR: "/www",
    ENVIRONMENT: "DEVELOPMENT"
  },
  prod: {
    TZ: "Europe/Rome",
    WORKDIR: "/www",
    ENVIRONMENT: "PRODUCTION"
  }
}

module.exports.path = "images/php/php"