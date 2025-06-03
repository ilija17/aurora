<template>
  <div class="rounded-xl p-6 max-w-xs" style="background-color: var(--secondary)">
    <p> Where were you today? </p><br>
    <ul v-if="locationDetails.length">
      <!-- highlight selected items -->
      <button 
        @click="toggleDetailLocation(opt.id)"
        style="margin: 5px; padding: 10px;"
        v-for="opt in locationDetails" :key="opt.id"
        :style="{
          backgroundColor: selectedLocationDetails.includes(opt.id) ? 'var(--accent)' : 'var(--primary)',
          color:           'var(--fg)',
          borderColor:     !selectedLocationDetails.includes(opt.id) ? 'var(--accent)' : 'var(--border)',
        }"
        >
        
        {{ opt.location_name }}
      </button>
    </ul><br><br>

    <p> Who were you around today? </p><br>
    <ul v-if="locationDetails.length">
      <!-- highlight selected items -->
      <button 
        @click="toggleDetailSocial(opt.id)"
        style="margin: 5px; padding: 10px;"
        v-for="opt in socialContext" :key="opt.id"
        :style="{
          backgroundColor: selectedSocialDetails.includes(opt.id) ? 'var(--accent)' : 'var(--primary)',
          color:           'var(--fg)',
          borderColor:     !selectedSocialDetails.includes(opt.id) ? 'var(--accent)' : 'var(--border)',
        }"
        >
        
        {{ opt.social_name }}
      </button>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'

const locationDetails = ref<{ id: number; location_name: string }[]>([])
const socialContext = ref<{ id: number; social_name: string }[]>([])
const selectedLocationDetails = ref<number[]>([])
const selectedSocialDetails = ref<number[]>([])

const supabase = useSupabaseClient()
const user     = useSupabaseUser()

const props = defineProps<{
  modelValueLocations: number[]
  modelValueSocials:   number[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValueLocations', v: number[]): void
  (e: 'update:modelValueSocials',   v: number[]): void
}>()


onMounted(async () => {
  if (!user.value) return

  const { data: locs, error: locErr } = await supabase
    .from('location_context')
    .select('id, location_name')
  if (locErr) {
  } else {
    locationDetails.value = locs || []
  }

  const { data: socials, error: socErr } = await supabase
    .from('social_context')
    .select('id, social_name')
  if (socErr) {
  } else {
    socialContext.value = socials || []
  }
})

function toggleDetailLocation(id: number) {
  const i = selectedLocationDetails.value.indexOf(id)
  if (i === -1) selectedLocationDetails.value.push(id)
  else            selectedLocationDetails.value.splice(i, 1)
  emit('update:modelValueLocations', selectedLocationDetails.value)
}

function toggleDetailSocial(id: number) {
  const i = selectedSocialDetails.value.indexOf(id)
  if (i === -1) selectedSocialDetails.value.push(id)
  else            selectedSocialDetails.value.splice(i, 1)
  emit('update:modelValueSocials', selectedSocialDetails.value)
}
</script>

<style>

</style>
