<template>
  <div class="min-h-screen p-4">
    <div class="max-w-4xl mx-auto">
      <div class="rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-2xl font-bold mb-4">Encrypted Notes</h1>
        
        <!-- Password prompt for first-time users or session start -->
        <div v-if="!masterPassword" class="mb-6">
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
              @keyup.enter="setMasterPassword"
            />
            <button
              @click="setMasterPassword"
              :disabled="!passwordInput"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Unlock Notes
            </button>
          </div>
        </div>

        <!-- Note creation form -->
        <div v-else class="mb-6">
          <h3 class="text-lg font-semibold mb-3">Create New Note</h3>
          <div class="space-y-4">
            <textarea
              v-model="newNote"
              placeholder="Write your encrypted note here..."
              class="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <div class="flex gap-3">
              <button
                @click="saveNote"
                :disabled="!newNote || saving"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {{ saving ? 'Saving...' : 'Save Encrypted Note' }}
              </button>
              <button
                @click="clearMasterPassword"
                class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Lock Notes
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Notes list -->
      <div v-if="masterPassword" class="space-y-4">
        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-600">Loading notes...</p>
        </div>
        
        <div v-else-if="decryptedNotes.length === 0" class="text-center py-8">
          <p class="text-gray-600">No notes yet. Create your first encrypted note above!</p>
        </div>
        
        <div v-else>
          <h2 class="text-xl font-semibold mb-4">Your Encrypted Notes</h2>
          <div class="space-y-3">
            <div
              v-for="note in decryptedNotes"
              :key="note.id"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="text-sm text-gray-500">
                  {{ formatDate(note.created_at) }}
                </span>
                <button
                  @click="deleteNote(note.id)"
                  class="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
              <div v-if="note.decrypted" class="whitespace-pre-wrap">
                {{ note.content }}
              </div>
              <div v-else class="text-red-500 text-sm">
                Failed to decrypt - check your password
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCrypto } from '~/composables/useCrypto'

interface EncryptedNote {
  id: number
  ciphertext: string
  salt: string
  iv: string
  created_at: string
}

interface DecryptedNote extends EncryptedNote {
  content: string
  decrypted: boolean
}

const { encryptText, decryptText, isSupported } = useCrypto()

const masterPassword = ref('')
const passwordInput = ref('')
const newNote = ref('')
const notes = ref<EncryptedNote[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const decryptedNotes = computed<DecryptedNote[]>(() => {
  if (!masterPassword.value) return []
  
  return notes.value.map(note => ({
    ...note,
    content: '',
    decrypted: false
  })).map(note => {
    try {
      // We'll decrypt each note individually when displayed
      return note
    } catch (err) {
      return { ...note, content: 'Decryption failed', decrypted: false }
    }
  })
})

async function setMasterPassword() {
  if (!passwordInput.value) return
  
  masterPassword.value = passwordInput.value
  passwordInput.value = ''
  await loadNotes()
}

function clearMasterPassword() {
  masterPassword.value = ''
  notes.value = []
  newNote.value = ''
  error.value = ''
}

async function loadNotes() {
  if (!masterPassword.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/notes')
    notes.value = response.notes
    
    // Decrypt notes
    for (const note of notes.value) {
      try {
        const decrypted = await decryptText(
          note.ciphertext,
          note.salt,
          note.iv,
          masterPassword.value
        )
        
        // Update the note in decryptedNotes
        const index = decryptedNotes.value.findIndex(n => n.id === note.id)
        if (index !== -1) {
          decryptedNotes.value[index].content = decrypted
          decryptedNotes.value[index].decrypted = true
        }
      } catch (err) {
        console.error('Failed to decrypt note:', err)
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load notes'
  } finally {
    loading.value = false
  }
}

async function saveNote() {
  if (!newNote.value || !masterPassword.value) return
  
  saving.value = true
  error.value = ''
  
  try {
    const encrypted = await encryptText(newNote.value, masterPassword.value)
    
    await $fetch('/api/notes', {
      method: 'POST',
      body: encrypted
    })
    
    newNote.value = ''
    await loadNotes()
  } catch (err: any) {
    error.value = err.message || 'Failed to save note'
  } finally {
    saving.value = false
  }
}

async function deleteNote(id: number) {
  if (!confirm('Are you sure you want to delete this note?')) return
  
  try {
    await $fetch(`/api/notes/${id}`, { method: 'DELETE' })
    await loadNotes()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete note'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString() + ' ' + 
         new Date(dateString).toLocaleTimeString()
}

onMounted(() => {
  if (!isSupported.value) {
    error.value = 'Your browser does not support the encryption features required for this app.'
  }
})
</script>