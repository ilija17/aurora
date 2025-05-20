<template>
  <div class="flex flex-col items-center justify-center w-full h-screen">
    <div class="flex p-5">
      <button @click="decrementYear">
        <
      </button>
      <input class="min-w-[6ch] w-[6ch] ml-2 mr-2" v-model.number="inputYear" @blur="formatInputYear" @keyup.enter="formatInputYear" />
      <button @click="incrementYear">
        >
      </button>
    </div>
  
    <div class="min-h-[600px] h-[800px] bg-[var(--secondary)] rounded-4xl pt-10 pb-10 pl-5 pr-5 overflow-y-auto scroll-smooth">
      <div v-for="month in monthsArray" :key="month.month" class="mb-20">
        <div class="month-name relative top-0 left-0 px-4 py-2 text-lg font-semibold">{{ month.month }}</div>
        <table>
          <tbody>
            <tr v-for="(week, weekIndex) in month.calendarMonth" :key="weekIndex">
              <td v-for="day in week" :key="format(day.date, 'dd-MM-yyyy')" class="day-cell">
                <div
                  class="w-full h-full cursor-pointer border-2 rounded-2xl border-transparent hover:border-[var(--accent)] transition-colors ease-in-out"
                  :class="{
                    'invisible': day.day === 0,
                    //'bg-[var(--primary)]/50': isToday(day.date) odkomentirat po zelji
                  }"
                  @click="openDayModal(day.date);"
                >
                  <div v-if="isToday(day.date)" class="rounded-full w-2 h-2 bg-[var(--accent)] absolute top-2 left-2"></div>
                  <div v-if="hasSpotifySongOnDay(day.date)" class="absolute top-1 right-3 w-2 h-1">
                    <svg width="26" height="23" viewBox="0 0 26 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.4084 19.0666C11.1444 19.0666 10.0623 18.6166 9.16221 17.7164C8.26208 16.8163 7.81201 15.7342 7.81201 14.4702C7.81201 13.2062 8.26208 12.1241 9.16221 11.224C10.0623 10.3239 11.1444 9.87382 12.4084 9.87382C12.8489 9.87382 13.2511 9.93127 13.615 10.0462C13.998 10.1419 14.3619 10.2952 14.7066 10.5058V-1.61719H21.6012V2.97921H17.0048V14.4702C17.0048 15.7342 16.5547 16.8163 15.6546 17.7164C14.7545 18.6166 13.6724 19.0666 12.4084 19.0666Z" fill="#FEF7FF"/>
                    </svg>
                  </div>
                  <div v-if="!loadingEntriesByYear" class="image-container">
                    <img
                      :src="moodImageMap.get(moodMap?.get(format(day.date, 'dd.MM.yyyy'))) ?? defaultMoodUrl"
                      :class="{ 'invisible': !moodMap?.get(format(day.date, 'dd.MM.yyyy')) }"
                      alt="Mood image"
                    />
                  </div>
                  <div :class="{ 'day-number': getDay(day.date) != 0, 'day-number-sunday': getDay(day.date) == 0 }">
                    {{ day.day }}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

<!-- day details modal -->
  <div
    v-if="showDayDetails"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div class="bg-[var(--secondary)] p-6 rounded-xl shadow-lg w-[90%] max-w-md text-[var(--fg)] flex flex-col min-h-[300px] h-[50vh]">
      <div class="flex flex-col gap-2 overflow-y-auto mb-4">
        <div
          v-for="entry in selectedMoods"
          :key="entry.id"
          class="rounded-lg px-4 py-3 hover:bg-[var(--accent)] cursor-pointer transition"
          @click="openEntryModal(entry.id)"
        >
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm font-semibold">
                {{ format(parseISO(entry.entry_timestamp), 'HH:mm') }}
              </div>
              <div class="text-xs text-[var(--muted-foreground)]">
                {{ format(parseISO(entry.entry_timestamp), 'dd.MM.yyyy') }}
              </div>
            </div>
            <img
              class="w-12 h-12 object-contain"
              :src="moodImageMap.get(entry.general_mood) ?? defaultMoodUrl"
              alt="Mood image"
            />
          </div>
        </div>
      </div>

      <div class="mt-auto">
        <button
          @click="closeDayModal"
          class="px-4 py-2 rounded bg-[var(--border)] hover:bg-[var(--muted)] text-[var(--fg)] transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>

  <!-- entry details modal -->
<div
  v-if="showEntryDetails"
  class="fixed inset-0 bg-transparent flex items-center justify-center z-50"
>
  <div class="bg-[var(--secondary)] p-6 rounded-xl shadow-lg w-[90%] max-w-md text-[var(--fg)] flex flex-col min-h-[300px] h-[50vh]">

    <!-- scrollable content section -->
    <div class="flex flex-col gap-4 overflow-y-auto mb-4">
      <div class="flex w-full items-center">
        <img
          :src="moodImageMap.get(entryDetailsById?.general_mood_id) ?? defaultMoodUrl"
          alt="Mood image"
          class="w-12 h-12 object-cover mr-4"
        />
        <div class="flex flex-col justify-center">
          <div class="text-lg font-semibold">
            {{ format(parseISO(entryDetailsById?.entry_timestamp), 'EEE') }},
            {{ format(parseISO(entryDetailsById.entry_timestamp), 'h:mm a') }}
          </div>
        </div>
      </div>

      <!-- spotify widget -->
      <div v-if="entryDetailsById?.spotify_song_id" class="mb-4 self-start w-full ">
        <iframe
          :src="`https://open.spotify.com/embed/track/${entryDetailsById?.spotify_song_id}`"
          width="300"
          height="80"
          frameborder="0"
          allowtransparency="true"
          allow="encrypted-media"
        ></iframe>
      </div>

      <!-- note -->
      <div>
        <div class="text-sm font-medium text-[var(--muted-foreground)]">Notes:</div>
        <div class="border-2 border-transparent bg-[var(--input-bg)] rounded-md p-3 mt-2 w-full h-auto m-h-80 text-lg overflow-y-auto overflow-x-hidden break-words">
          {{ entryDetailsById?.notes || "No notes for today" }}
        </div>
      </div>

      <!-- detailed Moods -->
      <div>
        <div class="text-sm font-medium text-[var(--muted-foreground)]">Detailed Moods:</div>
        <ul class="list-disc pl-5">
          <li v-for="mood in entryDetailsById?.detailed_moods" :key="mood.mood_name" class="text-lg">
            {{ mood.mood_name }}
          </li>
        </ul>
      </div>

      <!-- social Contexts -->
      <div>
        <div class="text-sm font-medium text-[var(--muted-foreground)]">Who you were with:</div>
        <ul class="list-disc pl-5">
          <li v-for="context in entryDetailsById?.social_contexts" :key="context.social_name" class="text-lg">
            {{ context.social_name }}
          </li>
        </ul>
      </div>

      <!-- location Contexts -->
      <div>
        <div class="text-sm font-medium text-[var(--muted-foreground)]">Where you were:</div>
        <ul class="list-disc pl-5">
          <li v-for="location in entryDetailsById?.location_contexts" :key="location.location_name" class="text-lg">
            {{ location.location_name }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Cancel button at the bottom -->
    <div class="mt-auto">
      <button
        @click="closeEntryModal"
        class="px-4 py-2 rounded bg-[var(--border)] hover:bg-[var(--muted)] text-[var(--fg)] transition"
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
  import { getDay, startOfMonth, endOfMonth, sub, add, format, parseISO, isToday } from 'date-fns';

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
  notes?: string;
  detailed_moods?: { mood_name: string }[];
  social_contexts?: { social_name: string }[];
  location_contexts?: { location_name: string }[];
}

  //utility funkcija da provjeri ako dan ima barem 1 spotify entry (ovaj kod postaje katastrofa)
  function hasSpotifySongOnDay(date: Date): boolean {
    const formattedDate = format(date, 'dd.MM.yyyy');
    return moodEntries.value.some(entry => 
      format(parseISO(entry.entry_timestamp), 'dd.MM.yyyy') === formattedDate &&
      entry.spotify_song_id
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
      const entryDate = format(parseISO(entry.entry_timestamp), 'dd.MM.yyyy');
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
  const currentDayRef = ref<HTMLElement | null>(null);

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

  onMounted(() => {
    fetchEntriesByYear(); // fetch moods when component is mounted (otherwise calendar doesn't render until the year is changed)
  });

  async function fetchEntryById(id: number) {
  try {
    loadingEntryByYear.value = true;

    const response = await $fetch<{ success: boolean; mood_entry: any }>('/api/mood-entries/fetch-entry-by-id', {
      method: 'POST',
      body: { entry_id: id }
    });

    if (!response.success || !response.mood_entry) {
      throw new Error("Invalid response from API");
    }

    entryDetailsById.value = response.mood_entry;
  } catch (err) {
    console.error("Error fetching mood data:", err);
    fetchError.value = err as Error;
  } finally {
    loadingEntryByYear.value = false;
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
    currentDayRef.value = null; // clear current day ref when the year changes and the current day is possibly out of view
    fetchEntriesByYear();
  }

  async function fetchEntriesByYear(){
    try {
      loadingEntriesByYear.value = true;

      const response = await $fetch<{ success: boolean; mood_entries: any[] }>('/api/mood-entries/fetch-entries-by-year', {
        method: 'POST',
        body: { year: formattedYear.value }
      })

      if (!response.success || !Array.isArray(response.mood_entries)) {
        throw new Error("Invalid response from API");
      }

      moodEntries.value = response.mood_entries;
    } catch (err) {
      console.error("Error fetching mood data:", err);
      fetchError.value = err as Error;
    } finally {
      loadingEntriesByYear.value = false;
    }
  }

  function mapMoodEntries(moodEntries: any[]) {
  const moodMapTemp: Map<string, number> = new Map();

  for (let i = 0; i < moodEntries.length; i++) {
    const isoString = moodEntries[i].entry_timestamp;
    const formattedDateString = format(parseISO(isoString), 'dd.MM.yyyy');
    const moodValue = moodEntries[i].general_mood;

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
    height: 100px; /* Adjust based on your design */
  }

  .image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70%; /* Take most of the space above the number */
  }

  .day-image {
    max-width: 80%; /* Adjust the size of the image */
    max-height: 70%; /* Adjust the height of the image */
    object-fit: fit;
  }

  .day-number {
    position: absolute;
    bottom: 5px; /* This places the text at the bottom */
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px; /* Small font size for the day number */
    color: white; /* Optional: adjust the text color */
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
