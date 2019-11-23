'use strict';

const debug = require('debug')('node:mqtt');
const mosca = require('mosca');
const redis = require('redis');
const chalk = require('chalk');
const DB = require('DB');

const { parsePayload } = require('./utils');

const backend = {
	type: 'redis',
	redis,
	return_buffers: true,
};

const settings = {
	port: 1883,
	backend,
};

const config = {
	database: process.env.DB_NAME || 'nodeproject',
	username: process.env.DB_USER || 'jeanpy',
	port: process.env.DB_PORT || '5432',
	password: process.env.DB_PASS || '0409',
	host: process.env.DB_HOST || 'localhost',
	dialect: 'postgres',
	logging: (s) => debug(s),
};

const server = new mosca.Server(settings);

const clients = new Map();

let Agent, Metric;

server.on('clientConnected', (client) => {
	debug(`Client Connected: ${client.id}`);
	clients.set(client.id, null);
});

server.on('clientDisconnected', async (client) => {
	debug(`Client Disconnected: ${client.id}`);
	const agent = clients.get(client.id);

	if (agent) {
		agent.connected = false;

		try {
			await Agent.createOrUpdate(agent);
		} catch (err) {
			return handleError(err);
		}

		clients.delete(client.id);

		server.publish({
			topic: 'agent/disconnected',
			payload: JSON.stringify({
				uuid: agent.uuid,
			}),
		});
		debug(
			`Client (${client.id}) associated to agent (${agent.uuid}) disconnected`,
		);
	}
});

server.on('published', async (packet, client) => {
	debug(`Received: ${packet.topic}`);

	switch (packet.topic) {
		case 'agent/connected':
		case 'agent/disconnected':
			debug(`Payload: ${packet.payload}`);
			break;
		case 'agent/message':
			debug(`Payload: ${packet.payload}`);

			const payload = parsePayload(packet.payload);

			if (payload) {
				payload.agent.connected = true;

				let agent;
				try {
					agent = await Agent.createOrUpdate(payload.agent);
				} catch (err) {
					return handleError(err);
				}

				debug(`Agent: ${agent.uuid} saved`);

				//Notify if agent is connected
				if (!clients.get(client.id)) {
					clients.set(client.id, agent);
					server.publish({
						topic: 'agent/connected',
						payload: JSON.stringify({
							agent: {
								uuid: agent.uuid,
								name: agent.name,
								hostname: agent.hostname,
								pid: agent.pid,
								connected: agent.connected,
							},
						}),
					});
				}

				// store the metrics

				await Promise.all(
					payload.metrics.map((metric) => {
						return Metric.create(agent.uuid, metric)
							.then((metric) =>
								debug(`Metric: ${metric.id} saved on Angent: ${agent.uuid}`),
							)
							.catch(handleError);
					}),
				);
			}
			break;
	}
});

server.on('ready', async () => {
	const services = await DB(config).catch(handleFatalError);

	Agent = services.Agent;
	Metric = services.Metric;

	console.log(`${chalk.green('[node-mqtt]')} server is running`);
});

server.on('error', handleFatalError);

function handleFatalError(err) {
	console.error(`${chalk.red('[fatal error]')} ${err.message}`);
	console.error(err.stack);
	process.exit(1);
}

function handleError(err) {
	console.error(`${chalk.red('[fatal error]')} ${err.message}`);
	console.error(err.stack);
}

process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);
