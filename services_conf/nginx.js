module.exports.prompt = { // use nested prompt
  "development": [{
    name: "DOMAIN",
    message: "Domain name for the PHP container".magenta,
    default: "localhost",
    required: true
  }, {
    name: "VIRTUAL_HOST",
    message: "Domain or domains including wildcards for the whole project".magenta,
    default: "*.localhost",
    required: true
  }],
  "production": [{
    validate: (input) => { 
      return /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})$/.test(input) || 
        'Domain name should be of the following pattern subdomain.domain.tld or domain.tld'.red
    },
    name: "DOMAIN",
    message: "Domain name for the PHP container".magenta,
    default: "localhost",
    required: true
  }, {
    name: "VIRTUAL_HOST",
    message: "Domain or domains including wildcards for the whole project".magenta,
    default: "*.localhost",
    required: true
  },{
    name: "LETSENCRYPT_ENABLED",
    message: "Do you want to enable SSL with Let's encrypt?".magenta,
    type: 'list',
    pageSize: 2,
    required: true,
    choices: [{
      name: "yes",
      value: 1
    }, {
      name: "no",
      value: 0
    }]
  }, {
    name: "LETSENCRYPT_EMAIL",
    message: "Email to use for Let's Encrypt certificates".magenta,
    default: "dev@caffeina.com",
    when: (q) => q.LETSENCRYPT_ENABLED === 1,
    required: true
  }, {
    name: "LETSENCRYPT_HOST",
    message: "Domain or domains for Let's Encrypt".magenta,
    default: "domain.com",
    when: (q) => q.LETSENCRYPT_ENABLED === 1,
    required: true
  }]
}

module.exports.map = {
  DOMAIN: "DOMAIN",
  VIRTUAL_HOST: "VIRTUAL_HOST"
}

module.exports.defaults = {
  dev: {
    TZ: "Europe/Rome",
    ENVIRONMENT: "DEVELOPMENT",
    WORKDIR: "/www"
  },
  prod: {
    TZ: "Europe/Rome",
    ENVIRONMENT: "PRODUCTION",
    WORKDIR: "/www"
  }
}

module.exports.path = "images/nginx/proxy"

module.exports.dependencies = null