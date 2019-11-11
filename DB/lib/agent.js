'use strict';

module.exports = function setupAgent(AgentModel) {
	const createOrUpdate = async (agent) => {
		let cond = {
			where: {
				uuid: agent.uuid,
			},
		};

		const existigAgent = await AgentModel.findOne(cond);
		if (existigAgent) {
			const updated = await AgentModel.update(agent, cond);
			return updated ? AgentModel.findOne(cond) : existigAgent;
		}
		const result = AgentModel.create(agent);
		return result.toJSON();
	};

	const findById = (id) => {
		return AgentModel.findById(id);
	};

	const findByUuid = (uuid) => {
		return AgentModel.findOne({
			where: {
				uuid,
			},
		});
	};

	const findAll = () => {
		return AgentModel.findAll();
	};

	return {
		findById,
		createOrUpdate,
		findByUuid,
		findAll,
	};
};
