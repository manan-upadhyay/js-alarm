const readline = require("readline");
const fs = require("fs");
const path = require("path");

const ALARMS_FILE = path.join(__dirname, "alarms.json");

// Create an interface for reading lines from the terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to show current time
const showCurrentTime = () => {
  let currentDatetime = new Date();
  console.log(currentDatetime.toLocaleTimeString());
};

// Function to validate the provided date
function isValidDate(str) {
  let dateString = str.trim();
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

  if (!dateString.match(dateRegex)) {
    return false;
  }

  const [day, month, year] = dateString.split("/").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return false;
  }

  return true;
}

// Function to validate the provided time
function isValidTime(str) {
  timeString = str.trim();

  const timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

  if (!timeString.match(timeRegex)) {
    return false;
  }

  const [hours, minutes] = timeString.split(":").map(Number);
  if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
    return true;
  }

  return false;
}

// Function to load alarms from file
const loadAlarmFromFile = () => {
  if (!fs.existsSync(ALARMS_FILE)) {
    return [];
  }
  const data = fs.readFileSync(ALARMS_FILE);
  return JSON.parse(data);
};

// Function to save alarms to file
const saveAlarmToFile = (alarms) => {
  fs.writeFileSync(ALARMS_FILE, JSON.stringify(alarms, null, 2));
};

// Function to delete an alarm from file
const deleteAlarmFromFile = (date, time) => {
  let alarms = loadAlarmFromFile();
  if (alarms.find((alarm) => alarm.date === date && alarm.time === time)) {
    alarms = alarms.filter(
      (alarm) => !(alarm.date === date && alarm.time === time)
    );
    saveAlarmToFile(alarms);
    console.log(`Alarm for ${date} ${time} deleted.`);
  } else {
    console.log(`Alarm for ${date} ${time} not found!`);
  }
};

// Function to show all alarms
const showAlarms = () => {
  const alarms = loadAlarmFromFile();
  if (alarms.length === 0) {
    console.log("No alarms set.");
  } else {
    console.log("Current alarms:");
    alarms.forEach((alarm, index) => {
      console.log(`${index + 1}. ${alarm.date} ${alarm.time}`);
    });
  }
};

// Function to get date and time from input to set an alarm
const getAddAlarmInput = () => {
  let selectedDate = "";
  let selectedTime = "";
  rl.question("Enter the date: (DD/MM/YYYY): ", (input) => {
    if (isValidDate(input)) {
      selectedDate = input;
    } else {
      console.error("Invalid Date Format. Please try again!");
      return rl.close();
    }

    rl.question("Enter the Time: (HH:MM - 24 hour format): ", (input) => {
      if (isValidTime(input)) {
        selectedTime = input;
        let alarms = loadAlarmFromFile();
        alarms.push({ date: selectedDate, time: selectedTime });
        saveAlarmToFile(alarms);
        console.log(`Alarm set for: ${selectedDate} ${selectedTime}!`);
      } else {
        console.error("Invalid Date Format. Please try again!");
        return rl.close();
      }
      rl.close();
    });
  });
};

// Function to get date and time from input to delete an alarm
const getDeleteAlarmInput = () => {
  rl.question("Select an alarm to delete (DD/MM/YYYY HH:MM): ", (input) => {
    const [date, time] = input.split(" ");
    if (date && isValidDate(date) && time && isValidTime(time)) {
      deleteAlarmFromFile(date, time);
    } else {
      console.error("Invalid Input. Please try again!");
      return rl.close();
    }
    return rl.close();
  });
};

const selectAction = () => {
  rl.question(
    "Enter 1 for setting an alarm, Enter 2 for deleting an alarm: ",
    (input) => {
      if (input === "1") {
        getAddAlarmInput();
      } else if (input === "2") {
        getDeleteAlarmInput();
      } else {
        console.error("Invalid Selection. Please try again!");
        return rl.close();
      }
    }
  );
};

// Initialise the application
const init = () => {
  showCurrentTime();
  showAlarms();
  selectAction();
};

init();
