'use strict';

const mqtt = require('mqtt');
const client = mqtt.connect([{ host: `localhost`, port: 1883 }]);

client.on('connect', function() {
	try {
		client.publish(
			'agent/message',
			JSON.stringify({
				agent: {
					username: 'foo',
					name: 'foo',
					uuid: 'yyy',
					pid: '10',
					hostname: 'foo',
				},
				metrics: [
					{ type: 'memmory', value: 1001 },
					{ type: 'temp', value: '33' },
				],
			}),
		);
		console.log('heheh');
	} catch (err) {
		console.log(err);
		console.log('whoops there is something wrong');
	}
});
