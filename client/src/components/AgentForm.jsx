import React, { useState } from 'react'
import AvatarPicker from './AvatarPicker'
import FormSection from './form/FormSection'
import TagInput from './form/TagInput'
import ChipSelect from './form/ChipSelect'
import StyleSelector from './form/StyleSelector'
import { Input, Button, Card, Stack } from './ui'

export default function AgentForm({ 
  initial = {}, 
  onSubmit, 
  submitLabel = 'Save',
  hideSubmit = false,
  onFormChange = null,
}) {
  const [name, setName] = useState(initial.name || '')
  // Skills and roles are now arrays internally
  const [skills, setSkills] = useState(initial.skills || [])
  const [responseStyle, setResponseStyle] = useState(initial.responseStyle || '')
  const [roles, setRoles] = useState(initial.roles || [])
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

  // Skills now receives array directly from TagInput
  const handleSkillsChange = (skillsArray) => {
    setSkills(skillsArray)
    if (onFormChange) {
      onFormChange({ skills: skillsArray })
    }
  }

  // Roles now receives array directly from ChipSelect
  const handleRolesChange = (rolesArray) => {
    setRoles(rolesArray)
    if (onFormChange) {
      onFormChange({ roles: rolesArray })
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
    
    // Skills and roles are already arrays, no conversion needed
    const payload = {
      name: name.trim(),
      avatar: avatar || null,
      skills: skills,
      responseStyle: responseStyle.trim(),
      roles: roles
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
                <TagInput
                  label="Skills"
                  value={skills}
                  onChange={handleSkillsChange}
                  placeholder="Type a skill and press Enter..."
                  hint="Add skills by typing and pressing Enter, or click suggestions"
                />

                <ChipSelect
                  label="Roles"
                  value={roles}
                  onChange={handleRolesChange}
                  hint="Select preset roles or add custom ones"
                />
              </FormSection>
            </div>

            {/* Behavior Section */}
            <div className="p-6">
              <FormSection
                title="Behavior"
                description="Configure how your agent communicates"
              >
                <StyleSelector
                  label="Response Style"
                  value={responseStyle}
                  onChange={handleResponseStyleChange}
                  hint="Choose a communication style for your agent"
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
