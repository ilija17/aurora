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
        <td v-for="n in 7">
          {{ daysArray[7 * (week - 1)  + (n-1)] }}
        </td>
      </tr>
    </table>
  <input v-model.number="Year" placeholder="Year">
  <input v-model.number="Month" placeholder="Month (0-11)">

  </div>
</template>

<script lang="ts" setup>
  const Month = ref<number>(0);
  const Year = ref<number>(0);

  function generateMonthArray(year: number, month: number): number[] {
    let days: number[] = new Array;
    let firstDay: number = new Date(year, month, 1).getDay(); //first day of week of current month
    let lastDate: number = new Date(year, month+1, 0).getDate(); //last date of previous month
    let lastDay: number = new Date(year, month+1, 0).getDay(); //last day of week of previous month

    for(let i=firstDay; i>0; i--){
      let temp = new Date(year, month, 0).getDate(); //last date of previous month
      days.push(temp-i+1);
    }

    for(let i=0; i<lastDate; i++){
      days.push(i+1);
    }

    for(let i=0; i<(6-lastDay); i++){
      let temp = new Date(year, month+1, 1).getDate(); //first date of next month
      days.push(temp + i);
    }
    return days;
  }

  const weeks = computed(() =>{
    return Math.ceil(generateMonthArray(Year.value, Month.value).length / 7);
  });

  const daysArray = computed(() => {
    return generateMonthArray(Year.value, Month.value);
  });

  const monthYear = computed(() => {
    return new Date(Year.value, Month.value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
  });
</script>

<style scoped>
  table {
    border: 2px solid white;
    padding: 20px;   
    margin: 12px;
    border-collapse: collapse;
  }

  tr{
    border: 2px solid white;
    padding: 12px;   
    margin: 12px;
    border-collapse: collapse;
  }

  th, td{
    border: 2px solid white;
    padding: 12px;   
    border-collapse: collapse;
  }
</style>