# Node IoT platform

## usage

```js
const setUpDatabase = require('db');
setupBase(config)
	.then((db) => {
		const { Agent, Metrics } = db;
	})
	.catch((err) => {
		console.log(err);
	});
```
