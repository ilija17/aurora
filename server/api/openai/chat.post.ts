import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export default defineLazyEventHandler(async () => {
  const openai = createOpenAI({
    apiKey: useRuntimeConfig().openaiApiKey,
  });

  return defineEventHandler(async (event: any) => {
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