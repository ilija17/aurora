import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { readBody, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().openaiApiKey;
  if (!apiKey) throw new Error('Missing OpenAI API key');
  const openai = createOpenAI({ apiKey });

  return defineEventHandler(async (event: any) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
    }
    const { messages, data } = await readBody(event);

    const initialMessages = messages.slice(0, -1);
    const currentMessage = messages[messages.length - 1];

    const response = streamText({
      model: openai('gpt-4o'),
      maxTokens: 150,
      messages: [
        ...initialMessages,
        {
          role: 'user',
          content: [
            { type: 'text', text: currentMessage.content },
            { type: 'image', image: new URL(data.imageUrl) },
          ],
        },
      ],
    });

    return response.toDataStreamResponse();
  });
});