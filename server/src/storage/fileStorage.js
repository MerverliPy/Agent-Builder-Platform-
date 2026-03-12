const fs = require('fs').promises
const path = require('path')
const { genId } = require('../utils/id')

const DB_FILE = process.env.CABP_DB_FILE || path.join(__dirname, '..', '..', 'data', 'agents.json')

async function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
}

class FileStorage {
  constructor(file = DB_FILE) {
    this.file = file
  }

  async _read() {
    try {
      const raw = await fs.readFile(this.file, 'utf8')
      return JSON.parse(raw)
    } catch (err) {
      if (err.code === 'ENOENT') return {}
      throw err
    }
  }

  async _write(obj) {
    await ensureDir(this.file)
    const tmp = this.file + '.tmp'
    await fs.writeFile(tmp, JSON.stringify(obj, null, 2), 'utf8')
    await fs.rename(tmp, this.file)
  }

  async create(entity) {
    const db = await this._read()
    const id = entity.id || genId('ag_')
    const now = new Date().toISOString()
    const record = Object.assign({}, entity, { id, createdAt: now, updatedAt: now })
    db[id] = record
    await this._write(db)
    return record
  }

  async getAll() {
    const db = await this._read()
    return Object.values(db)
  }

  async getById(id) {
    const db = await this._read()
    return db[id] || null
  }

  async update(id, patch) {
    const db = await this._read()
    const existing = db[id]
    if (!existing) return null
    const updated = Object.assign({}, existing, patch, { updatedAt: new Date().toISOString() })
    db[id] = updated
    await this._write(db)
    return updated
  }

  async delete(id) {
    const db = await this._read()
    if (!db[id]) return false
    delete db[id]
    await this._write(db)
    return true
  }
}

module.exports = new FileStorage()
