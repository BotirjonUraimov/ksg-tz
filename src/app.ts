const express = require("express");
const EventEmitter = require("events");
const axios = require("axios");

const app = express();
const port = 3000;
const eventEmitter = new EventEmitter();

let previousData: any = null; // Stores the previous data for comparison

// Event listener for data change
// eventEmitter.on("dataChanged", () => {
//   console.log("Data changed!");
// });

// Function to fetch data from the API
const fetchData = async () => {
  try {
    const response = await axios.get("https://api.waxpeer.com/v1/prices");
    const newData = response.data;

    // Compare the new data with the previous data
    if (JSON.stringify(newData) !== JSON.stringify(previousData)) {
      // If the data is different, emit the 'dataChanged' event
      eventEmitter.emit("dataChanged", newData);
      console.log("data changed");
    }

    // Update the previous data for the next comparison
    previousData = newData;
  } catch (error: any) {
    console.error("Error fetching data:", error.message);
  }
};

// Start fetching the data every 10 seconds
setInterval(fetchData, 10000);

export default eventEmitter;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
