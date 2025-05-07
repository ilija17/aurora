<template>
  <div class="flex flex-col items-center justify-center w-full h-screen">
    <p>{{ Year }}</p>
    <div class="h-[800px] bg-[var(--secondary)] rounded-4xl pt-10 pb-10 pl-5 pr-5 overflow-y-auto scroll-smooth">
      <div v-for="month in monthsArray" class="mb-20">
        <div class="month-name relative top-0 left-0 px-4 py-2 text-lg font-semibold">{{ month.month }}</div>
        <table>
          <tr v-for="week in month.calendarMonth">
            <td v-for="day in week" :class="{'invisible': day.day === 0}">
              {{ day.day }}
            </td>
          </tr>
        </table>
      </div>
    </div>
      
    <input v-model.number="Year" placeholder="Year" />
  </div>
</template>

<script lang="ts" setup>
  import { getDay, startOfMonth, endOfMonth, sub, add, format } from "date-fns";

  interface CalendarDay {
    date: Date;
    day: number;
  }

  interface CalendarMonth {
    calendarMonth: CalendarDay[][];
    month: string;
  }

  const Year = ref<number>(2000);

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
      const monthName = format(firstOfMonth, "MMM");
      calendar.push({ calendarMonth, month: monthName });
    }

    return calendar;
  }

  const monthsArray = computed<CalendarMonth[]>(() => generateCalendar(Year.value));

  const apiResponse = ref(null)
  const isLoading = ref(true)
  const error = ref(null)
  

  onMounted(async () => {
  try {
    isLoading.value = true;

    const response = await $fetch<{ success: boolean; mood_entries: any[] }>('/api/user/fetch-moods-by-year', {
      method: 'POST',
      body: { year: 2025 }
    });

    if (!response.success || !Array.isArray(response.mood_entries)) {
      throw new Error("Invalid response from API");
    }

    apiResponse.value = response.mood_entries;
    console.log("Fetched mood entries:", apiResponse.value);
  } catch (err) {
    console.error("Error fetching mood data:", err);
    error.value = err as Error;
  } finally {
    isLoading.value = false;
  }
});

</script>

<style scoped>
  table, th, td, tr {
    border: none;
    margin: none;
    border-collapse: collapse;
  }

  table {
    width: 600px;
    min-width: 600px;
    height: 600px;
  }

  td {
    text-align: center;
  }

  .text-center {
    text-align: center;
  }

</style>
