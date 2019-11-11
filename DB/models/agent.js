'use strict';

const Sequelize = require('sequelize');
const setupDataBase = require('../lib/db');

module.exports = function setupAgentModel(config) {
	const sequelize = setupDataBase(config);

	return sequelize.define('Agent', {
		uuid: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		username: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		hostName: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		pid: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		connected: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	});
};
