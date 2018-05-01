const sensorValueConstants = [
  {
    sensorDesc: "Temperature",
    sensorUnit: "°C",
    recordField: "temp",
    domain: { y: [-20, 50] },
    factor: 1
  },
  {
    sensorDesc: "Humidity",
    sensorUnit: "%",
    recordField: "hum",
    domain: { y: [0, 100] },
    factor: 1
  },
  {
    sensorDesc: "Soil Moisture Capacitance",
    sensorUnit: "",
    recordField: "soilcap",
    domain: { y: [0, 100] },
    factor: 10
  },
  {
    sensorDesc: "Light Intensity",
    sensorUnit: "LUX",
    recordField: "light",
    domain: { y: [0, 100] },
    factor: 1000
  },
  {
    sensorDesc: "Air Quality",
    sensorUnit: "",
    recordField: "air",
    domain: { y: [0, 100] },
    factor: 10
  }
];

export default sensorValueConstants;
