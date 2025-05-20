import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { ref, watch, computed } from 'vue'
import { z } from 'zod';

export default defineLazyEventHandler(async () => {
  const openai = createOpenAI({
    apiKey: useRuntimeConfig().openaiApiKey,
  });

  return defineEventHandler(async (event: any) => {
    const { messages } = await readBody(event);

    const result = streamText({
      model: openai('gpt-4o'),
      messages,
      toolCallStreaming: true,
      maxSteps: 5,
      tools: {

        // server-side tool with execute function
        getUserSong: {
          description: 'get the user song',
          parameters: z.object({ id: z.string() }),
          execute: async ({ id }: { id: string }) => {
            const trackName = await $fetch<string>(`api/spotify/get-data/song/${id}.ts`)
            return { trackName }
          },
        },

         getWeatherInformation: {
          description: 'show the weather in a given city to the user',
          parameters: z.object({ city: z.string() }),
          execute: async ({}: { city: string }) => {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const weatherOptions = [
              'sunny',
              'cloudy',
              'rainy',
              'snowy',
              'windy',
            ];
            return weatherOptions[
              Math.floor(Math.random() * weatherOptions.length)
            ];
          },
        },

        askForConfirmation: {
          description: 'Ask the user for confirmation.',
          parameters: z.object({
            message: z
              .string()
              .describe('The message to ask for confirmation.'),
          }),
        },

        getLocation: {
          description:
            'Get the user location. Always ask for confirmation before using this tool.',
          parameters: z.object({}),
        },
      },
    });

    return result.toDataStreamResponse();
  });
});