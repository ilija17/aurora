<!-- components/FormInput.vue -->
<template>
  <div class="space-y-1">
    <label :for="id" class="block mb-2 text-indigo-500">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full p-2 mb-6 text-indigo-700 border-b-2 border-indigo-500 outline-none focus:bg-gray-300"
    />
    <p v-if="helper" class="text-xs text-gray-500 dark:text-gray-400">
      {{ helper }}
    </p>
  </div>
</template>

<script setup>
const colorMode = useColorMode()

defineProps({
  id: String,
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  helper: String,
  modelValue: String
})

defineEmits(['update:modelValue'])
</script>
