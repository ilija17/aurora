<!-- components/FormInput.vue -->
<template>
  <div class="space-y-1">
    <label :for="id" class="block text-sm font-medium text-gray-900 dark:text-white">
      {{ label }}
    </label>
    <br>
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full p-2.5 rounded border border-gray-300 bg-gray-50 text-sm text-gray-900
             focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600
             dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
