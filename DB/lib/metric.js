'use strict';

module.exports = function setupMetric(MetricModel, AgentModel) {
	const findByAgentUuid = async (uuid) => {
		return MetricModel.findAll({
			attributes: ['type'],
			group: ['type'],
			include: [
				{
					attributes: [],
					model: AgentModel,
					where: {
						uuid,
					},
				},
			],
			raw: true,
		});
	};

	const findByTypeAgentUuid = async (type, uuid) => {
		return MetricModel.findAll({
			attributes: ['id', 'type', 'value', 'createdAt'],
			where: {
				type,
			},
			limit: 20,
			order: [['createdAt', 'DESC']],
			include: [
				{
					attributes: [],
					model: AgentModel,
					where: {
						uuid,
					},
				},
			],
			raw: true,
		});
	};

	const create = async (uuid, metric) => {
		const agent = await AgentModel.findOne({
			where: { uuid },
		});

		if (agent) {
			Object.assign(metric, { agentId: agent.id });
			const result = await MetricModel.create(metric);
			return result.toJSON();
		}
	};

	return {
		create,
		findByAgentUuid,
		findByTypeAgentUuid,
	};
};
