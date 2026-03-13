import React, { useState } from 'react'
import AvatarPicker from './AvatarPicker'
import FormSection from './form/FormSection'
import { Input, Button, Card, Stack } from './ui'

export default function AgentForm({ 
  initial = {}, 
  onSubmit, 
  submitLabel = 'Save',
  hideSubmit = false,
  onFormChange = null,
}) {
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

  // Notify parent of form changes for live preview (synchronously)
  const handleNameChange = (val) => {
    setName(val)
    if (onFormChange) {
      onFormChange({ name: val })
    }
  }

  const handleAvatarChange = (val) => {
    setAvatar(val)
    if (onFormChange) {
      onFormChange({ avatar: val })
    }
  }

  const handleSkillsChange = (val) => {
    setSkills(val)
    if (onFormChange) {
      onFormChange({ 
        skills: val.split(',').map(s=>s.trim()).filter(Boolean)
      })
    }
  }

  const handleRolesChange = (val) => {
    setRoles(val)
    if (onFormChange) {
      onFormChange({ 
        roles: val.split(',').map(s=>s.trim()).filter(Boolean)
      })
    }
  }

  const handleResponseStyleChange = (val) => {
    setResponseStyle(val)
    if (onFormChange) {
      onFormChange({ responseStyle: val })
    }
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
    <form onSubmit={handleSubmit} className="space-y-0">
      <Card className="rounded-lg border border-gray-200 overflow-hidden">
        {/* Form Content */}
        <Card.Content className="p-0 lg:p-0">
          <Stack spacing={0} className="divide-y divide-gray-200">
            {/* Identity Section */}
            <div className="p-6">
              <FormSection 
                title="Identity"
                description="Define your agent's name and appearance"
              >
                <Input
                  id="agent-name"
                  label="Name"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  error={errors.name}
                  hint="Give your agent a unique and descriptive name"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Avatar
                  </label>
                  <AvatarPicker 
                    value={avatar} 
                    onChange={handleAvatarChange} 
                  />
                </div>
              </FormSection>
            </div>

            {/* Capabilities Section */}
            <div className="p-6">
              <FormSection
                title="Capabilities"
                description="Define what your agent can do and who can access it"
              >
                <Input
                  label="Skills"
                  value={skills}
                  onChange={e => handleSkillsChange(e.target.value)}
                  placeholder="e.g., JavaScript, React, Node.js"
                  hint="Enter comma-separated skills"
                />

                <Input
                  label="Roles"
                  value={roles}
                  onChange={e => handleRolesChange(e.target.value)}
                  placeholder="e.g., developer, designer, admin"
                  hint="Enter comma-separated roles for access control"
                />
              </FormSection>
            </div>

            {/* Behavior Section */}
            <div className="p-6">
              <FormSection
                title="Behavior"
                description="Configure how your agent communicates"
              >
                <Input
                  label="Response Style"
                  value={responseStyle}
                  onChange={e => handleResponseStyleChange(e.target.value)}
                  placeholder="e.g., Professional, Friendly, Technical"
                  hint="Describe how the agent should communicate"
                />
              </FormSection>
            </div>
          </Stack>
        </Card.Content>

        {/* Form Footer - Sticky Submit Area */}
        {!hideSubmit && (
          <Card.Footer className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
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
        )}
      </Card>
    </form>
  )
}
