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
          <span>{{ opt.emoji }}</span>
        </div>

        <span style="color: var(--fg)">{{ opt.label }}</span>
      </label>
    </div>
  </div>

  <button 
    type="submit"
    :disabled="!selected"
    @click="onNext"
    class="mt-4 px-4 py-2 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Next
  </button>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue']);

const localValue = ref(props.modelValue);
watch(() => props.modelValue, v => (localValue.value = v));
watch(localValue, v => emit('update:modelValue', v));

const options = [
  { value: 'Great', label: 'Great',  emoji: '😃' },
  { value: 'Good',  label: 'Good',   emoji: '🙂' },
  { value: 'Fine',  label: 'Fine',   emoji: '😐' },
  { value: 'Bad',   label: 'Bad',    emoji: '☹️' },
  { value: 'Awful', label: 'Awful',  emoji: '😫' }
];

const selected = computed(() => localValue.value);

function onNext() {
  console.log(localValue.value)
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
