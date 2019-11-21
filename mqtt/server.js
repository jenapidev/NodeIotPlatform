'use strict';

const debug = require('debug')('node:mqtt');
const mosca = require('mosca');
const redis = require('redis');
const chalk = require('chalk');
const DB = require('DB');

const backend = {
	type: 'redis',
	redis,
	return_buffers: true,
};

const settings = {
	port: 6379,
	backend,
};

const config = {
	database: process.env.DB_NAME || 'nodeproject',
	username: process.env.DB_USER || 'jenapi',
	port: process.env.DB_PORT || '5433',
	password: process.env.DB_PASS || '0409',
	host: process.env.DB_HOST || 'localhost',
	dialect: 'postgres',
	logging: (s) => debug(s),
};

const server = new mosca.Server(settings);

let Agent, Metric;

server.on('clientConnected', (client) => {
	debug(`Client Connected: ${client.id}`);
});

server.on('clientDisconnected', (client) => {
	debug(`Client Disconnected: ${client.id}`);
});

server.on('published', (packet, client) => {
	debug(`Received: ${packet.topic}`);
	debug(`Payload: ${packet.payload}`);
});

server.on('ready', async () => {
	const services = await DB(config).catch(handleFatalError);

	Agent = services.Agent;
	Metric = services.Metric;

	console.log(`${chalk.green('[platziverse-mqtt]')} server is running`);
});

server.on('error', handleFatalError);

function handleFatalError(err) {
	console.error(`${chalk.red('[fatal error]')} ${err.message}`);
	console.error(err.stack);
	process.exit(1);
}

process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);
