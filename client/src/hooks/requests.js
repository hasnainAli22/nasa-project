import axios from 'axios';

const API_URL = "http://localhost:8000/v1";

async function httpGetPlanets() {
  // TODO: Once API is ready.
  // Load planets and return as JSON.
  const response = await axios.get(`${API_URL}/planets`);
  return response.data;
  // return await response.json();
}

async function httpGetLaunches() {
  // TODO: Once API is ready.
  // Load launches, sort by flight number, and return as JSON.
  const response = await axios.get(`${API_URL}/launches`);
  const fetchedLaunches = response.data;
  return fetchedLaunches.sort((a, b) => {
    return a.flightNumber = b.flightNumber;
  });
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  // TODO: Once API is ready.
  try {
    return await axios({
      method: "post",
      url: `${API_URL}/launches`,
      headers: {
        'Content-Type': "application/json"
      },
      data: JSON.stringify(launch)
    });
  } catch (error) {
    return {
      ok: false
    }
  }
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try {
    return await axios({
      method: "delete",
      url: `${API_URL}/launches/${id}`,
    });

  } catch (error) {
    console.log(error)
  }
}


export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};