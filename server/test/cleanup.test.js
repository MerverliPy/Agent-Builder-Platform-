const fs = require('fs').promises
const path = require('path')
const cleanup = require('../src/tasks/cleanupUploads')
const storage = require('../src/storage')

const uploadsDir = path.join(__dirname, '..', 'uploads')

async function writeFile(name, content = 'x', mtimeMs = null) {
  await fs.mkdir(uploadsDir, { recursive: true })
  const full = path.join(uploadsDir, name)
  await fs.writeFile(full, content, 'utf8')
  if (mtimeMs !== null) {
    const atime = mtimeMs / 1000
    const mtime = mtimeMs / 1000
    await fs.utimes(full, atime, mtime)
  }
  return full
}

async function rmIfExists(name) {
  try {
    await fs.unlink(path.join(uploadsDir, name))
  } catch (err) {
    // ignore
  }
}

describe('cleanupUploads task', () => {
  beforeEach(async () => {
    // clear storage
    if (storage && storage.getAll) {
      // memoryStorage is single instance; remove all known agents
      const all = await storage.getAll()
      if (all && Array.isArray(all)) {
        for (const a of all) {
          if (a && a.id) await storage.delete(a.id)
        }
      }
    }
  })

  test('removes unreferenced files older than ttl', async () => {
    const name = 'tmp-old-file.txt'
    await writeFile(name, 'old', Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days old

    const res = await cleanup({ dryRun: false, ttlHours: 24 })
    expect(res.deleted).toContain(name)
    // ensure file gone
    await expect(fs.stat(path.join(uploadsDir, name))).rejects.toThrow()
  })

  test('keeps referenced files even if old', async () => {
    const name = 'tmp-ref-file.txt'
    await writeFile(name, 'keep', Date.now() - 1000 * 60 * 60 * 24 * 2)
    // create agent referencing it
    const url = `/uploads/${name}`
    const ag = await storage.create({ name: 'x', avatar: url })

    const res = await cleanup({ dryRun: false, ttlHours: 0 })
    // ttl 0 means any age qualifies, but referenced files are skipped
    expect(res.kept.some(k => k.file === name)).toBe(true)
    // file still exists
    const st = await fs.stat(path.join(uploadsDir, name))
    expect(st).toBeTruthy()

    // cleanup created agent
    await storage.delete(ag.id)
    await rmIfExists(name)
  })
})
