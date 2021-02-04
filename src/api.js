import {
  SCHEDULE_LENGTH,
  APPOINTMENT_LENGTH_IN_MINUTES,
  WORK_START_HOUR,
  WORK_END_HOUR,
  NON_WORKING_DAYS
} from "./utils";

const SLEEP_ENABLED = false;
const CHANGES_INTERVAL = 200;
const NOT_AVAILABLE_PROBABILITY = 0.1;

function sleep(ms) {
  return new Promise(ok => setTimeout(ok, SLEEP_ENABLED ? ms : 0));
}

const locations = [
  { id: 1, name: "Центральный ЦПАУ" },
  { id: 2, name: "Северный ЦПАУ" },
  { id: 3, name: "Южный ЦПАУ" }
];

const availabilities = Object.fromEntries(
  locations.map(loc => {
    const availability = {};

    const now = new Date();
    now.setMinutes(
      now.getMinutes() +
        (60 - (now.getMinutes() % APPOINTMENT_LENGTH_IN_MINUTES))
    );

    const finish = new Date();
    finish.setDate(finish.getDate() + SCHEDULE_LENGTH);
    finish.setHours(8, 0, 0, 0);

    let currentDate = now;
    if (currentDate.getHours() < WORK_START_HOUR) {
      currentDate.setHours(WORK_START_HOUR, 0, 0, 0);
    }

    while (currentDate.getTime() < finish.getTime()) {
      if (currentDate.getHours() >= WORK_END_HOUR) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(WORK_START_HOUR, 0, 0, 0);
        continue;
      }

      const isAvailable = NON_WORKING_DAYS.includes(currentDate.getDay())
        ? false
        : Math.random() > NOT_AVAILABLE_PROBABILITY;

      availability[Math.floor(currentDate.getTime() / 1000)] = {
        isAvailable,
        planned: isAvailable ? Math.floor(Math.random() * 4) : 0
      };

      currentDate.setMinutes(
        currentDate.getMinutes() + APPOINTMENT_LENGTH_IN_MINUTES
      );
    }
    return [loc.id, availability];
  })
);

export async function getLocations() {
  await sleep(Math.random() * 1000);
  return locations;
}

export async function getAvailability(id) {
  await sleep(1000 + Math.random(4000));

  if (availabilities[id]) {
    return availabilities[id];
  } else {
    throw new Error("Not available");
  }
}

const subscribers = Object.fromEntries(locations.map(loc => [loc.id, []]));

export function subscribeToUpdates(id, fn) {
  if (!subscribers[id]) return;

  subscribers[id].push(fn);
  return function unsubcribe() {
    subscribers[id] = subscribers[id].filter(f => f !== fn);
  };
}

setInterval(() => {}, CHANGES_INTERVAL);
