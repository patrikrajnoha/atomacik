import fs from 'node:fs'

const content = JSON.parse(fs.readFileSync('src/content/appContent.json', 'utf8'))
const readme = fs.readFileSync('README.md', 'utf8')
const errors = []

function assert(condition, message) {
  if (!condition) errors.push(message)
}

assert(content.lab?.common?.sampleLabel, 'lab.common.sampleLabel is required by LabView')
assert(content.lab?.common?.measurements, 'lab.common.measurements is required by LabView')
assert(Array.isArray(content.sample?.missions) && content.sample.missions.length === 6, 'sample.missions must contain 6 missions')
assert(Array.isArray(content.sample?.pipeControls) && content.sample.pipeControls.length > 0, 'sample.pipeControls is required')
assert(Array.isArray(content.sample?.initialBubbles), 'sample.initialBubbles is required')
assert(content.sample?.ui?.wellHeading, 'sample.ui.wellHeading is required')
assert(content.sample?.messages?.miniGameCompleteSuffix, 'sample.messages.miniGameCompleteSuffix is required')
assert(Array.isArray(content.spectrometer?.referenceCards), 'spectrometer.referenceCards is required')
assert(Array.isArray(content.spectrometer?.prepCards), 'spectrometer.prepCards is required')
assert(Array.isArray(content.spectrometer?.peaks), 'spectrometer.peaks is required')

for (const peak of content.spectrometer.peaks ?? []) {
  assert(content.spectrometer.peakPositions?.[peak.id], `spectrometer.peakPositions.${peak.id} is required`)
}

const suspiciousReplacementQuestionMarks = []

function collectSuspiciousQuestionMarks(value, path = 'content') {
  if (typeof value === 'string') {
    const isUrl = value.startsWith('http://') || value.startsWith('https://')
    const trimmed = value.trim()
    const isQuestionSentence = trimmed.endsWith('?') && trimmed.indexOf('?') === trimmed.length - 1

    if (!isUrl && !isQuestionSentence && value.includes('?')) {
      suspiciousReplacementQuestionMarks.push(`${path}: ${value}`)
    }
    return
  }

  if (!value || typeof value !== 'object') return

  for (const [key, child] of Object.entries(value)) {
    collectSuspiciousQuestionMarks(child, `${path}.${key}`)
  }
}

collectSuspiciousQuestionMarks(content)

assert(
  suspiciousReplacementQuestionMarks.length === 0,
  `content contains suspicious replacement question marks:\n${suspiciousReplacementQuestionMarks.join('\n')}`,
)

assert(!/\bRPG\b/i.test(JSON.stringify(content)), 'user-facing content must not mention RPG')
assert(!/\bRPG\b/i.test(readme), 'README must not mention RPG')
assert(!JSON.stringify(content).includes('Kartíčky'), 'use the correct Slovak spelling „Kartičky“')

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'))
  process.exit(1)
}

console.log('Content validation passed.')
