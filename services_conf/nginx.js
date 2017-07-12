module.exports.prompt = { // use nested prompt
  "development": [{
    name: "VIRTUAL_HOST",
    message: "[VIRTUAL_HOST] Domain(s) managed by this project's nginx".magenta,
    default: "localhost",
    required: true
  }],
  "production": [{
    name: "VIRTUAL_HOST",
    message: "[VIRTUAL_HOST] Domain(s) managed by this project's nginx".magenta,
    default: "domain.com",
    required: true
  }, {
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
    when: q => q.LETSENCRYPT_ENABLED === 1,
    required: true
  }, {
    name: "LETSENCRYPT_HOST",
    message: "Domain or domains for Let's Encrypt".magenta,
    default: "domain.com",
    when: q => q.LETSENCRYPT_ENABLED === 1,
    required: true
  }, {
    name: "REUSE_KEY",
    message: "Reuse always the first private key when generating certificates?".magenta,
    default: false,
    pageSize: 2,
    type: 'list',
    choices: [{
      name: "yes",
      value: 1
    }, {
      name: "no",
      value: 0
    }],
    when: q => q.LETSENCRYPT_ENABLED === 1,
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