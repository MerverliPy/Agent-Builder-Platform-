import React, { useState, useEffect } from 'react'
import AvatarPicker from './AvatarPicker'
import FormSection from './form/FormSection'
import TagInput from './form/TagInput'
import ChipSelect from './form/ChipSelect'
import StyleSelector from './form/StyleSelector'
import { Input, Button, Card, Stack } from './ui'
import api from '../api/api'

// Default LLM settings
const LLM_DEFAULTS = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1024
}

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
  
  // LLM Configuration
  const [systemPrompt, setSystemPrompt] = useState(initial.systemPrompt || '')
  const [model, setModel] = useState(initial.model || LLM_DEFAULTS.model)
  const [temperature, setTemperature] = useState(initial.temperature ?? LLM_DEFAULTS.temperature)
  const [maxTokens, setMaxTokens] = useState(initial.maxTokens ?? LLM_DEFAULTS.maxTokens)
  const [availableModels, setAvailableModels] = useState({ available: {}, all: {} })
  
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Fetch available models on mount
  useEffect(() => {
    api.getModels()
      .then(data => setAvailableModels(data))
      .catch(err => console.warn('Failed to fetch models:', err))
  }, [])

  function validate() {
    const e = {}
    if (!name || name.trim().length === 0) e.name = 'Name is required'
    if (temperature < 0 || temperature > 2) e.temperature = 'Temperature must be between 0 and 2'
    if (maxTokens < 1 || maxTokens > 8192) e.maxTokens = 'Max tokens must be between 1 and 8192'
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
      roles: roles,
      // LLM Configuration
      systemPrompt: systemPrompt.trim(),
      model: model,
      temperature: temperature,
      maxTokens: maxTokens
    }
    
    try {
      await onSubmit(payload)
    } finally {
      setSubmitting(false)
    }
  }

  // Group models by provider with display names
  const providerDisplayNames = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    ollama: 'Ollama (Free, Local)'
  }
  
  // Create grouped models structure
  const groupedModels = Object.entries(availableModels.all || {}).map(([provider, models]) => ({
    provider,
    displayName: providerDisplayNames[provider] || provider,
    models: models.map(m => ({
      value: m,
      label: m,
      configured: (availableModels.available?.[provider] || []).includes(m)
    }))
  }))

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

            {/* LLM Configuration Section */}
            <div className="p-6">
              <FormSection
                title="AI Model Configuration"
                description="Configure the language model powering your agent"
              >
                <div>
                  <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700 mb-1">
                    System Prompt
                  </label>
                  <textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    placeholder="Enter instructions for how the agent should behave..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Custom instructions for the AI. Leave blank to auto-generate from agent metadata.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <select
                      id="model-select"
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                      {groupedModels.map(group => (
                        <optgroup key={group.provider} label={group.displayName}>
                          {group.models.map(m => (
                            <option key={m.value} value={m.value}>
                              {m.label} {!m.configured && '(not configured)'}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Select the AI model. Ollama models are free and run locally.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature: {temperature}
                    </label>
                    <input
                      id="temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={e => setTemperature(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                    {errors.temperature && (
                      <p className="mt-1 text-xs text-red-500">{errors.temperature}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="max-tokens" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Tokens
                    </label>
                    <input
                      id="max-tokens"
                      type="number"
                      min="1"
                      max="8192"
                      value={maxTokens}
                      onChange={e => setMaxTokens(parseInt(e.target.value, 10) || 1024)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum response length
                    </p>
                    {errors.maxTokens && (
                      <p className="mt-1 text-xs text-red-500">{errors.maxTokens}</p>
                    )}
                  </div>
                </div>
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
