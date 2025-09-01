// src/components/ImagePicker.jsx
import { useRef, useState } from 'react'
import { resizeImageToJpeg } from '../utils/image'

export default function ImagePicker({
  label = 'Imagen',
  value,               // data URL o URL
  onChange,            // (dataUrl) => void
  maxMB = 5,           // límite de tamaño de archivo
  maxW = 1600,
  maxH = 900,
  className = ''
}) {
  const inputRef = useRef(null)
  const [err, setErr] = useState('')

  const pick = () => inputRef.current?.click()

  const onFile = async (e) => {
    setErr('')
    const f = e.target.files?.[0]
    if (!f) return
    if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) {
      setErr('Formato no permitido. Usa JPG/PNG/WebP.')
      return
    }
    const mb = f.size / (1024 * 1024)
    if (mb > maxMB) {
      setErr(`El archivo pesa ${mb.toFixed(1)}MB. Máximo ${maxMB}MB.`)
      return
    }
    try {
      const out = await resizeImageToJpeg(f, maxW, maxH, 0.85)
      onChange?.(out)
    } catch (e2) {
      console.error(e2)
      setErr('No se pudo procesar la imagen.')
    } finally {
      e.target.value = ''
    }
  }

  const clear = () => {
    onChange?.('')
    setErr('')
  }

  return (
    <div className={`image-picker ${className}`}>
      {label && <label className="form-label">{label}</label>}

      <div className="d-flex gap-2 align-items-center">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={onFile}
        />
        <button type="button" className="btn btn-soft btn-sm" onClick={pick}>
          <i className="bi bi-upload me-1" /> Subir imagen
        </button>
        {value && (
          <button type="button" className="btn btn-soft btn-sm" onClick={clear}>
            <i className="bi bi-x-circle me-1" /> Quitar
          </button>
        )}
        <div className="small text-muted">JPG/PNG/WebP, máx. {maxMB}MB (se comprime).</div>
      </div>

      {err && <div className="text-danger small mt-2">{err}</div>}

      {value && (
        <div className="mt-2">
          <img src={value} alt="Vista previa" className="img-fluid rounded-3 border cover-preview" />
        </div>
      )}
    </div>
  )
}
