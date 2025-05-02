import { ref, watch } from 'vue'
import zxcvbn from 'zxcvbn'

export function usePasswordStrength(passwordRef: Ref<string>) {
  const score = ref(0)
  const text  = ref('')
  const feedback = ref('')
  
  watch(passwordRef, pw => {
    const { score: s, feedback: f } = zxcvbn(pw)
    score.value = s
    text.value  = ['Very weak','Weak','Fair','Good','Strong'][s]
    feedback.value = f.warning || f.suggestions.join(' ')
  })
  
  return { score, text, feedback }
}
