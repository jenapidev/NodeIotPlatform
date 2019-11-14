'use-strict'

const setUpDataBase = require('./lib/db')
const setupAgent = require('./lib/agent')
const setupMetric = require('./lib/metric')
const setupAgentModel = require('./models/agent.js')
const setupMetricsModel = require('./models/metric.js')
const defaults = require('defaults')

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'sqlite',
    pol: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    }
  })

  const sequelize = setUpDataBase(config)
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricsModel(config)

  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)

  await sequelize.authenticate()
  if (config.setup) {
    await sequelize.sync({ force: true })
  }

  const Agent = setupAgent(AgentModel)
  const Metric = setupMetric(MetricModel, AgentModel)

  return {
    Agent,
    Metric
  }
}
