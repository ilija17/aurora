import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
  const { tracks = [], artists = [], character} =
    (await readBody(event)) || {}

  const trackLines  = tracks
    .slice(0, 10)
    .map((t, i) => `${i + 1}. "${t.name}" by ${t.artists.map(a => a.name).join(', ')}`)
    .join('\n')

  const artistLines = artists
    .slice(0, 10)
    .map((a, i) => `${i + 1}. ${a.name}`)
    .join('\n')

  let prompt: string
  if(character === 'Default') {
    prompt = 'Roast my Spotify Rewind. Don’t hold back.'
  } else if(character === 'Monday') {
    prompt = 'Roast my Spotify Rewind. Don’t hold back. Be dry, sarcastic, and emotionally exhausted. '
  } else {
    prompt = `Roast my Spotify Rewind. Don’t hold back. Assume the persona of ${character}.`
  }

  const system = `
    Given a listener’s Top‑10 tracks and Top‑10 artists,
    roast his music taste
    `

  const userPrompt = `
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
      { role: 'user',   content: userPrompt.trim() }
    ],
    temperature: 0.9,
    max_tokens: 1500,
  })

  return { roast: choices[0].message.content.trim() }
})
