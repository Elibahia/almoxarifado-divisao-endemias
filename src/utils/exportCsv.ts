export function exportCsv(
  headers: string[],
  rows: Array<Array<string | number>>, 
  filenameBase: string
) {
  const csvContent = [
    headers,
    ...rows,
  ]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filenameBase}.csv`)
  link.style.visibility = 'hidden'
  // Append and cleanup safely to avoid removeChild errors under rapid unmounts
  const body = document.body
  body.appendChild(link)
  try {
    link.click()
  } finally {
    if (link.parentNode === body) {
      body.removeChild(link)
    }
    URL.revokeObjectURL(url)
  }
}


