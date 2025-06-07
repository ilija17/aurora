<script setup lang="ts">
import { useChat } from '@ai-sdk/vue';
import { onMounted, computed } from 'vue';
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import TypingText from '~/components/TypingText.vue'
import InfoTooltip from '~/components/InfoTooltip.vue'
import { useMoodEntries } from '~/composables/useMoodEntries';

const { finalizedEntries, fetchFinalizedMoodEntries } = useMoodEntries();

const md = new MarkdownIt()
const renderMarkdown = (text: string) => DOMPurify.sanitize(md.render(text))

const { input, handleSubmit, messages, addToolResult } = useChat({
  api: '/api/openai/chat-with-data',
  maxSteps: 5,
  experimental_prepareRequestBody: ({ id, messages, requestBody }) => ({
    id,
    messages,
    ...requestBody,
    data: { userData: finalizedEntries.value },
  }),
});

onMounted(async () => {
  await fetchFinalizedMoodEntries();
});

const messageList = computed(() => messages.value); // computed property for type inference
</script>

<template>
  <div class="relative flex flex-col min-h-full max-w-xl lg:max-w-2xl mx-auto p-4 sm:p-6">
    <h1 class="text-center text-2xl font-bold mb-4">Pseudo-psychiatrist</h1>
    <p class="text-sm text-gray-500 mb-4 flex flex-wrap items-center gap-1">
      You can ask ChatGPT to get all your data
      <InfoTooltip>
        Uses <code>getAllUserData</code> to return your mood entries.
      </InfoTooltip>
      or your favorite Spotify songs
      <InfoTooltip>
        Uses <code>getUserTopSongs</code> to fetch your top tracks.
      </InfoTooltip>
      ;)
    </p>
    <div class="flex-1 space-y-4 pb-24">
      <div
        v-for="message in messageList"
        :key="message.id"
        class="flex"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[75%] sm:max-w-lg px-4 py-2 rounded-lg whitespace-pre-wrap"
          :class="message.role === 'user' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-[var(--fg)]'"
        >
          <template v-for="part in message.parts">
            <template v-if="part.type === 'text'">
              <TypingText v-if="message.role === 'assistant'" :text="part.text" />
              <span v-else v-html="renderMarkdown(part.text)" />
            </template>
            <template v-else-if="part.type === 'tool-invocation'">
              <template
                v-if="part.toolInvocation.toolName === 'askForConfirmation'"
              >
                <template v-if="part.toolInvocation.state === 'call'">
                  <div
                    :key="part.toolInvocation.toolCallId"
                    class="text-gray-500"
                  >
                    {{ part.toolInvocation.args.message }}
                    <div class="flex gap-2">
                      <button
                        class="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                        @click="
                          addToolResult({
                            toolCallId: part.toolInvocation.toolCallId,
                            result: 'Yes, confirmed.',
                          })
                        "
                      >
                        Yes
                      </button>
                      <button
                        class="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                        @click="
                          addToolResult({
                            toolCallId: part.toolInvocation.toolCallId,
                            result: 'No, denied',
                          })
                        "
                      >
                        No
                      </button>
                    </div>
                  </div>
                </template>
                <template v-if="part.toolInvocation.state === 'result'">
                  <div
                    :key="part.toolInvocation.toolCallId"
                    class="text-gray-500"
                  >
                    Location access allowed: {{ part.toolInvocation.result }}
                  </div>
                </template>
              </template>

              <template v-if="part.toolInvocation.toolName === 'getLocation'">
                <template v-if="part.toolInvocation.state === 'call'">
                  <div
                    :key="part.toolInvocation.toolCallId"
                    class="text-gray-500"
                  >
                    Getting location...
                  </div>
                </template>
                <template v-if="part.toolInvocation.state === 'result'">
                  <div
                    :key="part.toolInvocation.toolCallId"
                    class="text-gray-500"
                  >
                    Location: {{ part.toolInvocation.result }}
                  </div>
                </template>
              </template>

              <template
                v-if="part.toolInvocation.toolName === 'getWeatherInformation'"
              >
                <template v-if="part.toolInvocation.state === 'partial-call'">
                  <pre :key="part.toolInvocation.toolCallId">
                    {{ JSON.stringify(part.toolInvocation, null, 2) }}
                  </pre>
                </template>
                <template v-if="part.toolInvocation.state === 'call'">
                  <div
                    :key="part.toolInvocation.toolCallId"
                    class="text-gray-500"
                  >
                    Getting weather information for
                    {{ part.toolInvocation.args.city }}...
                  </div>
                </template>
                <template v-if="part.toolInvocation.state === 'result'">
                  <div
                    :key="part.toolInvocation.toolCallId"
                    class="text-gray-500"
                  >
                    Weather in {{ part.toolInvocation.args.city }}:
                    {{ part.toolInvocation.result }}
                  </div>
                </template>
              </template>
            </template>
          </template>
        </div>
      </div>
    </div>

    <form
      @submit="handleSubmit"
      class="sticky bottom-0 left-0 right-0 max-w-xl lg:max-w-2xl mx-auto p-4 mb-4 bg-[var(--bg)] border-t border-[var(--border)]"
    >
      <input
        class="w-full p-3 rounded-lg bg-[var(--input-bg)] text-[var(--input-color)] border border-[var(--input-border)]"
        v-model="input"
        placeholder="Say something..."
      />
    </form>
  </div>
</template>
