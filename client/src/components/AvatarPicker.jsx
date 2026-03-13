import React, { useState } from 'react'

const SAMPLE = [
  '/avatars/avatar1.svg',
  '/avatars/avatar2.svg',
  '/avatars/avatar3.svg',
  '/avatars/avatar4.svg'
]

export default function AvatarPicker({ value, onChange }) {
  const [url, setUrl] = useState(value || '')

  function selectSample(u) {
    setUrl(u)
    onChange && onChange(u)
  }

  async function handleFile(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const form = new FormData()
    form.append('file', f)
    const res = await fetch('/api/media/upload', { method: 'POST', body: form })
    if (!res.ok) return alert('upload failed')
    const body = await res.json()
    setUrl(body.url)
    onChange && onChange(body.url)
  }

  return (
    <div className="avatar-picker">
      <div className="avatar-preview">{url ? <img src={url} alt="avatar" /> : <div className="avatar-placeholder">?</div>}</div>

      <div className="avatar-samples">
        {SAMPLE.map(s => (
          <button type="button" key={s} className="sample" onClick={()=>selectSample(s)}>
            <img src={s} alt="sample avatar" />
          </button>
        ))}
      </div>

      <div className="avatar-actions">
        <label className="btn btn-muted">Upload<input type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/></label>
        <input className="avatar-url" placeholder="or paste image URL" value={url} onChange={e=>{setUrl(e.target.value); onChange && onChange(e.target.value)}} />
      </div>
    </div>
  )
}
