import React, { useState } from 'react'
import AvatarPicker from './AvatarPicker'
import { Input, Button, Stack, Card } from './ui'

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
    <form onSubmit={handleSubmit}>
      <Card>
        <Card.Content className="p-6">
          <Stack spacing={6}>
            <Input
              id="agent-name"
              label="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              error={errors.name}
              hint="Give your agent a unique and descriptive name"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Avatar</label>
              <AvatarPicker value={avatar} onChange={setAvatar} />
            </div>

            <Input
              label="Skills"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="e.g., JavaScript, React, Node.js"
              hint="Enter comma-separated skills"
            />

            <Input
              label="Response Style"
              value={responseStyle}
              onChange={e => setResponseStyle(e.target.value)}
              placeholder="e.g., Professional, Friendly, Technical"
              hint="Describe how the agent should communicate"
            />

            <Input
              label="Roles"
              value={roles}
              onChange={e => setRoles(e.target.value)}
              placeholder="e.g., developer, designer, admin"
              hint="Enter comma-separated roles for access control"
            />
          </Stack>
        </Card.Content>

        <Card.Footer className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </Card.Footer>
      </Card>
    </form>
  )
}
