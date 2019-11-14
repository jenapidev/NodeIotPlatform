'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')

const config = {
  logging () {}
}

const MetricStub = {
  belongsTo: sinon.spy()
}

const single = Object.assign({}, agentFixtures.single)
const id = 1
let AgentStub = null
let db = null
let sandbox = null
const uuid = 'yyy-yyy-yyy'
const connectedArgs = {
  where: {
    connected: true
  }
}
const usernameArgs = {
  where: {
    username: 'test'
  }
}
const uuidArgs = {
  where: {
    uuid
  }
}
const newAgent = {
  uuid: '123-123-123',
  pid: 0,
  name: 'foo',
  username: 'foo',
  hostname: 'char',
  connected: false
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model create
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(
    Promise.resolve({
      toJSON () {
        return newAgent
      }
    })
  )

  // Model findAll stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(agentFixtures.all)
  AgentStub.findAll
    .withArgs(connectedArgs)
    .returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll
    .withArgs(usernameArgs)
    .returns(Promise.resolve(agentFixtures.test))

  // Model findOne stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne
    .withArgs(uuidArgs)
    .returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model update
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // Model findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById
    .withArgs(id)
    .returns(Promise.resolve(agentFixtures.byId(id)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.resetHistory()
})

test('Agent', (t) => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', (t) => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    'Argument should be the MetricModel'
  )
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    'Argument should be the AgentModel'
  )
})

test.serial('Agent#findById', async (t) => {
  const agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(
    AgentStub.findById.calledWith(id),
    'findById should be called with specified id'
  )

  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})

test.serial('Agent#findByUuid', async (t) => {
  const agent = await db.Agent.findByUuid(uuid)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(
    AgentStub.findOne.calledWith(uuidArgs),
    'findOne should be called with specified uuid'
  )

  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'should be the same')
})

test.serial('Agent#createOrUpdate - exists', async (t) => {
  const agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'find one should be called')
  t.true(AgentStub.findOne.calledTwice, 'find one should be called twice')
  t.true(AgentStub.update.called, 'updated should be called once')
  t.deepEqual(agent, single, 'agent should be the same')
})

test.serial('Agent#createOrUpdate - new', async (t) => {
  const agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'find one should be called')
  t.true(AgentStub.findOne.calledOnce, 'find one should be called once')
  t.true(
    AgentStub.findOne.calledWith({ where: { uuid: newAgent.uuid } }),
    'find one should be called with arg(uuid)'
  )
  t.true(AgentStub.create.called, 'updated should be called')
  t.true(AgentStub.create.calledOnce, 'updated should be called once')
  t.true(
    AgentStub.create.calledWith(newAgent),
    'updated should be called once'
  )
  t.deepEqual(agent, newAgent, 'agent should be the same')
})

test.serial('Agent#findAll', async (t) => {
  const agent = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'find one should be called')
  t.deepEqual(agent, agentFixtures.all, 'should be the same')
})

test.serial('Agent#findByUsername', async (t) => {
  const agents = await db.Agent.findByUsername('test')
  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called onnce')
  t.true(
    AgentStub.findAll.calledWith(usernameArgs),
    'findAll should be called with usernameArgs'
  )
  t.is(
    agents.length,
    agentFixtures.test.length,
    'Agents amounts should be the same'
  )
  t.deepEqual(agents, agentFixtures.test, 'Agents should be the same')
})

test.serial('Agent#findConnected', async (t) => {
  const agents = await db.Agent.findConnected()
  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called onnce')
  t.true(
    AgentStub.findAll.calledWith(connectedArgs),
    'findAll should be called with connectedArgs'
  )
  t.is(
    agents.length,
    agentFixtures.connected.length,
    'Agents amounts should be the same'
  )
  t.deepEqual(agents, agentFixtures.connected, 'Agents should be the same')
})
