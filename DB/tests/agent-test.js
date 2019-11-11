'use strict';

const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const agentFixtures = require('./fixtures/agent');

let config = {
	logging() {},
};

let MetricStub = {
	belongsTo: sinon.spy(),
};

let single = Object.assign({}, agentFixtures.single);
let id = 1;
let AgentStub = null;
let db = null;
let sandbox = null;
let uuid = 'yyy-yyy-yyy';
let uuidArgs = {
	where: {
		uuid,
	},
};

test.beforeEach(async () => {
	sandbox = sinon.createSandbox();

	AgentStub = {
		hasMany: sandbox.spy(),
	};

	// Model findOne stub
	AgentStub.findOne = sandbox.stub();
	AgentStub.findOne
		.withArgs(uuidArgs)
		.returns(Promise.resolve(agentFixtures.byUuid(uuid)));

	// Model update
	AgentStub.update = sandbox.stub();
	AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single));

	// Model findById Stub
	AgentStub.findById = sandbox.stub();
	AgentStub.findById
		.withArgs(id)
		.returns(Promise.resolve(agentFixtures.byId(id)));

	const setupDatabase = proxyquire('../', {
		'./models/agent': () => AgentStub,
		'./models/metric': () => MetricStub,
	});

	db = await setupDatabase(config);
});

test.afterEach(() => {
	sandbox && sinon.resetHistory();
});

test('Agent', (t) => {
	t.truthy(db.Agent, 'Agent service should exist');
});

test.serial('Setup', (t) => {
	t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed');
	t.true(
		AgentStub.hasMany.calledWith(MetricStub),
		'Argument should be the MetricModel',
	);
	t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed');
	t.true(
		MetricStub.belongsTo.calledWith(AgentStub),
		'Argument should be the AgentModel',
	);
});

test.serial('Agent#findById', async (t) => {
	let agent = await db.Agent.findById(id);

	t.true(AgentStub.findById.called, 'findById should be called on model');
	t.true(AgentStub.findById.calledOnce, 'findById should be called once');
	t.true(
		AgentStub.findById.calledWith(id),
		'findById should be called with specified id',
	);

	t.deepEqual(agent, agentFixtures.byId(id), 'should be the same');
});

test.serial('Agent#createOrUpdate - exists', async (t) => {
	let agent = await db.Agent.createOrUpdate(single);

	t.true(AgentStub.findOne.called, 'find one should be called');
	t.true(AgentStub.findOne.calledTwice, 'find one should be called twice');
	t.true(AgentStub.update.called, 'updated should be called once');
	t.deepEqual(agent, single, 'agent should be the same');
});

test.serial('Agent#findAll - exists', async (t) => {
	let agent = await db.Agent.findAll();

	t.true(AgentStub.findAll.called, 'find one should be called');
	t.deepEqual(agent, agentFixtures.all, 'should be the same');
});
