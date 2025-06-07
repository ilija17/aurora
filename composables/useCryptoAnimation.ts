import { ref } from 'vue'

export const decrypting = ref(false)

export function startDecryptAnimation() {
  decrypting.value = true
}

export function stopDecryptAnimation() {
  decrypting.value = false
}
