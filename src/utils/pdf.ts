import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CheckResult, MonitoringPoint, SiteObject, Client, Visit } from '@/types'
import { POINT_TYPE_LABELS, VISIT_TYPE_LABELS } from '@/types'

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  doc.setFontSize(16)
  doc.text(title, 14, 20)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(subtitle, 14, 28)
  doc.setTextColor(0)
  return 35
}

export function generateMonitoringJournal(
  object: SiteObject,
  client: Client,
  points: MonitoringPoint[],
  checks: CheckResult[]
) {
  const doc = new jsPDF('landscape')
  let y = addHeader(doc,
    `Журнал моніторингу — ${object.name}`,
    `Клієнт: ${client.companyName} | Адреса: ${object.address}`
  )

  const floors = [...new Set(points.map(p => p.floor))].sort()

  for (const floor of floors) {
    const floorPoints = points.filter(p => p.floor === floor)
    if (floorPoints.length === 0) continue

    doc.setFontSize(12)
    doc.text(`Рівень/Поверх: ${floor}`, 14, y)
    y += 5

    const tableData = floorPoints.map(p => {
      const pointChecks = checks.filter(c => c.pointId === p.id)
      const lastCheck = pointChecks.sort((a, b) =>
        new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
      )[0]

      return [
        String(p.number),
        POINT_TYPE_LABELS[p.type],
        p.zone || '—',
        p.tagId,
        lastCheck ? new Date(lastCheck.checkedAt).toLocaleDateString('uk-UA') : '—',
        lastCheck?.equipmentStatus || '—',
        lastCheck ? (lastCheck.activity ? 'Так' : 'Ні') : '—',
        lastCheck?.correctiveAction || '—'
      ]
    })

    autoTable(doc, {
      startY: y,
      head: [['№', 'Тип', 'Зона', 'QR Tag', 'Дата перев.', 'Стан обл.', 'Актив.', 'Корект. дія']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      theme: 'grid'
    })

    const lastTable = (doc as unknown as Record<string, Record<string, number>>).lastAutoTable
    y = (lastTable?.finalY ?? y) + 10
    if (y > 170) { doc.addPage(); y = 20 }
  }

  doc.save(`journal_${object.name.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export function generateRodenticideTable(
  object: SiteObject,
  client: Client,
  points: MonitoringPoint[],
  checks: CheckResult[]
) {
  const doc = new jsPDF('landscape')
  addHeader(doc,
    `Зведена таблиця витрати родентициду — ${object.name}`,
    `Клієнт: ${client.companyName}`
  )

  const baitPoints = points.filter(p => p.type === 'bait_station' || p.type === 'feeder')

  const months: string[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d.toLocaleDateString('uk-UA', { month: 'short', year: '2-digit' }))
  }

  const tableData = baitPoints.map(p => {
    const row: string[] = [String(p.number), p.zone || '—', POINT_TYPE_LABELS[p.type]]
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthChecks = checks.filter(c =>
        c.pointId === p.id &&
        new Date(c.checkedAt) >= monthStart &&
        new Date(c.checkedAt) <= monthEnd
      )
      const avgConsumption = monthChecks.length > 0
        ? Math.round(monthChecks.reduce((s, c) => s + (c.consumptionPercent ?? 0), 0) / monthChecks.length)
        : null
      row.push(avgConsumption !== null ? `${avgConsumption}%` : '—')
    }
    return row
  })

  autoTable(doc, {
    startY: 40,
    head: [['№', 'Зона', 'Тип', ...months]],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246] },
    theme: 'grid',
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index >= 3) {
        const val = String(data.cell.raw).replace('%', '')
        const num = parseInt(val)
        if (!isNaN(num)) {
          if (num >= 75) data.cell.styles.fillColor = [254, 202, 202]
          else if (num >= 50) data.cell.styles.fillColor = [254, 240, 138]
          else if (num >= 25) data.cell.styles.fillColor = [187, 247, 208]
        }
      }
    }
  })

  doc.save(`rodenticide_${object.name.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export function generateVisitAct(
  visit: Visit,
  object: SiteObject,
  client: Client,
  checks: CheckResult[],
  points: MonitoringPoint[]
) {
  const doc = new jsPDF()
  let y = addHeader(doc,
    `Акт виїзду — ${VISIT_TYPE_LABELS[visit.type]}`,
    `Дата: ${new Date(visit.scheduledAt).toLocaleDateString('uk-UA')}`
  )

  doc.setFontSize(10)
  const info = [
    `Клієнт: ${client.companyName}`,
    `Об'єкт: ${object.name} (${object.address})`,
    `Виконавець: ${visit.assignedTo || '—'}`,
    `Статус: ${visit.status}`,
    `Перевірено точок: ${checks.length}`
  ]
  info.forEach(line => { doc.text(line, 14, y); y += 6 })
  y += 5

  if (checks.length > 0) {
    const visitChecks = checks.filter(c => c.visitId === visit.id)
    const tableData = visitChecks.map(c => {
      const point = points.find(p => p.id === c.pointId)
      return [
        point ? String(point.number) : '—',
        c.activity ? 'Так' : 'Ні',
        String(c.activityLevel),
        c.consumptionPercent != null ? `${c.consumptionPercent}%` : '—',
        c.equipmentStatus,
        c.correctiveAction || '—'
      ]
    })

    autoTable(doc, {
      startY: y,
      head: [['Точка №', 'Активність', 'Рівень', '% поїдання', 'Стан обл.', 'Корект. дія']],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246] },
      theme: 'grid'
    })
  }

  doc.save(`act_${object.name.replace(/\s/g, '_')}_${new Date(visit.scheduledAt).toISOString().slice(0, 10)}.pdf`)
}
