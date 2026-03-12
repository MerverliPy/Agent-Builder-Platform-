const crypto = require('crypto')

function genId(prefix = '') {
  return prefix + crypto.randomBytes(8).toString('hex')
}

module.exports = { genId }
