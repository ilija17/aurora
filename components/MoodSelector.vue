<template>
  <div
    class="rounded-xl p-6 max-w-xs"
    style="background-color: var(--secondary)"
  >
    <h2
      class="text-lg font-medium mb-4"
      style="color: var(--fg)"
    >
      How are you feeling?
    </h2>

    <div class="space-y-3">
      <label
        v-for="opt in options"
        :key="opt.value"
        class="flex items-center p-3 rounded-lg cursor-pointer transition-colors"
        :class="{ selected: selected === opt.value }"
      >
        <input
          type="radio"
          class="hidden"
          :value="opt.value"
          v-model="localValue"
        />

        <div
          class="flex-shrink-0 mr-3 p-2 rounded-full border-2 emoji-circle"
          :class="{ 'selected-circle': selected === opt.value }"
        >
          <img :src="opt.icon" alt="mood" class="w-6 h-6" />
        </div>

        <span style="color: var(--fg)">{{ opt.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import mood1Url from '@/assets/images/1.svg'
import mood2Url from '@/assets/images/2.svg'
import mood3Url from '@/assets/images/3.svg'
import mood4Url from '@/assets/images/4.svg'
import mood5Url from '@/assets/images/5.svg'

const props = defineProps({
  modelValue: { type: Number, default: 0 }
})

const emit = defineEmits(['update:modelValue', 'next'])

const localValue = ref<number>(props.modelValue)
watch(() => props.modelValue, v => {
  localValue.value = v
})
watch(localValue, v => {
  emit('update:modelValue', v)
})

// mood options
const options = [
  { value: 1, label: 'Great', icon: mood1Url },
  { value: 2, label: 'Good',  icon: mood2Url },
  { value: 3, label: 'Fine',  icon: mood3Url },
  { value: 4, label: 'Bad',   icon: mood4Url },
  { value: 5, label: 'Awful', icon: mood5Url },
]

const selected = computed(() => localValue.value)

const supabase = useSupabaseClient()
const user      = useSupabaseUser()

async function onNext() {
  if (selected.value === 0 || !user.value) return

  
  const { error } = await supabase
    .from('mood_entries')
    .insert([{
      user_id:      user.value.id,
      general_mood: selected.value
    }])

  if (error) {
  } else {
    emit('next')
  }
}
</script>


<style scoped>
label:hover,
label.selected {
  background-color: var(--primary);
}

.emoji-circle {
  border-color: var(--border);
  background-color: transparent;
}

.emoji-circle.selected-circle {
  border-color: var(--accent);
  background-color: var(--primary);
}
</style>
