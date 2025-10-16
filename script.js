// --- Replace with your actual Ninja IoT endpoints ---
const UID = "MU08";
const BASE_URL = "https://iot.roboninja.in/index.php";

// DOM Elements
const tempValue = document.getElementById("tempValue");
const humValue = document.getElementById("humValue");
const ledToggle = document.getElementById("ledToggle");
const ledStatus = document.getElementById("ledStatus");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

// Initialize Charts
const tempChart = new Chart(document.getElementById("tempChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Temperature (°C)",
      borderColor: "#C5A572",
      backgroundColor: "rgba(197,165,114,0.2)",
      data: [],
      tension: 0.4
    }]
  },
  options: { scales: { x: { display: false }, y: { color: "#F7E7CE" } } }
});

const humChart = new Chart(document.getElementById("humChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Humidity (%)",
      borderColor: "#F7E7CE",
      backgroundColor: "rgba(247,231,206,0.2)",
      data: [],
      tension: 0.4
    }]
  },
  options: { scales: { x: { display: false }, y: { color: "#F7E7CE" } } }
});

// Update device status
function setStatus(connected) {
  if (connected) {
    statusDot.style.backgroundColor = "#00ff88";
    statusText.textContent = "Connected";
  } else {
    statusDot.style.backgroundColor = "red";
    statusText.textContent = "Disconnected";
  }
}

// Fetch and update data
async function fetchSensorData() {
  try {
    const response = await fetch(`${BASE_URL}?action=read_all&UID=${UID}`);
    const data = await response.json();

    const temp = parseFloat(data.Temperature).toFixed(1);
    const hum = parseFloat(data.Humidity).toFixed(1);

    tempValue.textContent = `${temp} °C`;
    humValue.textContent = `${hum} %`;

    const timeLabel = new Date().toLocaleTimeString();

    tempChart.data.labels.push(timeLabel);
    tempChart.data.datasets[0].data.push(temp);
    if (tempChart.data.labels.length > 10) tempChart.data.labels.shift();
    tempChart.update();

    humChart.data.labels.push(timeLabel);
    humChart.data.datasets[0].data.push(hum);
    if (humChart.data.labels.length > 10) humChart.data.labels.shift();
    humChart.update();

    setStatus(true);
  } catch (err) {
    setStatus(false);
    console.error("Data fetch error:", err);
  }
}

// LED Control
ledToggle.addEventListener("change", async () => {
  const state = ledToggle.checked ? 1 : 0;
  ledStatus.textContent = "Updating...";
  try {
    await fetch(`${BASE_URL}?action=write&UID=${UID}&D1=${state}`);
    ledStatus.textContent = `Status: ${state ? "ON" : "OFF"}`;
  } catch (err) {
    ledStatus.textContent = "Connection Error";
  }
});

setInterval(fetchSensorData, 3000);
fetchSensorData();
