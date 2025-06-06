import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import { serverSupabaseClient } from '#supabase/server';
import { getCookie, setCookie, createError } from 'h3'

import { getUserData } from '@/server/utils/getUserData'

export default defineLazyEventHandler(async () => {
  const openai = createOpenAI({
    apiKey: useRuntimeConfig().openaiApiKey,
  });

  return defineEventHandler(async (event: any) => {
    const supabase = await serverSupabaseClient(event)
    const { data: { user } } = await supabase.auth.getUser()

    if(!user) {
      throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
    }
    const { messages, data } = await readBody(event);

    const result = streamText({
      model: openai('gpt-4.1'),
      messages,
      toolCallStreaming: true,
      maxSteps: 5,
      tools: {

        getAllUserData: {
          description: 'Return all mood-entry data for the signed-in user',
          parameters: z.object({}),
          execute: async () => {
            const decrypted = data?.userData ?? await getUserData(supabase, user.id)
            return { userData: decrypted }
          },
        },

        getUserTopSongs: {
          description: 'Return the user\'s top 10 Spotify tracks and artists',
          parameters: z.object({
            timeframe: z.enum(['short_term', 'medium_term', 'long_term']).default('short_term'),
          }),
          execute: async ({ timeframe }) => {
            let token = getCookie(event, 'spotify_access_token')
            if (!token) {
              throw createError({ statusCode: 401, statusMessage: 'Not authenticated with Spotify' })
            }

            const fetchTracks = () =>
              $fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeframe}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: '10' },
              })
            const fetchArtists = () =>
              $fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeframe}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: '10' },
              })

            try {
              const [{ items: tracks }, { items: artists }]: any = await Promise.all([
                fetchTracks(),
                fetchArtists(),
              ])
              return { tracks, artists }
            } catch (err: any) {
              if (err._data?.error?.status === 401) {
                const { access_token: newToken, expires_in }: any = await $fetch('/api/spotify/refresh')
                token = newToken
                setCookie(event, 'spotify_access_token', newToken, {
                  httpOnly: true,
                  maxAge: expires_in,
                })
                const [{ items: tracks }, { items: artists }]: any = await Promise.all([
                  fetchTracks(),
                  fetchArtists(),
                ])
                return { tracks, artists }
              }
              throw err
            }
          },
        },
      },
    });

    return result.toDataStreamResponse();
  });
});