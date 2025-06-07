import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { readBody, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'

export default defineLazyEventHandler(async () => {
  const openai = createOpenAI({
    apiKey: useRuntimeConfig().openaiApiKey,
  });

  return defineEventHandler(async (event: any) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
    }
    const { messages } = await readBody(event);


    const result = streamText({
      model: openai('gpt-4.1-mini'),
      messages,
      async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
        // TODO: tu bi moglo ici nesto logike, tipa brojimo usage  
      },
    });

    return result.toDataStreamResponse();
  });
});