'use strict';

const Sequelize = require('sequelize');
const setupDataBase = require('../lib/db');

module.exports = function setupMetricsModel(config) {
	const sequelize = setupDataBase(config);

	return sequelize.define('Agent', {
		type: { type: Sequelize.STRING, allowNull: false },
		value: { type: Sequelize.TEXT, allowNull: false },
	});
};
