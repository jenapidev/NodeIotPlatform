'use strict';

const db = require('./index');
const inquirer = require('inquirer');
const chalk = require('chalk');
const debug = require('debug')('nodeproject:db:setup');

const prompt = inquirer.createPromptModule();

async function setup() {
	if (process.argv.indexOf('-y') == -1) {
		const answer = await prompt([
			{
				type: 'confirm',
				name: 'setup',
				message: 'this will destroy the database. Are you sure?',
			},
		]);
		if (!answer.setup) {
			return console.log('the database was not destroyed');
		}
	}

	const config = {
		database: process.env.DB_NAME || 'nodeproject',
		username: process.env.DB_USER || 'jeanpy',
		port: process.env.DB_PORT || '5432',
		password: process.env.DB_PASS || '0409',
		host: process.env.DB_HOST || 'localhost',
		dialect: 'postgres',
		logging: (s) => debug(s),
		setup: true,
	};

	await db(config).catch(handleError);

	console.log('Success! (?)🙃');
	process.exit(0);
}

const handleError = (err) => {
	console.error(`${chalk.red('[fatal error]')} ${err.message}`);
	console.error(err.stack);
	process.exit(1);
};

setup();
