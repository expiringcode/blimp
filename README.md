# Docker deploy

This tool lets you create a docker based environment with a micro-services architecture, enabling you to select only the services needed. It focuses on web development with some preconfigured images like Php, Redis, Nginx, Nodejs, Mysql, Mariadb, HHVM. 

The idea behind this tool is to make it easy to start developing web applications. The steps are as follows

- Create a new project based on a template
- Set it up with an easy prompt
  - Select services
  - Configure each service
- Dev/Test cycle locally
- Build/Deploy to the production server
- Enabling A/B testing
- Rollback

## Requirements
* node `^7.0.0`
* yarn `^0.23.0` or npm `^3.0.0`

## Getting Started

After confirming that your development environment meets the specified [requirements](#requirements), you can create a new project by doing the following:

### Install from source

First, clone the project:

```bash
$ git clone https://github.com/blimpair/blimp.git <cli-src>
$ cd <cli-src>
```

Then install dependencies and check to see it works. It is recommended that you use [Yarn](https://yarnpkg.com/) for deterministic installs, but `npm install` will work just as well.

```bash
$ yarn install    # Install project dependencies
$ npm link        # Will link the current directory to your binaries so you can use it as a global executable
```
## Usage

Once you've completed the installation procedure, you can start using the tool.

### CLI API

When running `npm link` the command `blimp` is made available globally

#### Create

```bash
$ blimp create <project name> # This project is created in the current working directory
```
What this command does is clone the main template for web development and strip it of unnecessary files. It also removes `.git` folder so you can init your own repo.

Once this command completes, you ought to `cd` to the project folder

#### Setup

```bash
$ blimp setup
```

Running setup will start a prompt asking you some questions to configure the project. First it will ask what services you want to enable. Once that is completed, it will start subsequent prompts to complete the configuration of each micro-service, diferentiating between `development` and `production` environments. 

> Note that these differences should be minimal. An example is the database password and username which may be more complicated in production while it can be empty in development

> Running this command again after having worked on the project may result in failure when testing your project. Clean it and biuld from scratch.

#### Build

```bash
$ blimp build <env> # requires parameter env which is either dev or prod
```

Building the project for development creates a symbolic link to the services' data volumes into the project folder so you can work seamlessly. In particular your application in development will reside in `<project dir>/data/`
It is required to maintain that directory structure as it determines other services in some cases. Like if you use php and nginx, a folder containing the nginx configuration for the project will be made available which will be automatically loaded by nginx.
The production build command will copy your application code inside the images and will build it tagging with the project version defined in config.json.

#### Clean

```bash
$ blimp clean
```
Be careful when running this command as it will delete all services and their data.

#### Deploy

WIP

## Dependencies

- [Docker template](https://github.com/blimpair/architecture)
  - Architecture for micro-services based web development with the option to create many projects or different instances of the same one.
- [AeriaWork](https://git.caffeina.co/open-source/aeriawork)
  - In the case of php web development, if you create an empty project and build it, the php image will automatically initialize an **AeriaWork** project.

## License

MIT.
