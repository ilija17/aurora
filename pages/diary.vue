<template>
  <div class="min-h-full p-4 max-w-7xl mx-auto">
    <!-- Mobile/Tablet Layout -->
    <div class="block lg:hidden space-y-4">
      <!-- Main Content Panel (Mobile) -->
      <div class="bg-[var(--secondary)] border border-transparent rounded-lg p-4 min-h-[400px]">
        <div v-if="!masterPassword && !unlocked" class="flex flex-col justify-center h-full">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 class="font-semibold text-yellow-800 mb-2">Enter Master Password</h3>
            <p class="text-sm text-yellow-700 mb-3">
              This password encrypts your notes. If you forget it, your notes cannot be recovered.
              Use the same password you used when creating your first encrypted note.
            </p>
          </div>
          <div class="space-y-4">
            <input
              v-model="passwordInput"
              type="password"
              placeholder="Master password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keyup.enter="handleSetMasterPassword"
              aria-label="Master password"
            />
            <button
              @click="handleSetMasterPassword"
              :disabled="!passwordInput"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Unlock Notes
            </button>
          </div>
        </div>

        <div v-else-if="unlocked || masterPassword" class="flex flex-col h-full">
          <input
            v-model="title"
            type="text"
            placeholder="Note title (optional)"
            class="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg sm:text-xl font-semibold"
            aria-label="Note title"
          />
          <h3 class="text-lg font-semibold mb-3">Create/Edit Note</h3>
          <textarea
            v-model="body"
            placeholder="Write your encrypted note here..."
            class="w-full flex-grow px-3 py-2 border border-gray-300 rounded-md mb-5 resize-none text-start align-top break-words whitespace-pre-wrap min-h-[300px]"
            aria-label="Note content"
          ></textarea>
          
          <div v-if="error && masterPassword" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm text-red-800">
            Error: {{ error }}
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-3 border-t border-gray-200">
            <button
              @click="saveEntry"
              :disabled="(saving || !canSave)"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : (selectedNote ? 'Update Note' : 'Save Encrypted Note') }}
            </button>
            <button
              v-if="selectedNote"
              @click="clearSelection"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              New Note
            </button>
          </div>
        </div>
      </div>

      <!-- Notes List (Mobile) -->
      <div class="bg-[var(--secondary)] border border-transparent rounded-lg p-4 max-h-96 overflow-hidden flex flex-col">
        <div v-if="globalError" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-800">
          <p>{{ globalError }}</p>
        </div>

        <div v-if="masterPassword && error && finalizedEntries.length === 0 && !loading" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-800">
          <p>{{ error }}</p>
        </div>

        <div v-if="masterPassword || unlocked" class="flex flex-col flex-grow min-h-0">
          <h2 class="text-lg sm:text-xl text-white font-semibold mb-4">Your Encrypted Notes</h2>
          
          <div v-if="loading" class="text-center py-8">
            <p class="text-gray-600">Loading notes...</p>
          </div>
          
          <div v-else-if="!loading && finalizedEntries.length === 0 && (!error || (error && masterPassword))" class="text-center py-8">
            <p class="text-gray-600">No notes yet. Create your first encrypted note!</p>
          </div>
          
          <div v-else class="w-full overflow-y-auto space-y-2 pr-1 flex-grow">
            <div
              v-for="note in sortedDecryptedNotes"
              :key="note.id"
              class="rounded-lg border p-3 cursor-pointer"
              :class="[
                selectedNote && selectedNote.id === note.id ? 'bg-[var(--highlighted)] border-transparent' : 'bg-[var(--secondary)] border-transparent hover:bg-[var(--highlighted)]',
              ]"
              @click="selectNote(note)"
            >
              <div class="flex justify-between items-start mb-1">
                <div class="flex flex-col overflow-hidden mr-2 flex-grow">
                  <span class="text-sm text-white font-medium truncate">
                    {{ note.payload.title || (note.payload.body && note.payload.body.length > 10 ? note.payload.body.substring(0, 10) + '...' : note.payload.body) || 'Untitled' }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ formatDate(note.id) }}
                  </span>
                </div>
                <button
                  @click.stop="deleteNote(note.id)"
                  class="text-xs shrink-0 px-2 py-1 text-red-600 hover:bg-red-100 rounded"
                  aria-label="Delete note"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!masterPassword && !unlocked && !globalError && !error" class="text-center py-8 text-gray-600 flex-grow flex flex-col justify-center items-center">
          <p>Unlock your notes to see them listed here.</p>
        </div>
        
        <div v-if="error && !masterPassword && !unlocked" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-800">
          <p>{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Desktop Layout -->
    <div class="hidden lg:flex gap-6 min-h-[900px] max-h-[80vh]">
      <!-- Notes List Sidebar (Desktop) -->
      <aside class="w-80 bg-[var(--secondary)] border border-transparent rounded-lg p-4 flex flex-col overflow-hidden">
        <div v-if="globalError" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-800">
          <p>{{ globalError }}</p>
        </div>

        <div v-if="masterPassword && error && finalizedEntries.length === 0 && !loading" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-800">
          <p>{{ error }}</p>
        </div>

        <div v-if="masterPassword || unlocked" class="flex flex-col flex-grow min-h-0">
          <h2 class="text-xl text-white font-semibold mb-4">Your Encrypted Notes</h2>
          
          <div v-if="loading" class="text-center py-8">
            <p class="text-gray-600">Loading notes...</p>
          </div>
          
          <div v-else-if="!loading && finalizedEntries.length === 0 && (!error || (error && masterPassword))" class="text-center py-8">
            <p class="text-gray-600">No notes yet. Create your first encrypted note!</p>
          </div>
          
          <div v-else class="w-full overflow-y-auto space-y-2 pr-1 flex-grow">
            <div
              v-for="note in sortedDecryptedNotes"
              :key="note.id"
              class="rounded-lg border p-2 cursor-pointer"
              :class="[
                selectedNote && selectedNote.id === note.id ? 'bg-[var(--highlighted)] border-transparent' : 'bg-[var(--secondary)] border-transparent hover:bg-[var(--highlighted)]',
              ]"
              @click="selectNote(note)"
            >
              <div class="flex justify-between items-start mb-1">
                <div class="flex flex-col overflow-hidden mr-2">
                  <span class="text-sm text-white font-medium truncate">
                    {{ note.payload.title || (note.payload.body && note.payload.body.length > 10 ? note.payload.body.substring(0, 10) + '...' : note.payload.body) || 'Untitled' }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ formatDate(note.id) }}
                  </span>
                </div>
                <button
                  @click.stop="deleteNote(note.id)"
                  class="text-xs shrink-0"
                  aria-label="Delete note"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!masterPassword && !unlocked && !globalError && !error" class="text-center py-8 text-gray-600 flex-grow flex flex-col justify-center items-center">
          <p>Unlock your notes to see them listed here.</p>
        </div>
        
        <div v-if="error && !masterPassword && !unlocked" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-800">
          <p>{{ error }}</p>
        </div>
      </aside>

      <!-- Main Content Panel (Desktop) -->
      <div class="flex-1 bg-[var(--secondary)] border border-transparent rounded-lg p-6 flex flex-col overflow-hidden">
        <div v-if="!masterPassword && !unlocked" class="flex flex-col justify-center h-full">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 class="font-semibold text-yellow-800 mb-2">Enter Master Password</h3>
            <p class="text-sm text-yellow-700 mb-3">
              This password encrypts your notes. If you forget it, your notes cannot be recovered.
              Use the same password you used when creating your first encrypted note.
            </p>
          </div>
          <div class="space-y-4 max-w-md mx-auto w-full">
            <input
              v-model="passwordInput"
              type="password"
              placeholder="Master password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keyup.enter="handleSetMasterPassword"
              aria-label="Master password"
            />
            <button
              @click="handleSetMasterPassword"
              :disabled="!passwordInput"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Unlock Notes
            </button>
          </div>
        </div>

        <div v-else-if="unlocked || masterPassword" class="flex flex-col h-full">
          <input
            v-model="title"
            type="text"
            placeholder="Note title (optional)"
            class="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl font-semibold"
            aria-label="Note title"
          />
          <h3 class="text-lg font-semibold mb-3">Create/Edit Note</h3>
          <textarea
            v-model="body"
            placeholder="Write your encrypted note here..."
            class="w-full flex-grow px-3 py-2 border border-gray-300 rounded-md mb-5 resize-none text-start align-top break-words whitespace-pre-wrap min-h-[150px]"
            aria-label="Note content"
          ></textarea>
          
          <div v-if="error && masterPassword" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm text-red-800">
            Error: {{ error }}
          </div>
          
          <div class="flex gap-3 items-center pt-3 border-t border-gray-200">
            <button
              @click="saveEntry"
              :disabled="(saving || !canSave)"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : (selectedNote ? 'Update Note' : 'Save Encrypted Note') }}
            </button>
            <button
              v-if="selectedNote"
              @click="clearSelection"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              New Note
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDiaryEntries } from '~/composables/useDiaryEntries'

const passwordInput = ref('')
const masterPassword = ref<string | null>(null)

const {
  finalizedEntries,
  loading,
  error,
  globalError,
  title,
  body,
  submitDiaryEntry,
  deleteDiaryEntry,
  fetchFinalizedDiaryEntries,
  unlocked,
  unlock,
  isSubmitting,
} = useDiaryEntries()

const selectedNote = ref<{ id: number; payload: { title: string; body: string } } | null>(null)
const saving = isSubmitting

async function handleSetMasterPassword() {
  if (!passwordInput.value) return

  try {
    masterPassword.value = passwordInput.value
    await fetchFinalizedDiaryEntries(passwordInput.value)
    passwordInput.value = ''
  } catch (e: any) {
    masterPassword.value = null
    alert('Failed to unlock with this password: ' + (e.message || e))
  }
}

async function autoLoadIfUnlocked() {
  if (unlocked.value && !masterPassword.value) {
    try {
      await fetchFinalizedDiaryEntries()
      masterPassword.value = 'cached' // Set a flag to indicate we're using cached DEK
    } catch (e: any) {
      console.log('Auto-load failed, password may be required:', e.message)
    }
  }
}

// Check for cached DEK on component mount
autoLoadIfUnlocked()

function clearSelection() {
  selectedNote.value = null
  title.value = ''
  body.value = ''
}

function selectNote(note: typeof selectedNote.value) {
  selectedNote.value = note
  title.value = note?.payload.title || ''
  body.value = note?.payload.body || ''
}

async function saveEntry() {
  if (!unlocked.value) {
    alert('Please unlock with your master password first.')
    return
  }

  // Pass the id if updating an existing note
  await submitDiaryEntry(selectedNote.value?.id)

  // Clear the form after saving
  clearSelection()
}

async function deleteNote(id: number) {
  await deleteDiaryEntry(id)
  if (selectedNote.value?.id === id) {
    clearSelection()
  }
}

const canSave = computed(() => {
  return title.value.trim() !== '' || body.value.trim() !== ''
})

const sortedDecryptedNotes = computed(() => {
  return [...finalizedEntries.value].sort((a, b) => b.id - a.id)
})

function formatDate(id: number) {
  return `ID: ${id}`
}
</script>