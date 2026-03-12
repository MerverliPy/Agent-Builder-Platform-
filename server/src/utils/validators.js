function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

function isArrayOfStrings(v) {
  return Array.isArray(v) && v.every(i => typeof i === 'string')
}

module.exports = { isNonEmptyString, isArrayOfStrings }
