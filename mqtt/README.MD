# mqtt

## `agent/connected`

```js
{
	agent: {
		uuid, //Auto generate
			username, //Defined by config
			name, //Defined by config
			hostname, //Get from os system
			pid; //Get from process
	}
}
```

## `agent/disconnected`

```js
{
	agent: {
		uuid, //Auto generate
	}
}
```

## `agent/message`

```js
{
    agent,
    metrics: [
        {
            type,
            value
        }
    ],
    timeStamp //Generated when creating the message
}
```
