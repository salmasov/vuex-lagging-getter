<template>
  <div
    class="booking-slot"
    :class="{
      'not-available': !timeslot.isAvailable,
      free: timeslot.planned === 0,
      'low-load': timeslot.planned === 1,
      'medium-load': timeslot.planned === 2,
      'high-load': timeslot.planned > 2,
    }"
  >
    {{ time.hours }}:{{ time.minutes.toString().padStart(2, "0") }}
    <template v-if="true">{{ availableSlots }}</template>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  props: {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapGetters(["getAvailability", "availableSlots"]),
    timeslot() {
      return this.getAvailability(this.date, this.time);
    },
  },
};
</script>
<style>
td {
  height: 20px;
}

.booking-slot {
  width: 100%;
  height: 100%;
}

.free {
  background-color: lightgreen;
}
.low-load {
  background-color: lightyellow;
}
.medium-load {
  background-color: orange;
}
.high-load {
  background-color: pink;
}

.not-available {
  background-color: lightgray;
  cursor: not-allowed;
  opacity: 0.3;
  border: none;
}
</style>
