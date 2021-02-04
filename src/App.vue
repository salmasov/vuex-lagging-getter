<template>
  <div v-if="!areLocationsLoading">
    {{ activeLocationId }}
    <label v-for="location in locations" :key="location.id">
      <input
        type="radio"
        name="line"
        :value="location.id"
        :checked="location.id === activeLocationId"
        @input="setLocation($event.target.value)"
      />
      {{ location.name }}
    </label>
    <h4 v-if="!isScheduleLoading">{{ availableSlots }}</h4>
    <h4 v-if="!isScheduleLoading">{{ count }}</h4>
    <table v-if="!isScheduleLoading">
      <thead>
        <tr>
          <th v-for="date in dates" :key="date.getTime()">
            {{ date.getDate() }}/{{ date.getMonth() }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="time in times" :key="`${time.hours}:${time.minutes}`">
          <td v-for="date in dates" :key="date.getTime()">
            <booking-slot :date="date" :time="time" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import BookingSlot from "./components/BookingSlot.vue";
import { mapGetters, mapActions, mapState } from "vuex";
import {
  SCHEDULE_LENGTH,
  APPOINTMENT_LENGTH_IN_MINUTES,
  WORK_START_HOUR,
  WORK_END_HOUR,
} from "./utils";

export default {
  name: "App",

  components: {
    BookingSlot,
  },

  computed: {
    ...mapState({
      areLocationsLoading: (state) => state.locations.isLoading,
      isScheduleLoading: (state) => state.availability.isLoading,
      locations: (state) => state.locations.data,
      activeLocationId: (state) => state.activeLocationId,
    }),
    ...mapGetters(["availableSlots", "count"]),

    dates() {
      return Array.from({ length: SCHEDULE_LENGTH })
        .map((_, idx) => {
          const date = new Date();
          date.setDate(date.getDate() + idx);
          date.setHours(0, 0, 0, 0);

          return date;
        })
        .slice(0, 1);
    },
    times() {
      const START_HOUR = 8;
      const LENGTH_IN_HOURS = WORK_END_HOUR - WORK_START_HOUR;

      return Array.from({
        length: (60 / APPOINTMENT_LENGTH_IN_MINUTES) * LENGTH_IN_HOURS,
      }).map((_, idx) => {
        const date = new Date();
        date.setHours(START_HOUR, 0, 0, 0);
        date.setMinutes(
          date.getMinutes() + APPOINTMENT_LENGTH_IN_MINUTES * idx
        );
        return {
          hours: date.getHours(),
          minutes: date.getMinutes(),
        };
      });
    },
  },

  methods: {
    ...mapActions(["setLocation", "loadLocations"]),
  },

  mounted() {
    this.loadLocations();
  },
};
</script>

<style>
table {
  border-spacing: 0;
  border-collapse: collapse;
  font-size: 16px;
}

th {
  border: solid gray 1px;
  width: 80px;
}

td {
  text-align: center;
  padding: 0;
}
</style>
