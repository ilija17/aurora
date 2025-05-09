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
    

    <div v-if="loadingMoods" class="h-[800px] flex items-center justify-center">
      <p class="text-lg text-gray-500">Loading mood entries...</p>
    </div>

    <div v-else class="h-[800px] bg-[var(--secondary)] rounded-4xl pt-10 pb-10 pl-5 pr-5 overflow-y-auto scroll-smooth">
      <div v-for="month in monthsArray" class="mb-20">
        <div class="month-name relative top-0 left-0 px-4 py-2 text-lg font-semibold">{{ month.month }}</div>
        <table>
          <tbody>
            <tr v-for="week in month.calendarMonth">
              <td v-for="day in week" class="day-cell">
                <div
                  class="w-full h-full cursor-pointer border-2 rounded-2xl border-transparent hover:border-[var(--accent)]"
                  :class="{
                    'invisible': day.day === 0,
                    'bg-[var(--primary)] opacity-50': isToday(day.date)
                  }"
                  @click="openDayModal(day.date)"
                >
                  <div class="image-container">
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

  <div
  v-if="showDayDetails"
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
>
  <div class="bg-[var(--secondary)] p-6 rounded-xl shadow-lg w-[90%] max-w-md text-[var(--fg)] flex flex-col min-h-[300px]">
    <div class="flex flex-col gap-2 overflow-y-auto max-h-[60vh] mb-4">
      <div
        v-for="entry in selectedMoods"
        :key="entry.id"
        class="bg-[var(--secondary)] rounded-lg px-4 py-3 hover:bg-[var(--accent)] transition"
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
            class="w-6 h-6 object-contain"
            :src="moodImageMap.get(moodMap?.get(format(parseISO(entry.entry_timestamp), 'dd.MM.yyyy')) ?? '') ?? defaultMoodUrl"
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
</template>


<script lang="ts" setup>
  import mood1Url from '@/assets/images/1.svg';
  import mood2Url from '@/assets/images/2.svg';
  import mood3Url from '@/assets/images/3.svg';
  import mood4Url from '@/assets/images/4.svg';
  import mood5Url from '@/assets/images/5.svg';
  import defaultMoodUrl from '@/assets/images/default-mood.svg';
  import { getDay, startOfMonth, endOfMonth, sub, add, format, parseISO, isToday } from 'date-fns';

  interface CalendarDay {
    date: Date;
    day: number;
  }

  interface CalendarMonth {
    calendarMonth: CalendarDay[][];
    month: string;
  }

  const showDayDetails = ref(false);

  const selectedDate = ref<Date | null>(null);
  const selectedMoods = ref<any[]>([]);

  function openDayModal(day: Date) {
    showDayDetails.value = true;
    const formatted = format(day, 'dd.MM.yyyy');
    selectedDate.value = day;
    selectedMoods.value = moodEntries.value.filter(entry => {
      const entryDate = format(parseISO(entry.entry_timestamp), 'dd.MM.yyyy');
      return entryDate === formatted;
    });
    console.log(selectedMoods.value)
  }

  function closeDayModal() {
    showDayDetails.value = false;
    selectedDate.value = null;
    selectedMoods.value = [];
}

  const monthsArray = computed<CalendarMonth[]>(() => generateCalendar(formattedYear.value));
  
  const loadingMoods = ref(true);
  const fetchError = ref('');
  const thisYear: Date = new Date().getFullYear();
  const inputYear = ref(thisYear);
  const formattedYear = ref(thisYear);
  const currentDayRef = ref<HTMLElement | null>(null);

  const moodEntries = ref([]);
  const moodMap = computed<Map<string, string>>(() => mapMoodEntries(moodEntries.value));
  const moodImageMap: Map<string, string> = new Map([
    ['Great', mood1Url],
    ['Good', mood2Url],
    ['Fine', mood3Url],
    ['Bad', mood4Url],
    ['Awful', mood5Url]
  ]);

  onMounted(() => {
    fetchMoods(); // fetch moods when component is mounted (otherwise calendar doesn't render until the year is changed)
  });



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
    fetchMoods();
  }

  async function fetchMoods(){
    try {
      loadingMoods.value = true;

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
      loadingMoods.value = false;
    }
  }

  function mapMoodEntries(moodEntries: string[]){
    const moodMapTemp: Map<string, string> = new Map();
    for(let i=0; i<moodEntries.length; i++){
      const isoString: string = moodEntries[i].entry_timestamp;
      const formattedDateString: string = format(parseISO(isoString), 'dd.MM.yyyy').toString();
      const moodName: string = moodEntries[i].general_moods.mood_name;

      moodMapTemp.set(formattedDateString, moodName)
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
    object-fit: contain;
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
