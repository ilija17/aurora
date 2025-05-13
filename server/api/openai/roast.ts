import { defineEventHandler, readBody } from 'h3'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default defineEventHandler(async (event) => {
  const { tracks = [], artists = [], prompt = 'Roast my Spotify Rewind.' } =
    (await readBody(event)) || {}

  const trackLines  = tracks
    .slice(0, 10)
    .map((t, i) => `${i + 1}. "${t.name}" by ${t.artists.map(a => a.name).join(', ')}`)
    .join('\n')

  const artistLines = artists
    .slice(0, 10)
    .map((a, i) => `${i + 1}. ${a.name}`)
    .join('\n')

  const system = `
    Given a listener’s Top‑10 tracks and Top‑10 artists,
    roast his music taste
    `

  const user = `
${prompt}

Top‑10 Tracks:
${trackLines}

Top‑10 Artists:
${artistLines}
`

  const { choices } = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: system.trim() },
      { role: 'user',   content: user.trim()   }
    ],
    temperature: 0.9,
    max_tokens: 1500,
  })

  return { roast: choices[0].message.content.trim() }
})
