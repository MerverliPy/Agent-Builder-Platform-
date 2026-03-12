const fs = require('fs').promises
const path = require('path')
const storage = require('../storage')

const uploadsDir = path.join(__dirname, '..', '..', 'uploads')

async function ensureUploadsDir() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true })
  } catch (err) {
    // ignore
  }
}

/**
 * cleanupUploads: delete unreferenced files in uploads/ older than ttlHours
 * @param {Object} opts
 * @param {boolean} opts.dryRun default true
 * @param {number} opts.ttlHours default 24
 */
async function cleanupUploads({ dryRun = true, ttlHours = 24 } = {}) {
  await ensureUploadsDir()
  const summary = { deleted: [], kept: [], errors: [] }

  let files
  try {
    files = await fs.readdir(uploadsDir)
  } catch (err) {
    // if dir missing, nothing to do
    return summary
  }

  // get referenced basenames from agents
  let agents = []
  try {
    agents = await storage.getAll()
  } catch (err) {
    // if storage fails, treat as no agents
    agents = []
  }
  const referenced = new Set()
  for (const ag of agents) {
    if (!ag || !ag.avatar) continue
    const av = String(ag.avatar)
    if (av.startsWith('/uploads/')) {
      referenced.add(av.replace('/uploads/', ''))
    }
  }

  const now = Date.now()
  const ttlMs = Number(ttlHours) * 60 * 60 * 1000

  for (const fname of files) {
    const full = path.join(uploadsDir, fname)
    try {
      if (referenced.has(fname)) {
        summary.kept.push({ file: fname, reason: 'referenced' })
        continue
      }
      const st = await fs.stat(full)
      const mtime = st.mtimeMs || st.mtime.getTime()
      const age = now - mtime
      if (ttlMs > 0 && age < ttlMs) {
        summary.kept.push({ file: fname, reason: 'too_new' })
        continue
      }

      if (!dryRun) {
        await fs.unlink(full)
        summary.deleted.push(fname)
      } else {
        summary.deleted.push(fname)
      }
    } catch (err) {
      summary.errors.push({ file: fname, error: String(err) })
    }
  }

  return summary
}

module.exports = cleanupUploads
