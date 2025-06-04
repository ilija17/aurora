import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import { serverSupabaseClient } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

import { getUserData } from '@/server/utils/getUserData'

async function getAllUserData(supabase: SupabaseClient, userId: string) {
  const data = await getUserData(supabase, userId)
  return { userData: data }
}

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
    const { messages } = await readBody(event);

    const result = streamText({
      model: openai('gpt-4.1'),
      messages,
      toolCallStreaming: true,
      maxSteps: 5,
      tools: {

        getAllUserData: {
          description: 'Return all mood-entry data for the signed-in user',
          parameters: z.object({}),
          execute: async () => getAllUserData(supabase, user.id),
        },
      },
    });

    return result.toDataStreamResponse();
  });
});