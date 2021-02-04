import Vue from "vue";
import Vuex from "vuex";
import {
  getLocations as getLocationsFromApi,
  getAvailability as getAvailabilityFromApi,
  subscribeToUpdates
} from "./api";

const LOAD_LOCATIONS_START = "MUTATION_LOAD_LOCATIONS_START";
const LOAD_LOCATIONS_SUCCESS = "MUTATION_LOAD_LOCATIONS_SUCCESS";

const LOAD_AVAILABILITY_START = "MUTATION_LOAD_AVAILABILITY_START";
const LOAD_AVAILABITY_SUCCESS = "MUTATION_LOAD_AVAILABILITY_SUCCESS";
const UPDATE_AVAILABILITY = "MUTATION_UPDATE_AVAILABILITY";

const SET_ACTIVE_LOCATION = "MUTATION_SET_ACTIVE_LOCATION";

Vue.use(Vuex);

let unsubscribeFn = null;

// const Observer = new Vue().$data.__ob__.constructor;

const store = new Vuex.Store({
  state: {
    availability: {
      isLoading: true,
      data: null
    },
    activeLocationId: null,
    locations: {
      isLoading: true,
      data: null
    }
  },

  getters: {
    activeLocation: ({
      activeLocationId,
      locations: { data: locationsData }
    }) => locationsData?.find(({ id }) => id === activeLocationId),

    count: ({ availability: { data } }) => Object.entries(data).length,

    availableSlots: ({ availability: { data: availabilityData } }) => {
      if (!availabilityData) return [];

      return Object.keys(availabilityData).filter(
        (k) =>
          availabilityData[k].planned === 0 && availabilityData[k].isAvailable
      ).length;
    },

    getAvailability: ({ availability: { data: availabilityData } }) => (
      date,
      time
    ) => {
      const d = new Date(date);
      d.setHours(time.hours, time.minutes, 0, 0);

      return (
        availabilityData[Math.floor(d.getTime() / 1000)] ?? {
          isAvailable: false,
          planned: 0
        }
      );
    }
  },

  mutations: {
    [LOAD_LOCATIONS_START](state) {
      state.locations.isLoading = true;
    },

    [LOAD_LOCATIONS_SUCCESS](state, locations) {
      state.locations.data = locations;
      state.locations.isLoading = false;
    },

    [LOAD_AVAILABILITY_START](state) {
      state.availability.isLoading = true;
    },

    [LOAD_AVAILABITY_SUCCESS](state, payload) {
      state.availability.data = payload;
      state.availability.isLoading = false;
    },

    [UPDATE_AVAILABILITY](state, { time, ...data }) {
      if (state.availability.isLoading) {
        return;
      }

      state.availability = {
        ...state.availability,
        [time]: data
      };
    },

    [SET_ACTIVE_LOCATION](state, id) {
      state.activeLocationId = id;
    }
  },

  actions: {
    async setLocation({ commit }, id) {
      if (unsubscribeFn) {
        unsubscribeFn();
      }

      commit(SET_ACTIVE_LOCATION, id);
      commit(LOAD_AVAILABILITY_START);
      const availability = await getAvailabilityFromApi(id);
      unsubscribeFn = subscribeToUpdates(id);

      commit(LOAD_AVAILABITY_SUCCESS, availability);
    },

    async loadLocations({ commit, dispatch, state }) {
      commit(LOAD_LOCATIONS_START);
      const locations = await getLocationsFromApi();
      commit(LOAD_LOCATIONS_SUCCESS, locations);
      await dispatch("setLocation", state.locations.data[0].id);
    }
  }
});

// Just for debugging purposes
window.store = store;

export default store;
