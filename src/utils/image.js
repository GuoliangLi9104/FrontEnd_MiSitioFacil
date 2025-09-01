// src/utils/image.js
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function resizeImageToJpeg(file, maxW = 1600, maxH = 900, quality = 0.85) {
  const dataUrl = await fileToDataUrl(file)
  const img = await new Promise((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = dataUrl
  })

  let { width, height } = img
  const ratio = Math.min(maxW / width, maxH / height, 1)
  const outW = Math.round(width * ratio)
  const outH = Math.round(height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, outW, outH)

  return canvas.toDataURL('image/jpeg', quality)
}
