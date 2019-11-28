'use strict'
const debug = 'debug'('nodeIoT:agent')
const mqtt = require('mqtt')
const defaults = require('defaults')
const EventEmiter = require('events')
const uuid = require('uuid')
const { parsePayload } = require('../utils')

const defOptions = {
  name: 'untitled',
  username: 'jeanpy',
  mqtt: {
    host: 'mqtt://localhost'
  }
}

class Agent extends EventEmiter {
  constructor (opts) {
    super()

    this.options = defaults(opts, defOptions)
    this._started = false
    this._timer = null
    this._client = null
    this._agentId = null
  }

  connect () {
    if (!this._started) {
      const { options } = this
      this._client = mqtt.connect(options.mqtt.host)
      this._started = true

      this._client.subscribe('agent/message')
      this._client.subscribe('agent/connected')
      this._client.subscribe('agent/disconnected')

      this._client.on('connect', () => {
        this._agentId = uuid.v4()
        this.emit('connected', this._agentId)

        this._timer = setInterval(() => {
          this.emit('message', 'this is a message')
        }, options.interval)
      })

      this._client.on('message', (topic, payload) => {
        payload = parsePayload(payload)

        let broadcast = false
        switch (topic) {
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message':
            broadcast =
							payload && payload.agent && payload.agent.uuid !== this.uuid
            break
        }

        if (broadcast) {
          this.emit(topic, payload)
        }
      })

      this._client.on('error', () => this.disconnect())
    }
  }

  disconnect () {
    if (this._started) {
      clearInterval(this._timer)
      this._started = false
      this.emit('disconnected')
    }
  }
}

module.exports = Agent
