<template>
  <div class="flex flex-col items-center justify-center w-full h-screen">
    <p>
    {{ monthYear }}
  </p>
    <table class="">
      <thead>
        <tr>
          <th>Sunday</th>
          <th>Monday</th>
          <th>Tuesday</th>
          <th>Wednesday</th>
          <th>Thursday</th>
          <th>Friday</th>
          <th>Saturday</th>
        </tr>
      </thead>
      <tr v-for="week in weeks">
        <td v-for="day in week"
        :class="{
          'bg-[var(--secondary)]':   day.type === 'prev' || day.type === 'next',
          'bg-[var(--tertiary)]':  day.type === 'current'
        }">
          {{ day.day }}
        </td>
      </tr>
    </table>
  <input v-model.number="Year" placeholder="Year">
  <input v-model.number="Month" placeholder="Month (0-11)">

  </div>
</template>

<script lang="ts" setup>
  import { getDay, startOfMonth, endOfMonth, sub, add, format } from "date-fns";

  interface CalendarDay{
    date: Date;
    day: number;
    type: 'prev' | 'current' | 'next';
  }

  const Month = ref<number>(0);
  const Year = ref<number>(0);

  function generateCalendarDays(year: number, month: number): CalendarDay[] {
  const firstOfMonth = startOfMonth(new Date(year, month-1));
  const lastOfMonth = endOfMonth(firstOfMonth);
  const startOffset = getDay(firstOfMonth); // sunday = 0
  const days: CalendarDay[] = [];

  for (let i = startOffset; i > 0; i--) {
    const d = sub(firstOfMonth, {days: i});
    days.push({ date: d, day: d.getDate(), type: 'prev' });
  }

  for (let i = 0; i < lastOfMonth.getDate(); i++) {
    const d = add(firstOfMonth, {days: i});
    days.push({ date: d, day: d.getDate(), type: 'current' });
  }

  const totalDays = Math.ceil(days.length/7)*7;

  while (days.length < totalDays) {
    const d = add(lastOfMonth, {days: days.length - (startOffset + lastOfMonth.getDate())});
    days.push({ date: d, day: d.getDate(), type: 'next' });
  }

  return days;
}

  const daysArray = computed<CalendarDay[]>(() => {
    return generateCalendarDays(Year.value, Month.value);
  });

  const weeks = computed<CalendarDay[][]>(() => {
    const chunkSize = 7;
    const weeksArray: CalendarDay[][] = [];
    for (let i = 0; i < daysArray.value.length; i += chunkSize) {
      const chunk = daysArray.value.slice(i, i + chunkSize);
      weeksArray.push(chunk);
    }

    return weeksArray;
  });

  const monthYear = computed(() => {
    return new Date(Year.value, Month.value-1).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
  });
</script>

<style scoped>
  table {
    background-color: var(--primary)
  }
  table, th, td, tr{
    border: 2px solid var(--border);
    padding: 12px;   
    margin: 12px;
    border-collapse: collapse;
  }
</style>