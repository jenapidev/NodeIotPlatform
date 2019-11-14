'use strict';

const agent = {
	id: 1,
	uuid: 'yyy-yyy-yyy',
	name: 'fixture',
	username: 'platzi',
	hostname: 'test-host',
	pid: 0,
	connected: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const agents = [
	agent,
	extend(agent, {
		id: 2,
		uuid: 'yyy-yyy-yyy',
		connected: false,
		username: 'test',
	}),
	extend(agent, { id: 3, uuid: 'yyy-yyy-yyx' }),
	extend(agent, { id: 4, uuid: 'yyy-yyy-yyz', username: 'testA' }),
	extend(agent, { id: 5, uuid: 'yyy-yyy-yyk', username: 'test6' }),
];

function extend(obj, values) {
	const clone = Object.assign({}, obj);
	return { ...obj, ...values };
}

module.exports = {
	single: agent,
	all: agents,
	connected: agents.filter((a) => a.connected),
	test: agents.filter((a) => a.username === 'test'),
	byUuid: (id) => agents.filter((a) => a.uuid === id).shift(),
	byId: (id) => agents.filter((a) => a.id === id).shift(),
};
