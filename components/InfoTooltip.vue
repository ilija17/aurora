<template>
  <span class="relative group inline-block">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="cursor-help text-blue-500"
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="8" />
      <line x1="11" y1="12" x2="12" y2="12" />
      <polyline points="12 12 12 16 13 16" />
    </svg>
    <span
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max rounded bg-gray-700 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 group-hover:visible invisible"
    >
      <slot />
    </span>
  </span>
</template>
