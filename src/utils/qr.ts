import QRCode from 'qrcode'

export async function generateQRDataUrl(text: string, size = 200): Promise<string> {
  return QRCode.toDataURL(text, { width: size, margin: 1, color: { dark: '#000', light: '#fff' } })
}

export async function generateQRSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: 'svg', margin: 1 })
}

export async function batchGenerateQR(tags: { tagId: string; label: string }[]): Promise<{ tagId: string; label: string; dataUrl: string }[]> {
  const results = await Promise.all(
    tags.map(async t => ({
      tagId: t.tagId,
      label: t.label,
      dataUrl: await generateQRDataUrl(t.tagId, 150)
    }))
  )
  return results
}

export function printQRBatch(items: { tagId: string; label: string; dataUrl: string }[]) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>QR Codes</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 16px; }
        .card { text-align: center; border: 1px solid #ddd; padding: 8px; border-radius: 4px; break-inside: avoid; }
        .card img { width: 120px; height: 120px; }
        .card .tag { font-size: 10px; font-family: monospace; color: #666; margin-top: 4px; }
        .card .label { font-size: 11px; font-weight: bold; margin-top: 2px; }
        @media print { .grid { grid-template-columns: repeat(4, 1fr); } }
      </style>
    </head>
    <body>
      <div class="grid">
        ${items.map(i => `
          <div class="card">
            <img src="${i.dataUrl}" alt="${i.tagId}" />
            <div class="tag">${i.tagId}</div>
            <div class="label">${i.label}</div>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
    win.onload = () => win.print()
  }
}
