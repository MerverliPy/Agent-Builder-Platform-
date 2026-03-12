const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`)
  }
})

const allowed = new Set(['image/jpeg','image/png','image/svg+xml','image/webp','image/gif'])
function fileFilter(req, file, cb) {
  if (allowed.has(file.mimetype)) return cb(null, true)
  const msg = `Invalid file type: ${file.mimetype}`
  // pass an error to multer; will be handled by errorHandler middleware
  return cb(new Error(msg), false)
}

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }) // 5MB limit

let sharp
try {
  sharp = require('sharp')
} catch (err) {
  // fallback: image processing unavailable
  sharp = null
}

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no file' })
    // Process images: resize width to max 512px and convert to webp to save space
    const filePath = path.join(uploadDir, req.file.filename)
    const outName = `${Date.now()}-${Math.round(Math.random()*1e9)}.webp`
    const outPath = path.join(uploadDir, outName)
    try {
      await sharp(filePath).resize({ width: 512, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outPath)
      // remove original
      fs.unlinkSync(filePath)
    } catch (err) {
      // if sharp fails (e.g., svg), just move original to outPath
      fs.renameSync(filePath, outPath)
    }

    const url = `/uploads/${outName}`
    res.json({ url })
  } catch (err) {
    next(err)
  }
})

module.exports = router
