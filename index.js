#!/usr/bin/env node
'use strict'

const manifest   	= require('./package.json')
const CWD 			= process.cwd()
const async 		= require('async')
const gm 			= require('gm')
const path 			= require('path')
const program 		= require('commander')
const _ 			= require('underscore')
const inquirer 		= require('inquirer')
const prompt 		= require('prompt')
const child_process	= require('child_process')
const escape 		= require("shell-escape")
const env 			= require('node-env-file')
const fs			= require('fs-extended')
const Q				= require('q')
const colors 		= require('colors')
const yaml			= require('js-yaml')
const git 			= require('simple-git')
const containers 	= "https://github.com/blimpair/architecture"

const execOpts 		= { cwd: CWD, stdio:[0,1,2], sync: true } // stdio is only needed for execSync|spawn
reqEnvOrExit()
const schemaMap		= {
	php7: "php",
	legacy: "php",
	phpa: "php",
	php: "php",
	hhvm: "hhvm",
	mysql: "mysql",
	node: "node",
	mongodb: "mongo",
	influxdb: "influx",
	redis: "redis",
	nginx: "nginx"
}
var envs 			= []
var order			= []

/////////////
// Helpers //
/////////////

const exec = (cmd, opts, callback) => {
	if (opts.sync || !_.isArray(cmd)) {
		if (manifest.debug) console.log("--", "Sync command: ", JSON.stringify(cmd), JSON.stringify(opts))

		if (_.isArray(cmd)) cmd = cmd.join(" ") //escape(cmd)
		child_process.exec(cmd, opts, callback)
	} else {
		//return Q.promise((resolve, reject) => {
			if (manifest.debug) console.log("--", "Spawn command", JSON.stringify(cmd), cmd.join(" "), JSON.stringify(opts))

			let spawned = child_process.spawn(cmd.shift(), cmd, opts)
			spawned.on("close", (err) => {
				if (err != 0) log(`Process exited with code ${err}`, false, false)

				if (callback) callback(err, false, false)
				else log(err, false, false)
				//else resolve(output)
			})
		//})
	}
}

const log = (err, stdout, stderr) => {
	if (err) error(err, 1, true)

	if (stderr != null && stderr != "") process.stdout.write(`${stderr}\n`.yellow)
	if (stdout != null && stdout != "") process.stdout.write(`${stdout}\n`.blue)
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
}

// Log an event to the CLI + GA, and miserably exit
function error(msg, code, dont_exit) {
	process.stdout.write(msg.toString().red)

	if (dont_exit == false) {
		process.exit( code || 1 )
	}
}

function reqEnvOrExit(){
	if (fs.existsSync(`${CWD}/.env`)) env(`${CWD}/.env`)
	if (fs.existsSync(`${CWD}/yml/.env`)) return env(`${CWD}/yml/.env`, {overwrite: true})

	if (!fs.existsSync(`${CWD}/.env`)) process.stdout.write('.env file is missing.\n\n'.red)
	if (fs.existsSync(`${CWD}/.env.sample`)) return env(`${CWD}/.env.sample`)
}

function projectName() {
	if (!fs.existsSync(`${CWD}/config.json`)) return CWD.split("/").pop()

	let config = require(`${CWD}/config.json`)

	if (config && config.globals && config.globals.main) return config.globals.main.PROJECT_NAME
	else return CWD.split("/").pop()
}

function projectVersion() {
	if (!fs.existsSync(`${CWD}/config.json`)) return '1.0.0'

	let config = require(`${CWD}/config.json`)

	if (config && config.globals && config.globals.main) return config.globals.main.VERSION
	else return '1.0.0'
}

function projectBranch() {
	if (!fs.existsSync(`${CWD}/config.json`)) return 'master'

	let config = require(`${CWD}/config.json`)

	if (config && config.globals && config.globals.main) return config.globals.main.GIT_BRANCH
	else return 'master'
}

function projectRepo() {
	if (!fs.existsSync(`${CWD}/config.json`)) return null

	let config = require(`${CWD}/config.json`)

	if (config && config.globals && config.globals.main) return config.globals.main.GIT_REMOTE
	else return null
}

function filesMap(itemPath, stat) {
    return {
        path: itemPath,
        name: path.basename(itemPath),
        ext: path.extname(itemPath),
        size: stat.size,
    };
}

/////////
// Git //
/////////

function gitCleanOrExit() {
	return exec(['git', 'status', '--porcelain'], execOpts)
	.then((stdout) => {
		var lines = (stdout.match(/\n/g) || []).length
		if (lines > 0) {
			process.stdout.write('Current working directory is not clean. Please commit current changes before doing anything')
		}
	})
	.catch(log)
}

function gitTag(version) {
	process.stdout.write("Tagging current changes...")
	return exec(['git', 'tag', '-d', version], execOpts, () => {
		return exec(['git', 'tag', version], execOpts, () => {
			return exec(['git', 'push', '--tags'], execOpts)
		})
	})
}

function gitCommit(message) {
	process.stdout.write("Commiting current changes...")
	return exec(['git', 'add', '-A'], execOpts, () => {
		exec(['git', 'commit', '-am' + message], execOpts, () => {
			exec(['git', 'push'], execOpts)
		})
	})
}

function gitInit() {
	// To be implemented
	/*git()
	.init()
	.add('./*')
	.commit("First commit!")
	.addRemote('origin', 'https://github.com/user/repo.git')
	.push('origin', 'master')*/

	return Q.resolve();
}

function gitClone(dir, callback) {
	if (_.isFunction(dir) && !callback) {
		callback = dir
		dir = "."
	}

	process.stdout.write("Cloning docker infrastructure...\n".green)
	
	/*git()
	.clone(containers, dir, null, () => {
		if(_.isFunction(callback)) callback()
	})*/

	let cmd = ['git','clone', containers, dir]
	return exec(cmd, _.extend(execOpts, {sync: false}), callback)
}

function gitRemoveRemote(dir, callback) {
	if (_.isFunction(dir) && !callback) {
		callback = dir
		dir = "."
	}

	process.stdout.write("Resetting git...\n".green)

	/*let cmd = ['rm','-rf', `${dir}/.git`]
	return exec(cmd, execOpts, callback)*/
	
	fs.deleteDir(`${dir}/.git`, () => {
		if (_.isFunction(callback)) callback()
	});
}

///////////////
// Dockerize //
///////////////

////////////
// Create //
////////////

function create(name) {
	var self = this
	if (!_.isString(name)) {
		process.stdout.write("Please provide a name for your project\n".red)
		return false
	}
	
	createProject(name)
	.then(removeOrigin)
	.then(cleanFiles)
	.then(function() {
		process.stdout.write("Project cloned.\n".green)
	})
	.catch(function(e, stderr) {
		if (_.isString(e)) process.stdout.write(e.red)
		else process.stdout.write(e)
	})
}

function createProject(name) {
	return Q.promise(function(resolve, reject) {
		if (fs.existsSync(name)) {
			return reject("A folder named <" + name + "> already exists")
		}

		process.stdout.write("Creating new project ".green + name +  "\n".green)
		
		gitClone(name, (err, stdout, stderr) => {
			if (err) return reject(err, stderr)
			log(false, stdout, stderr)

			resolve(name)
		})
	})
}

function removeOrigin(name) {
	return Q.promise(function(resolve, reject) {
		gitRemoveRemote(name, (err, stdout, stderr) => {
			if (err) return reject(err, stderr)
			log(false, stdout, stderr)
			
			resolve(name)
		})
	})
}

function cleanFiles(name) {
	return Q.promise(function(resolve, reject) {

		fs.listAll(`${CWD}/${name}`, { map: filesMap }, function (err, files) {
			files.forEach(f => {
				if (".md" == f.ext || ".png" == f.ext || ".gitignore" == f.ext) fs.deleteFile(f.path) 
			})
		});

		resolve();
	})
}

///////////
// Build //
///////////

function build(type) {
	process.stdout.write("Building docker for the specified environment\n".green)
	type = _.isString(type) ? type : _.isObject(type.environment) ? type.environment : false
	
	if (!type) {
		error("\nPlease provide build environment [dev|prod]")
		return
	}

	var cmd = ["docker-compose", "-f", "yml/docker-compose.yml", "--project-name", projectName()]
	if (type == "dev") {
		cmd = cmd.concat(["-f", "yml/docker-compose.dev.yml"]) //, "--remove-orphans"
	}

	cmd = cmd.concat(["up", "-d", "--build"])

	exec(cmd, _.extend(execOpts, {sync: false}), log)
}

///////////
// Clean //
///////////

function clean(rm) {
	var self = this

	if (self.rm) {
		process.stdout.write("Careful! This command is to be used only on development environments \n".yellow)
		process.stdout.write("It will delete all docker networks and volumes along with all orphan containers\n".red)
		exec(["docker", "network", "prune", "-f"], _.extend(execOpts, {sync: false}), (err, stdout, stderr) => {
			log(err, stdout, stderr)
			exec(["docker", "volume", "prune", "-f"], _.extend(execOpts, {sync: false}), (err, stdout, stderr) => {
				log(err, stdout, stderr)
				exec(["docker-compose", "down"], 
				 _.extend(execOpts, {cwd: `${CWD}/yml`, sync: false}), log)
			})
		})
	} else {
		exec(["docker-compose", "down"], 
			 _.extend(execOpts, {cwd: `${CWD}/yml`, sync: false}), log)
	}
}

///////////////////
// Load balancer //
///////////////////

function loadBalancer() {
	var self = this

	if (self.rm) {
		removeLoadBalancer()
		return
	}

	process.stdout.write("Creating main network and load balancer\n".green)
	exec("docker network ls", execOpts, (error, stdout, stderr) => {
		process.stdout.write("Showing all networks: \n".yellow)
		process.stdout.write(stdout.blue)
		
		if (stdout.indexOf("loadbalancer") != -1) {
			process.stdout.write("Network already exists".green)
		} else {
			exec("docker-compose -f network/docker-compose.yml up -d --build", execOpts, log)
		}
	})
}

function removeLoadBalancer() {
	process.stdout.write("Removing main network and load balancer\n".green)
	exec(["docker-compose", "down"], _.extend(execOpts, {cwd: CWD + "/network", sync: false}) , log)
}

////////////
// Deploy //
////////////

function deploy() {

}

////////////
// Get in //
////////////

function getin(service) {
	if (!_.isString(service)) return log(null, null, `Command not used correctly. You must provide -s`)

	process.stdout.write(`Getting into container ${service}\n`.green)
	
	service = service.toLowerCase()

	let found = false
	_(schemaMap).mapObject((v, k) => {
		if (k == service) found = true
	})

	if (service == "mysql") service = "db"
	
	exec([`docker`, `exec`, `-it`, `${service}_${projectName()}${projectBranch()}`, `sh`], _.extend(execOpts, {sync: false}), log)
}

////////////
// Export //
////////////

function exportService(service, tag) {
	if (!_.isString(service)) return log(null, null, `Command not used correctly. You must provide -s`)
	if (!_.isString(tag)) tag = projectVersion()
	
	process.stdout.write(`Exporting ${service} in ${CWD}/dist \n`.green)
	fs.createDirSync(`${CWD}/dist`);

	if (service == "mysql") service = "db"

	let cmd = [
		"docker", 
		"save", 
		"-o", 
		`${CWD}/dist/${service}_${projectName()}${projectBranch()}.tar`, 
		`${service}_${projectName()}${projectBranch()}:${tag}`
	]

	exec(cmd, _.extend(execOpts, {sync: false}), log);
}

//////////
// Load //
//////////

function loadService(service) {
	if (!_.isString(service)) return log(null, null, `Command not used correctly. You must provide -s`)
	
	process.stdout.write(`Loading ${service} in ${CWD}/dist \n`.green)

	if (service == "mysql") service = "db"
	if (!fs.existsSync(`${CWD}/dist/${service}_${projectName()}${projectBranch()}.tar`)) return log(null, null, `Image doesn't seem to exist in ./dist/ \n`.red)

	let cmd = ["docker", "load", "-i", `${CWD}/dist/${service}_${projectName()}${projectBranch()}.tar`]

	exec(cmd, _.extend(execOpts, {sync: false}), log);
}

///////////
// Setup //
///////////

function writeEnv(opts) {
	return Q.promise((resolve, reject) => {
		envs.push(opts)
		resolve()
	})
}

function ask(block) {
	return Q.promise((resolve, reject) => {
		let schema = null
		try {
			schema = require(`${__dirname}/services_conf/${block}`)
		} catch(e) {
			return resolve({service: block})
		}
		process.stdout.write(`\n${block.toUpperCase()}\n`.green)

		if (!schema.prompt) return resolve({service: block, source: schema})

		if (_.isArray(schema.prompt)) {
			inquirer.prompt(schema.prompt)
			.then((d) => {
				resolve({service: block, main: d, source: schema})
			})
		} else {
			if (_.isArray(schema.prompt.development)) {
				process.stdout.write("\n > Development variables\n".blue)
				
				inquirer.prompt(schema.prompt.development)
				.then((dev) => {
					if (!_.isArray(schema.prompt.production)) return resolve({service: block, dev: dev, source: schema})
					process.stdout.write("\n > Production variables\n".blue)
					
					inquirer.prompt(schema.prompt.production)
					.then((prod) => {
						return resolve({service: block, dev: dev, prod: prod, source: schema})
					})
				})
			}
		}
	})
}

function recursiveAsk(schemas) {
	let schema = null
	if (schemas && (schema = schemas.shift())) {
		return ask(schema)
		.then(writeEnv)
		.then(() => {
			return recursiveAsk(schemas)
		})
	} else {
		return Q.resolve()
	}
}

function processSingle(node, env) {
	let updated = {
		service: env.service,
		source: env.source
	}
	updated[node] = {}
	
	_.mapObject(env[node], (value, key) => {
		let mapKey = env.source.map && env.source.map[key] ? env.source.map[key] : null

		if (_.isArray(mapKey)) _(mapKey).each( k => updated[node][k] = value )
		else if (_.isString(mapKey)) updated[node][mapKey] = value
		else updated[node][key] = value
	})

	updated[node] = _.extend(env.source.defaults ? env.source.defaults[node] : {}, updated[node])

	return updated
}

function processConfig() {
	return Q.promise((resolve, reject) => {
		let all = []
		envs.forEach((env, index) => {
			if (env.main) all.push(processSingle("main", env))
			else all.push( _.extend(
				processSingle("dev", env), 
				processSingle("prod", env) ))
		})
		resolve(all)
	})
}

function linker(envs) {
	return Q.promise((resolve, reject) => {
		let linked = []
		envs.forEach((env, index) => {
			let current = env
			// continue if there aren't any dependencies for the current service
			if (!current.source.dependencies) return linked.push(current)

			// for each dependency of the current object
			current.source.dependencies.forEach((dep) => {
				_(dep).mapObject((pointer, key) => {
					_(pointer).mapObject((pointerKey, service) => {
						let serviceIndex = order.indexOf(service)
						let serviceObject = -1 != serviceIndex ? envs[++serviceIndex] : envs[0]

						if (current.dev && current.dev[key]) return
						if (current.prod && current.prod[key]) return

						if (serviceObject.main) {
							if (current.dev) current.dev[key] = serviceObject.main[pointerKey]
							if (current.prod && !current.prod[key]) current.prod[key] = serviceObject.main[pointerKey]
						}

						if (serviceObject.dev && current.dev) current.dev[key] = serviceObject.dev[pointerKey]
						if (serviceObject.prod && current.prod && !current.prod[key])	current.prod[key] = serviceObject.prod[pointerKey]

						if (current.main && serviceObject.dev) current.main[key] = serviceObject.dev[pointerKey]
					})
				})
			})
			linked.push(current)
		})

		return resolve(linked)
	})
}

function makeConfjson(all) {
	return Q.promise((resolve, reject) => {
		let omitted = []
		all.forEach(conf => {
			if (conf.source) {
				conf.source = { path: conf.source.path }
				if (conf.source.path != null) omitted.push(conf)
			}
		})

		omitted = {globals: omitted.shift(), services: omitted}
		fs.createFileSync(`${CWD}/config.json`, JSON.stringify(omitted, null, "    "))

		return resolve(omitted)
	})
}

function toEnv(ob) {
	let str = [];

	_(ob).mapObject((v, k) => {
		if (undefined == v || 'undefined' == v) return
		str.push(`${k.replace(" ", "_")}=` + (!/\w/g.test(v) || !v.length ? `'${v}'` : v))
	})
	return str.join("\n")
}

function updateYml(keys, file) {
	return Q.promise((resolve, reject) => {
		try {
			if (!fs.existsSync(`${file}.orig`)) fs.writeFileSync(`${file}.orig`, fs.readFileSync(file))

			let yml = yaml.safeLoad(fs.readFileSync(`${file}.orig`))
			let srv = {}
			
			for (let k in yml.services) if (keys.indexOf(k) !== -1) srv[k] = yml.services[k]
			yml.services = srv
			
			fs.writeFileSync(file, yaml.safeDump(yml))
			resolve()
		} catch(e) {
			reject(e)
		}
	})
}

function updateYmls(keys) {
	return Q.promise((resolve, reject) => {
		updateYml(keys, `${CWD}/yml/docker-compose.yml`)
		.then(t => updateYml(keys, `${CWD}/yml/docker-compose.dev.yml`))
		.then(resolve)
		.catch(reject)
	})
}

function writeEnvFiles(config) {
	return Q.promise((resolve, reject) => {
		if (!_(config).isObject()) {
			if (!fs.existsSync(`${CWD}/config.json`)) {
				process.stdout.write("Missing config.json".red)
				return reject()
			} else {
				config = fs.readJSONSync(`${CWD}/config.json`)
			}
		}

		if (config.globals) {
			if (config.globals.source.path != null) {
				fs.createFileSync(`${CWD}/${config.globals.source.path}.env`, toEnv(config.globals.main))
			}
		}

		_(config.services).each((service) => {
			if (service.source && service.source.path) {
				if (_.isObject(service.dev)) {
					fs.createFileSync(`${CWD}/${service.source.path}.dev.env`, toEnv(service.dev))
				}
				if (_.isObject(service.prod)) {
					fs.createFileSync(`${CWD}/${service.source.path}.env`, toEnv(service.prod))
				}
			}
		})

		resolve()
	})
}

function setup() {
	ask('main')
	.then(writeEnv)
	.then(m => ask("services"))
	.then((a) => {
		let services = []
		let keys = []

		a.main.services.forEach((service) => {
			let srv = schemaMap[service] || service
			if (services.indexOf(srv) == -1) {
				services.push(srv)
				keys.push(service)
			}
		})
		order = _(services).clone()
		return recursiveAsk(services).then(t => updateYmls(keys))
	})
	.then(processConfig)
	.then(linker)
	.then(makeConfjson)
	.then(writeEnvFiles)
	//.then(gitInit)
	.catch(e => process.stdout.write(e.toString().red))
}

function generateEnvs() {
	writeEnvFiles()
}

/////////////////////////
// Configure commander //
/////////////////////////

program
.version(manifest.version, '-v, --version')
.description(manifest.description)
.usage('command <args> [options]')

////////////
// Init P //
////////////

program
.command('deploy')
.description('Deploy the project')
.action(deploy)

program
.command('setup')
.description('Configure project variables')
.action(setup)

program
.command('create')
.description('Initialize a new project')
.action(create)

program
.command('build')
.option("-e, --environment", "Type of build. [dev|prod]", /^(dev|prod)$/, "dev")
.description('Build the project')
.action(build)

program
.command('clean')
.description('Clean the whole docker environment')
.option("-r, --rm", "Remove networks and volumes")
.action(clean)

program
.command('loadbalancer')
.alias("lb")
.option("-r, --rm", "Remove loadbalancer and network")
.description('Create a load balancer and the main network where to attach all the projects')
.action(loadBalancer)

program
.command('generate-env')
.alias("gen")
.description("Generates all env files from the config.json file.")
.action(generateEnvs)

program
.command('get-in')
.alias('run')
.option('-s, --service', "Service name to get in to i.e. php")
.description("Get inside the shell of container and run your commands to update it")
.action(getin)

program
.command('export')
.option('-s, --service', "Service name to export i.e. php")
.option('-t, --tag', "Service tag i.e. 1.0.0. If not provided, `latest` will be used")
.description("Export a container and save it under ./dist folder as a tar image")
.action(exportService)

program
.command('load')
.option('-s, --service', "Service name to load i.e. php")
.description("Load a previously exported image. The command will look in ./dist folder for the image")
.action(loadService)

// Parse the input arguments
program.parse(process.argv)

// Start commander
if (program.args.length === 0 || typeof program.args[program.args.length - 1] === 'string') {
	program.help()
} else {

}