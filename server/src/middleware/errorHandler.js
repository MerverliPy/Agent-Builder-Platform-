const multer = require('multer')

function errorHandler(err, req, res, next) {
  if (!err) return next()

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'file too large', details: err.message })
    }
    return res.status(400).json({ error: 'upload error', details: err.message })
  }

  // custom errors from fileFilter
  if (err.message && err.message.startsWith('Invalid file type')) {
    return res.status(400).json({ error: 'invalid_file_type', details: err.message })
  }

  // default
  console.error(err)
  res.status(500).json({ error: 'server_error', details: err.message || String(err) })
}

module.exports = errorHandler
