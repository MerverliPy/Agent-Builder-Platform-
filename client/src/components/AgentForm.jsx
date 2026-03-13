import React, { useState } from 'react'
import AvatarPicker from './AvatarPicker'

export default function AgentForm({ initial = {}, onSubmit, submitLabel = 'Save' }) {
  const [name, setName] = useState(initial.name || '')
  const [skills, setSkills] = useState((initial.skills || []).join(','))
  const [responseStyle, setResponseStyle] = useState(initial.responseStyle || '')
  const [roles, setRoles] = useState((initial.roles || []).join(','))
  const [avatar, setAvatar] = useState(initial.avatar || '')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const e = {}
    if (!name || name.trim().length === 0) e.name = 'Name is required'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setSubmitting(true)
    const payload = {
      name: name.trim(),
      avatar: avatar || null,
      skills: skills.split(',').map(s=>s.trim()).filter(Boolean),
      responseStyle: responseStyle.trim(),
      roles: roles.split(',').map(s=>s.trim()).filter(Boolean)
    }
    try {
      await onSubmit(payload)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="agent-form">
      <div className="form-row">
        <label htmlFor="agent-name">Name</label>
        <input id="agent-name" aria-label="Name" value={name} onChange={e=>setName(e.target.value)} />
        {errors.name && <div className="field-error">{errors.name}</div>}
      </div>

      <div className="form-row">
        <label>Avatar</label>
        <AvatarPicker value={avatar} onChange={setAvatar} />
      </div>

      <div className="form-row">
        <label>Skills (comma separated)</label>
        <input value={skills} onChange={e=>setSkills(e.target.value)} />
      </div>

      <div className="form-row">
        <label>Response style</label>
        <input value={responseStyle} onChange={e=>setResponseStyle(e.target.value)} />
      </div>

      <div className="form-row">
        <label>Roles (comma separated)</label>
        <input value={roles} onChange={e=>setRoles(e.target.value)} />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Saving...' : submitLabel}</button>
      </div>
    </form>
  )
}
