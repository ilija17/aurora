import { ref } from 'vue'
import DOMPurify from 'dompurify'

const pattern = /^[A-Za-z0-9_-]{3,30}$/

export function useUsernameValidator(rawUsername: Ref<string>) {
  const error = ref('')
  
  function validate() {
    if (!pattern.test(rawUsername.value)) {
      error.value = 'Username must be 3–30 characters, letters, numbers, underscores or hyphens only.'
      return false
    }
    error.value = ''
    return true
  }
  
  function sanitized() {
    return DOMPurify.sanitize(rawUsername.value)
  }
  
  return { error, validate, sanitized }
}
