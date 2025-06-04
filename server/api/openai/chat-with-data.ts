import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { ref, watch, computed } from 'vue'
import { z } from 'zod';
import { serverSupabaseClient } from '#supabase/server';

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
      },
    });

    return result.toDataStreamResponse();
  });
});