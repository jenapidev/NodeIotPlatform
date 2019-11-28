# agent

## usage

```js
const Agent = 'agent';

const agent = new Agent({
	name: 'someAppName',
	username: 'someUsername'
	interval: 2000,
});

agent.addMetric('rss', function getRss () {
	return process.memoryUsage().rss
})

agent.addMetric('promiseMetric', function getRandomPromise () {
	return Promise.resolve(Math.random())
})

agent.addMetric('callback', function getCallBack (callback) {
	setTimeOut(() => {}, 2000)
})

agent.connect()

// Agent only
agent.on('connected', handler);
agent.on('disconnected', handler);
agent.on('message', handler);

// mqtt
agent.on('agent/connected');
agent.on('agent/disconnected');
agent.on('agent/message', (payload) => {
	console.log(payload);
});

setTimeout(() => agent.disconnect(), 20000);
```
