// API configuration - must be at module level for Vite env vars
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

console.log('[API Config] Base URL:', API_BASE)

export { API_BASE }
