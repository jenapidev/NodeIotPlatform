'use strict';

const db = require('../');

const run = async () => {
	const config = {
		database: process.env.DB_NAME || 'nodeproject',
		username: process.env.DB_USER || 'jeanpy',
		password: process.env.DB_PASS || '0409',
		host: process.env.DB_HOST || 'localhost',
		dialect: 'postgres',
	};

	const { Agent, Metric } = await db(config).catch(handleFatalError);

	const agent = await Agent.createOrUpdate({
		uuid: 'yyy',
		name: 'foo',
		username: 'foo',
		hostName: 'foo',
		pid: 1,
		conected: true,
	}).catch(handleFatalError);

	console.log('--agent--');
	console.log(agent);

	const agents = await Agent.findAll().catch(handleFatalError);
	console.log('--agents--');
	console.log(agents);

	const metric = await Metric.create(agent.uuid, {
		type: 'memory',
		value: '300',
	}).catch(handleFatalError);

	console.log('--metric--');
	console.log(metric);

	const metrics = await Metric.findByAgentUuid(agent.uuid).catch(
		handleFatalError,
	);

	console.log('--metrics--');
	console.log(metrics);

	const metricsByTypeAgent = await Metric.findByTypeAgentUuid(
		'memory',
		agent.uuid,
	);

	console.log('--metrics by type agent uuid--');
	console.log(metricsByTypeAgent);
};

const handleFatalError = (err) => {
	console.log(err.message);
	console.log(err.stack);
	process.exit(1);
};

run();
