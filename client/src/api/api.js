// Environment variable must be accessed at module level
const BASE = import.meta.env.VITE_API_BASE || '/api'
console.log('[API] Using base URL:', BASE)

function authHeader() {
  try {
    const token = window.localStorage.getItem('cabp_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch (err) { return {} }
}

async function ping() {
  const res = await fetch(`${BASE}/health`)
  if (!res.ok) throw new Error('health check failed')
  return res.json()
}

async function getAgents() {
  const res = await fetch(`${BASE}/agents`)
  if (!res.ok) throw new Error('failed')
  return res.json()
}

async function getAgent(id) {
  const res = await fetch(`${BASE}/agents/${id}`)
  if (!res.ok) throw new Error('not found')
  return res.json()
}

async function createAgent(payload) {
  const res = await fetch(`${BASE}/agents`, { method: 'POST', headers: Object.assign({'Content-Type':'application/json'}, authHeader()), body: JSON.stringify(payload) })
  if (!res.ok) {
    const err = await res.json().catch(()=>({error:'unknown'}))
    throw new Error(err.error || 'create failed')
  }
  return res.json()
}

async function updateAgent(id, payload) {
  const res = await fetch(`${BASE}/agents/${id}`, { method: 'PUT', headers: Object.assign({'Content-Type':'application/json'}, authHeader()), body: JSON.stringify(payload) })
  if (!res.ok) {
    const err = await res.json().catch(()=>({error:'unknown'}))
    throw new Error(err.error || 'update failed')
  }
  return res.json()
}

async function deleteAgent(id) {
  const res = await fetch(`${BASE}/agents/${id}`, { method: 'DELETE', headers: authHeader() })
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(()=>({error:'unknown'}))
    throw new Error(err.error || 'delete failed')
  }
  return true
}

export default { ping, getAgents, getAgent, createAgent }
// later: updateAgent, deleteAgent
