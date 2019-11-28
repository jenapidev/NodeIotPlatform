'use strict';
const debug = require('debug')('nodeIoT:agent');
const os = require('os');
const mqtt = require('mqtt');
const util = require('util');
const defaults = require('defaults');
const EventEmiter = require('events');
const uuid = require('uuid');
const { parsePayload } = require('../utils/parsePayload');

const defOptions = {
	name: 'untitled',
	username: 'jeanpy',
	interval: 5000,
	mqtt: {
		host: 'mqtt://localhost',
	},
};

class Agent extends EventEmiter {
	constructor(opts) {
		super();

		this.options = defaults(opts, defOptions);
		this._started = false;
		this._timer = null;
		this._client = null;
		this._agentId = null;
		this._metrics = new Map();
	}

	addMetric(type, fn) {
		this._metrics.set(type, fn);
	}

	removeMetric() {
		this._metrics.delete(type);
	}

	connect() {
		if (!this._started) {
			const { options } = this;
			this._client = mqtt.connect(options.mqtt.host);
			this._started = true;

			this._client.subscribe('agent/message');
			this._client.subscribe('agent/connected');
			this._client.subscribe('agent/disconnected');

			this._client.on('connect', () => {
				this._agentId = uuid.v4();
				this.emit('connected', this._agentId);

				this._timer = setInterval(async () => {
					if (this._metrics.size > 0) {
						let message = {
							agent: {
								uuid: this._agentId,
								username: options.username,
								name: options.name,
								hostname: os.hostname() || 'localhost',
								pid: process.pid,
							},
							metrics: [],
							timestamp: new Date().getTime(0),
						};

						for (let [metric, fn] of this._metrics) {
							if (fn.length === 1) {
								fn = util.promisify(fn);
							}

							message.metrics.push({
								type: metric,
								value: await Promise.resolve(fn()),
							});
						}

						debug('message:', message);

						this._client.publish('agent/message', JSON.stringify(message));
						this.emit('message', message);
					}
				}, options.interval);
			});

			this._client.on('message', (topic, payload) => {
				payload = parsePayload(payload);

				let broadcast = false;
				switch (topic) {
					case 'agent/connected':
					case 'agent/disconnected':
					case 'agent/message':
						broadcast =
							payload && payload.agent && payload.agent.uuid !== this.uuid;
						break;
				}

				if (broadcast) {
					this.emit(topic, payload);
				}
			});

			this._client.on('error', () => this.disconnect());
		}
	}

	disconnect() {
		if (this._started) {
			clearInterval(this._timer);
			this._started = false;
			this.emit('disconnected', this._agentId);
			this._client.end();
		}
	}
}

module.exports = Agent;
