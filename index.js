#!/usr/bin/env node
'use strict';

const manifest   	= require('./package.json');
const CWD 			= process.cwd();
const async 		= require('async');
const gm 			= require('gm');
const path 			= require('path');
const program 		= require('commander');
const _ 			= require('underscore');
const inquirer 		= require('inquirer');
const prompt 		= require('prompt');
const child_process	= require('child_process');
const escape 		= require("shell-escape");
const env 			= require('node-env-file');
const fs			= require('fs-extended');
const Q				= require('q');
const containers 	= "https://github.com/caffeinalab/docker-webdev-env";

const execOpts 		= { cwd: CWD, stdio:[0,1,2] }; //stdio is only needed for execSync
const exec 			= function(cmd, opts, callback) {
	if (manifest.debug) console.log(cmd, opts);
	child_process.exec(cmd, opts, callback);
};
reqEnvOrExit();

// Helpers

const log = (err, stdout, stderr) => {
	//if (err) error(err, 1, true);

	if (stderr != null && stderr != "") process.stdout.write(`${stderr}\n`.yellow);
	if (stdout != null && stdout != "") process.stdout.write(`${stdout}\n`.blue);
};

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

// Log an event to the CLI + GA, and miserably exit
function error(msg, code, dont_exit) {
	process.stdout.write(msg.red);

	if (dont_exit == false) {
		process.exit( code || 1 );
	}
}

function reqEnvOrExit(){
	if (!fs.existsSync(CWD + '/.env') && !fs.existsSync(CWD + '/yml/.env')) {
		process.stdout.write('.env file is missing.\n\n'.red);
		if (fs.existsSync(CWD + '/.env.sample')) {
			env(CWD + '/.env.sample');
		}
	} 

	if (fs.existsSync(CWD + '/.env')) {
		env(CWD + '/.env');
	}

	if (fs.existsSync(CWD + "/yml/.env")) {
		env(CWD + '/yml/.env', {overwrite: true});
	}
}

// Git

function gitCleanOrExit() {
	var out = exec('git status --porcelain', execOpts).output || '';
	var lines = (out.match(/\n/g) || []).length;
	if (lines > 0) {
		process.stdout.write('Current working directory is not clean. Please commit current changes before doing anything');
	}
}

function gitTag(version) {
	process.stdout.write("Tagging current changes...");
	exec('git tag -d "' + version + '"', execOpts);
	exec('git tag "' + version + '" && git push --tags', execOpts);
}

function gitCommit(message) {
	process.stdout.write("Commiting current changes...");
	exec('git add -A && git commit -am "' + message + '" && git push', execOpts);
}

function gitClone(dir, callback) {
	if (_.isFunction(dir) && !callback) {
		callback = dir;
		dir = ".";
	}

	let cmd = ['git','clone', containers, dir].join(" ");
	process.stdout.write("Cloning docker infrastructure...\n".green);
	exec(cmd, execOpts, callback);
}

function gitRemoveRemote(dir, callback) {
	if (_.isFunction(dir) && !callback) {
		callback = dir;
		dir = ".";
	}

	let cmd = ['rm','-rf', dir + "/.git"].join(" ");
	process.stdout.write("Resetting git...\n".green);
	exec(cmd, execOpts, callback);
}

// Dockerize

// Create

function create(name) {
	var self = this;
	if (!_.isString(name)) {
		process.stdout.write("Please provide a name for your project\n".red);
		return false;
	}
	
	createProject(name)
	.then(removeOrigin)
	.then(cleanFiles)
	.then(function() {
		console.log("Project cloned.\n".green);
	})
	.catch(function(e, stderr) {
		if (_.isString(e)) console.log(e.red);
		else console.log(e);
	});
}

function createProject(name) {
	return Q.promise(function(resolve, reject) {
		if (fs.existsSync(name)) {
			return reject("A folder named <" + name + "> already exists");
		}

		process.stdout.write("Creating new project ".green + name +  "\n".green);
		
		gitClone(name, (err, stdout, stderr) => {
			if (err) return reject(err, stderr);
			log(false, stdout, stderr);
			
			resolve(name);
		});
	});
}

function removeOrigin(name) {
	return Q.promise(function(resolve, reject) {
		gitRemoveRemote(name, (err, stdout, stderr) => {
			if (err) return reject(err, stderr);
			log(false, stdout, stderr);
			
			resolve(name);
		});
	});
}

function cleanFiles(name) {
	return Q.promise(function(resolve, reject) {
		let cmd = ["rm", "-rf", "*.png", ".gitignore", "*.md"].join(" ");
		exec(cmd, _.extend(execOpts, {cwd: `${CWD}/${name}`}), (err, stdout, stderr) => {
			if (err) return reject(err, stderr);
			log(false, stdout, stderr);
			
			resolve(stdout, stderr);
		});
	});
}

// Build

function build(type) {
	process.stdout.write("Building docker for the specified environment\n".green);
	type = _.isString(type) ? type : _.isObject(type.environment) ? type.environment : false;
	
	if (!type) {
		error("\nPlease provide build environment [dev|prod]");
		return;
	}

	var cmd = ["docker-compose","-f", "yml/docker-compose.yml"];
	if (type && type == "dev") {
		cmd = cmd.concat(["-f","yml/docker-compose.dev.yml", "up", "-d", "--build", "--remove-orphans"]);
	} else if (type && type == "prod") {
		cmd = cmd.concat(["up", "-d", "--build"]);
	}

	if (type) exec(cmd.join(" "), execOpts, log);
	else return;
}


function selectServices() {
	//prompt;
}

function configureBaseSchema() {
	return Q.promise(function(resolve, reject) {
		
	});
}

// Clean

function clean() {

	process.stdout.write("Careful! This command is to be used only on development environments \n".yellow);
	process.stdout.write("It will delete all docker networks and volumes along with all orphan containers\n".red);

	exec("docker network prune -f && docker volume prune -f", execOpts, (err, stdout, stderr) => {
		process.stdout.write(`${stderr} \n`.red);

		exec("docker-compose down", _.extend(execOpts, {cwd: `${CWD}/yml`}), log);
	});
}

// Load balancer

function loadBalancer() {
	var self = this;

	if (self.rm) {
		removeLoadBalancer();
		return;
	}

	process.stdout.write("Creating main network and load balancer\n".green);
	exec("docker network ls", execOpts, (error, stdout, stderr) => {
		process.stdout.write("Showing all networks: \n".yellow);
		process.stdout.write(stdout.blue);
		
		if (stdout.indexOf("loadbalancer") != -1) {
			process.stdout.write("Network already exists".green);
		} else {
			exec("docker-compose -f network/docker-compose.yml up -d --build", execOpts, log);
		}
	});
}

function removeLoadBalancer() {
	process.stdout.write("Removing main network and load balancer\n".green);
	exec("docker-compose down", _.extend(execOpts, {cwd: CWD + "/network"}) , log);
}

/////////////////////////
// Configure commander //
/////////////////////////

program
.version(manifest.version, '-v, --version')
.description(manifest.description)
.usage('command <args> [options]');

////////////
// Init P //
////////////

program
.command('create')
.description('Initialize a new project')
.action(create);

program
.command('build')
.option("<-e, --environment", "Type of build. [dev|prod]", /^(dev|prod)$/, "dev")
.description('Build the project')
.action(build);

program
.command('clean')
.description('Clean the whole docker environment')
.action(clean);

program
.command('loadbalancer')
.alias("lb")
.option("-r, --rm", "Remove loadbalancer and network")
.description('Create a load balancer and the main network where to attach all the projects')
.action(loadBalancer);

// Parse the input arguments
program.parse(process.argv);

// Start commander
if (program.args.length === 0 || typeof program.args[program.args.length - 1] === 'string') {
	program.help();
} else {

}