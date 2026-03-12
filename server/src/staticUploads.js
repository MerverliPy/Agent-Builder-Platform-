const express = require('express')
const path = require('path')

module.exports = function mount(app) {
  const uploadDir = path.join(__dirname, '..', 'uploads')
  app.use('/uploads', express.static(uploadDir))
}
