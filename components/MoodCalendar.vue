<template>
  <div class="flex flex-col items-center justify-center w-full h-full overflow-x-hidden px-2 sm:px-4">
    <div class="flex items-center justify-center p-3 sm:p-5 w-full">
      <button @click="decrementYear" class="flex-shrink-0 p-2 sm:p-3 touch-manipulation text-lg sm:text-xl font-bold">
        &lt;
      </button>
      <input class="flex-shrink-0 min-w-[6ch] w-[6ch] sm:min-w-[7ch] sm:w-[7ch] mx-2 sm:mx-3 text-center text-base sm:text-lg font-semibold bg-transparent border-b-2 border-[var(--accent)] focus:outline-none focus:border-[var(--primary)]" 
             v-model.number="inputYear" 
             @blur="formatInputYear" 
             @keyup.enter="formatInputYear" />
      <button @click="incrementYear" class="flex-shrink-0 p-2 sm:p-3 touch-manipulation text-lg sm:text-xl font-bold">
        &gt;
      </button>
    </div>
  
    <div class="relative min-h-[60vh] sm:min-h-[800px] sm:max-h-[900px] bg-[var(--secondary)] rounded-2xl sm:rounded-4xl pt-2 pb-2 px-4 sm:pt-10 sm:pb-10 sm:pl-4 sm:pr-4 overflow-y-scroll scroll-smooth max-h-[900px] lg:max-h-[900px] lg:h-[900px] lg:w-[600px] w-[90vw] lg:max-w-[600px] sm:w-full md:w-full">
      <div v-for="month in monthsArray" :key="month.month" class="mb-8 sm:mb-20">
        <div class="month-name relative top-0 left-0 px-2 sm:px-4 py-1 sm:py-2 text-base sm:text-lg font-semibold text-center sm:text-left">
          {{ month.month }}
        </div>
        
        <div class="w-full overflow-hidden">
          <div v-for="(week, weekIndex) in month.calendarMonth" :key="weekIndex" class="grid grid-cols-7 gap-0.5 sm:gap-1 w-full mb-0.5 sm:mb-1">
            <div v-for="day in week " 
                 :key="day.date.toISOString()"
                 class="aspect-square w-full">
              <div
                class="w-full h-full cursor-pointer border-2 rounded-lg sm:rounded-2xl border-transparent hover:border-[var(--accent)] transition-colors ease-in-out relative touch-manipulation flex flex-col items-center justify-center"
                :class="{
                  'invisible': day.day === 0,
                  'bg-[var(--highlighted)]/50': isToday(day.date)
                }"
                @click="openDayModal(day.date);"
              >
                <div v-if="isToday(day.date)" 
                    class="scroll-mt-[250px] rounded-full w-1 h-1 sm:w-2 sm:h-2 bg-[var(--accent)] absolute top-0.5 sm:top-1 left-0.5 sm:left-1"
                    id="today">
                </div>
                
                <div v-if="hasSpotifySongOnDay(day.date)" 
                    class="absolute top-0.5 sm:top-1 right-0.5 sm:right-1">
                  <svg class="w-3 h-3 lg:w-6 lg:h-6 sm:w-6 sm:h-6 md:w-6 md:h-6" viewBox="0 0 26 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.4084 19.0666C11.1444 19.0666 10.0623 18.6166 9.16221 17.7164C8.26208 16.8163 7.81201 15.7342 7.81201 14.4702C7.81201 13.2062 8.26208 12.1241 9.16221 11.224C10.0623 10.3239 11.1444 9.87382 12.4084 9.87382C12.8489 9.87382 13.2511 9.93127 13.615 10.0462C13.998 10.1419 14.3619 10.2952 14.7066 10.5058V-1.61719H21.6012V2.97921H17.0048V14.4702C17.0048 15.7342 16.5547 16.8163 15.6546 17.7164C14.7545 18.6166 13.6724 19.0666 12.4084 19.0666Z" fill="#FEF7FF"/>
                  </svg>
                </div>
                
                <div v-if="!loadingEntriesByYear" class="flex items-center justify-center flex-grow">
                  <img
                    :src="moodImageMap.get(moodMap?.get(format(day.date, 'dd.MM.yyyy'))) ?? defaultMoodUrl"
                    :class="{ 'invisible': !moodMap?.get(format(day.date, 'dd.MM.yyyy')) }"
                    alt="Mood image"
                    class="lg:w-12 lg:h-12 sm:w-8 sm:h-8 md:w-14 md:h-14 object-contain"
                  />
                </div>
                
                <div :class="{ 
                  'text-xs sm:text-sm absolute bottom-0.5 sm:bottom-1 right-0.5 sm:right-1 leading-none': getDay(day.date) != 0, 
                  'text-xs sm:text-sm absolute bottom-0.5 sm:bottom-1 right-0.5 sm:right-1 leading-none text-red-500': getDay(day.date) == 0 
                }">
                  {{ day.day }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>

<div
    v-if="showDayDetails"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  > 
    <div class="bg-[var(--secondary)] p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md text-[var(--fg)] flex flex-col min-h-[50vh] max-h-[80vh] sm:min-h-[300px] sm:h-[50vh]">
      <div v-if="selectedMoods.length" class="flex flex-col gap-2 overflow-y-auto mb-4 flex-grow">
        <div
          v-for="entry in selectedMoods"
          :key="entry.id"
          class="rounded-lg px-3 sm:px-4 py-2 sm:py-3 hover:bg-[var(--accent)] cursor-pointer transition relative touch-manipulation"
          @click="openEntryModal(entry.id)"
        >
          <div v-if="entry.payload.spotify_song_id" class="absolute top-1 sm:top-2 right-3 sm:right-5 w-1.5 h-1 sm:w-2 sm:h-1">
            <svg width="16" height="16" sm:width="20" sm:height="20" viewBox="0 0 26 23" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5">
              <path d="M12.4084 19.0666C11.1444 19.0666 10.0623 18.6166 9.16221 17.7164C8.26208 16.8163 7.81201 15.7342 7.81201 14.4702C7.81201 13.2062 8.26208 12.1241 9.16221 11.224C10.0623 10.3239 11.1444 9.87382 12.4084 9.87382C12.8489 9.87382 13.2511 9.93127 13.615 10.0462C13.998 10.1419 14.3619 10.2952 14.7066 10.5058V-1.61719H21.6012V2.97921H17.0048V14.4702C17.0048 15.7342 16.5547 16.8163 15.6546 17.7164C14.7545 18.6166 13.6724 19.0666 12.4084 19.0666Z" fill="#FEF7FF"/>
            </svg>
          </div>
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm font-semibold">
                {{ format(parseISO(entry.payload.entry_timestamp), 'HH:mm') }}
              </div>
              <div class="text-xs text-[var(--muted-foreground)]">
                {{ format(parseISO(entry.payload.entry_timestamp), 'dd.MM.yyyy') }}
              </div>
            </div>
            <img
              class="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              :src="moodImageMap.get(entry.payload.general_mood.id) ?? defaultMoodUrl"
              alt="Mood image"
            />
          </div>
        </div>
      </div>

      <div v-else class="flex items-center justify-center flex-grow text-[var(--muted)] text-sm sm:text-base">
        Nothing to see here...
      </div>

      <div class="mt-auto pt-4 border-t border-[var(--border)]">
        <button
          @click="closeDayModal"
          class="w-full sm:w-auto px-4 py-2 rounded bg-[var(--border)] hover:bg-[var(--muted)] text-[var(--fg)] transition touch-manipulation"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>

  <div
  v-if="showEntryDetails && entryDetailsById && entryDetailsById.payload"
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
>
  <div class="bg-[var(--secondary)] p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md text-[var(--fg)] flex flex-col min-h-[60vh] max-h-[85vh] sm:min-h-[300px] sm:h-[50vh]">

    <div class="flex flex-col gap-3 sm:gap-4 overflow-y-auto mb-4 flex-grow">
      <div class="flex w-full items-center">
        <img
          :src="moodImageMap.get(entryDetailsById?.payload.general_mood.id) ?? defaultMoodUrl"
          alt="Mood image"
          class="w-10 h-10 sm:w-12 sm:h-12 object-cover mr-3 sm:mr-4"
        />
        <div class="flex flex-col justify-center">
          <div class="text-base sm:text-lg font-semibold">
            {{ format(parseISO(entryDetailsById.payload.entry_timestamp), 'EEE') }},
            {{ format(parseISO(entryDetailsById.payload.entry_timestamp), 'h:mm a') }}
          </div>
        </div>
      </div>

      <div v-if="entryDetailsById?.payload.spotify_song_id" class="mb-3 sm:mb-4 self-start w-full">
        <iframe
          :src="`https://open.spotify.com/embed/track/${entryDetailsById.payload.spotify_song_id}`"
          :width="'100%'"
          :height="80"
          frameborder="0"
          allowtransparency="true"
          allow="encrypted-media"
          class="max-w-full rounded-lg"
        ></iframe>
      </div>

      <div v-if="entryDetailsById?.payload.notes">
        <div class="text-sm font-medium text-[var(--muted-foreground)]">Notes:</div>
        <div class="border-2 border-transparent bg-[var(--input-bg)] rounded-md p-2 sm:p-3 mt-2 w-full h-auto max-h-32 sm:max-h-80 text-sm sm:text-lg overflow-y-auto overflow-x-hidden break-words">
          {{ entryDetailsById.payload.notes || "No notes for today" }}
        </div>
      </div>

      <div v-if="entryDetailsById.payload.detailed_moods.length">
        <div class="text-sm font-medium text-[var(--muted-foreground)]">Detailed Moods:</div>
        <ul class="list-disc pl-4 sm:pl-5">
          <li v-for="mood in entryDetailsById.payload.detailed_moods" :key="mood.mood_name" class="text-sm sm:text-lg">
            {{ mood.mood_name }}
          </li>
        </ul>
      </div>

      <div v-if="entryDetailsById?.payload.social_contexts.length">
        <div class="text-sm font-medium text-[var(--muted-foreground)]">Who you were with:</div>
        <ul class="list-disc pl-4 sm:pl-5">
          <li v-for="context in entryDetailsById.payload.social_contexts" :key="context.social_name" class="text-sm sm:text-lg">
            {{ context.social_name }}
          </li>
        </ul>
      </div>

      <div v-if="entryDetailsById?.payload.location_contexts.length">
        <div class="text-sm font-medium text-[var(--muted-foreground)]">Where you were:</div>
        <ul class="list-disc pl-4 sm:pl-5">
          <li v-for="location in entryDetailsById.payload.location_contexts" :key="location.location_name" class="text-sm sm:text-lg">
            {{ location.location_name }}
          </li>
        </ul>
      </div>
    </div>

      <div class="mt-auto pt-4 border-t border-[var(--border)] flex gap-2">
        <button
          @click="deleteSelectedEntry"
          :disabled="deleting"
          class="w-full sm:w-auto px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition touch-manipulation disabled:opacity-50"
        >
          {{ deleting ? 'Deleting…' : 'Delete' }}
        </button>
        <button
          @click="closeEntryModal"
          class="w-full sm:w-auto px-4 py-2 rounded bg-[var(--border)] hover:bg-[var(--muted)] text-[var(--fg)] transition touch-manipulation"
        >
          Close
        </button>
      </div>
  </div>
</div>
</template>

<script lang="ts" setup>
  //import musicalNoteUrl from '@assets/images/music_note.svg'; <-- ne znam zasto ne zeli importat ovaj, a moodove je normalno

  import mood1Url from '@/assets/images/1.svg';
  import mood2Url from '@/assets/images/2.svg';
  import mood3Url from '@/assets/images/3.svg';
  import mood4Url from '@/assets/images/4.svg';
  import mood5Url from '@/assets/images/5.svg';
  import defaultMoodUrl from '@/assets/images/default-mood.svg';
  import { getDay, startOfMonth, endOfMonth, sub, add, format, parseISO, isToday } from 'date-fns';
  import { useMoodEntries } from '~/composables/useMoodEntries';

  interface CalendarDay {
    date: Date;
    day: number;
  }

  interface CalendarMonth {
    calendarMonth: CalendarDay[][];
    month: string;
  }

  interface MoodEntry {
  id: number;
  entry_timestamp: string;
  general_mood: number;
  spotify_song_id?: string;
  spotify_song_name?: string;
  spotify_song_artist?: string;
  notes?: string;
  detailed_moods?: { mood_name: string }[];
  social_contexts?: { social_name: string }[];
  location_contexts?: { location_name: string }[];
}

  //utility funkcija da provjeri ako dan ima barem 1 spotify entry (ovaj kod postaje katastrofa)
  function hasSpotifySongOnDay(date: Date): boolean {
    const formattedDate = format(date, 'dd.MM.yyyy');
    return moodEntries.value.some(entry => 
      format(parseISO(entry.payload.entry_timestamp), 'dd.MM.yyyy') === formattedDate &&
      entry.payload.spotify_song_id
    );
  }

  // refs for showing specific entry modal
  const showEntryDetails = ref(false);
  const selectedEntryId = ref<number | null>(null);

  function openEntryModal(id: number) {
    selectedEntryId.value = id;
    entryDetailsById.value = [];
    showEntryDetails.value = true;
    fetchEntryById(id);
  }

  function closeEntryModal() {
    selectedEntryId.value = null;
    showEntryDetails.value = false;
  }

  // refs for showing day modal
  const showDayDetails = ref(false);
  const selectedDate = ref<Date | null>(null);
  const selectedMoods = ref<MoodEntry[]>([]);

  function openDayModal(day: Date) {
    showDayDetails.value = true;
    const formatted = format(day, 'dd.MM.yyyy');
    selectedDate.value = day;
    selectedMoods.value = moodEntries.value.filter(entry => {
      const entryDate = format(parseISO(entry.payload.entry_timestamp), 'dd.MM.yyyy');
      return entryDate === formatted;
    });
  }

  function closeDayModal() {
    showDayDetails.value = false;
    selectedDate.value = null;
    selectedMoods.value = [];
}

  const monthsArray = computed<CalendarMonth[]>(() => generateCalendar(formattedYear.value));
  
  const loadingEntriesByYear = ref(true);
  const loadingEntryByYear = ref(true);
  const fetchError = ref('');
  const thisYear: Date = new Date().getFullYear();
  const inputYear = ref(thisYear);
  const formattedYear = ref(thisYear);
  const moodEntries = ref<MoodEntry[]>([]);
  const moodMap = computed<Map<string, number>>(() => mapMoodEntries(moodEntries.value));
  const moodImageMap: Map<string, string> = new Map([
    [1, mood1Url],
    [2, mood2Url],
    [3, mood3Url],
    [4, mood4Url],
    [5, mood5Url]
  ]);
  const entryDetailsById = ref<MoodEntry | null>(null);
  const { finalizedEntries, fetchFinalizedMoodEntries, error: moodEntriesError, loading } = useMoodEntries()

  // fetch moods when component is mounted 
  // (otherwise entries dont render until the year changes in any way)
  onMounted(() => {
    fetchEntriesByYear(); 
    location.hash = '#today';
  });


  async function fetchEntryById(id: number) {
    try {
      loadingEntryByYear.value = true;
      fetchError.value = null;

      // Ensure finalized entries are fetched/decrypted 
      // before trying to filter for a specific one
      await fetchFinalizedMoodEntries();

      if (moodEntriesError.value) {
        throw new Error(moodEntriesError.value);
      }

      const entry = finalizedEntries.value.find(entry => entry.id === id);

      if (!entry) {
        throw new Error(`Entry with ID ${id} not found`);
      }

      entryDetailsById.value = entry;
    } catch (err: any) {
      fetchError.value = err;
    } finally {
      loadingEntryByYear.value = false;
    }
}

const deleting = ref(false);

async function deleteSelectedEntry() {
  if (selectedEntryId.value === null) return;
  if (!confirm('Delete this entry?')) return;
  deleting.value = true;
  try {
    await $fetch(`/api/mood-entry/${selectedEntryId.value}`, { method: 'DELETE' });
    await fetchEntriesByYear();
    closeEntryModal();
  } catch (err: any) {
    alert(err.message || 'Failed to delete entry');
  } finally {
    deleting.value = false;
  }
}


  function incrementYear(){
    if(inputYear.value > thisYear){
      formattedYear.value = thisYear;
      inputYear.value = thisYear;
      return;
    }
    
    inputYear.value++;
    formatInputYear();
  }

  function decrementYear(){
    if(inputYear.value < 0){
      inputYear.value = formattedYear.value;
      return;
    }

    inputYear.value--;
    formatInputYear();
  }

  function formatInputYear(){
    if(inputYear.value == formattedYear.value){
      return;
    }
    
    if(inputYear.value < 0){
      inputYear.value = formattedYear.value;
      return;
    }

    if(inputYear.value > thisYear){
      formattedYear.value = thisYear;
      inputYear.value = thisYear;
      return;
    }

    formattedYear.value = inputYear.value;
    fetchEntriesByYear();
  }

  async function fetchEntriesByYear(){
     try {
      loadingEntriesByYear.value = true;
      fetchError.value = null;

      await fetchFinalizedMoodEntries()
      if (moodEntriesError.value) {
        throw new Error(moodEntriesError.value);
      }

      const year = formattedYear.value ;

      const filtered = finalizedEntries.value.filter(entry => {
        const date = parseISO(entry.payload.entry_timestamp);
        return date.getFullYear() === year;
      })

      moodEntries.value = filtered;
    } catch (err: any) {
      fetchError.value = err;

    } finally {
      loadingEntriesByYear.value = false;
    }
  }

  function mapMoodEntries(moodEntries: any[]) {
  const moodMapTemp: Map<string, number> = new Map();
  for (let i = 0; i < moodEntries.length; i++) {
    const isoString = moodEntries[i].payload.entry_timestamp;
    const formattedDateString = format(parseISO(isoString), 'dd.MM.yyyy');
    const moodValue = moodEntries[i].payload.general_mood.id;

    const existingValue = moodMapTemp.get(formattedDateString);

    if (!existingValue || moodValue > existingValue) {
      moodMapTemp.set(formattedDateString, moodValue);
    }
  }

  return moodMapTemp;
}

  function generateCalendar(year: number): CalendarMonth[] {
    const calendar: CalendarMonth[] = [];

    // Generate calendar for each month
    for (let i = 0; i < 12; i++) {
      const days: CalendarDay[] = [];
      const firstOfMonth = startOfMonth(new Date(year, i));
      const lastOfMonth = endOfMonth(firstOfMonth);
      const startOffset = (getDay(firstOfMonth) + 6) % 7; // sunday = 0, so shift range by 6

      // previous month days
      for (let i = startOffset; i > 0; i--) {
        const d = sub(firstOfMonth, { days: i });
        days.push({ date: d, day: 0 });
      }

      // current month days
      for (let i = 0; i < lastOfMonth.getDate(); i++) {
        const d = add(firstOfMonth, { days: i });
        days.push({ date: d, day: d.getDate() });
      }

      // total days in the generated calendar rounded to be divisible by 7
      const totalDays = Math.ceil(days.length / 7) * 7;

      // next month days
      while (days.length < totalDays) {
        const d = add(lastOfMonth, { days: days.length - (startOffset + lastOfMonth.getDate()) });
        days.push({ date: d, day: 0 });
      }

      // split the days into weeks
      const calendarMonth: CalendarDay[][] = [];
      for (let i = 0; i < days.length; i += 7) {
        calendarMonth.push(days.slice(i, i + 7));
      }

      // add month name and the calendar data
      const monthName = format(firstOfMonth, "MMM"); // month formatted like Jan, Feb, ...
      calendar.push({ calendarMonth, month: monthName });
    }

    return calendar;
  }
</script>

<style scoped>
  table, th, td, tr {
    border: none;
    margin: none;
    border-collapse: collapse;
  }

  table {
    width: 500px;
    min-width: 500px;
  }

  td {
    text-align: center;
  }

  .day-cell {
    position: relative;
    text-align: center;
    vertical-align: middle;
    height: 100px;
  }

  .image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70%;
  }

  .day-image {
    max-width: 80%;
    max-height: 70%;
    object-fit: fit;
  }

  .day-number {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px; 
    color: white; 
  }

  .day-number-sunday {
    position: absolute;
    bottom: 5px; 
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px; 
    color: #E36666; 
  }

</style>
