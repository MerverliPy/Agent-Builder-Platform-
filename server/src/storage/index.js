const config = require('../config')

let storage
if (config.storage === 'file') {
  storage = require('./fileStorage')
} else {
  storage = require('./memoryStorage')
}

module.exports = storage
