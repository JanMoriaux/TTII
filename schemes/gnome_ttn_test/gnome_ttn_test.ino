#include <SPI.h>
#include "DHT.h"
#include <I2CSoilMoistureSensor.h>
#include <Wire.h>
#include "AirQuality2.h"
#include <TheThingsNetwork.h>

const char *devAddr = "26011AEF";
const char *nwkSKey = "E6F1742E26DCCA090A776A30FDCA4C7D";
const char *appSKey = "C9AA9CDD613EB64A0F2B23376916412F";

#define DHTPIN 20
#define LIGHTPIN A4
#define AIRQUALITYPIN A0
#define DHTTYPE DHT22
#define SEND_EVERY 5000
#define freqPlan TTN_FP_EU868
#define loraSerial Serial1
#define debugSerial Serial

DHT dht(DHTPIN, DHTTYPE); //DHT22 -> temp en humidity
I2CSoilMoistureSensor soilSensor;
AirQuality2 airqualitySensor;

TheThingsNetwork ttn(loraSerial, debugSerial, freqPlan);

//sensordata
int16_t temp;
uint16_t hum;
uint16_t soilCapacitance;
uint16_t lightValue;
uint16_t airValue;


void setup() {
  analogReference(DEFAULT);
  Wire.begin();
  loraSerial.begin(57600);
  debugSerial.begin(9600);
  while (!debugSerial && millis() < 10000)
    ;
  initModem();
  initSensors();
}

void loop() {
  debugSerial.println("-- LOOP");
  readSensors();
  displaySensorValues();
  sendSensorValues();
  debugSerial.print("Delay for: ");
  debugSerial.println(SEND_EVERY);
  debugSerial.println();
  delay(SEND_EVERY);
}

void initModem() {
  debugSerial.println("-- PERSONALIZE");
  ttn.personalize(devAddr, nwkSKey, appSKey);
  debugSerial.println("-- STATUS");
  ttn.showStatus();
}

void initSensors()
{
  debugSerial.println("Initializing sensors, this can take a few seconds...");
  //DHT22
  dht.begin();
  //Soil
  soilSensor.begin();
  //light
  pinMode(LIGHTPIN, INPUT);
  //airquality
  airqualitySensor.init(AIRQUALITYPIN);
  debugSerial.println("Done");
}

void readSensors()
{
  debugSerial.println("Start reading sensors");
  debugSerial.println("---------------------");

  //DHT22
  temp = dht.readTemperature() * 100;
  hum = dht.readHumidity() * 100;
  //Soil
  while (soilSensor.isBusy()) delay(50);
  soilCapacitance = soilSensor.getCapacitance();
  //light
  int rawValue = analogRead(LIGHTPIN);
  lightValue = rawToLux(rawValue);         // convert to lux, this is based on the voltage that the sensor receives
  //airquality
  airValue = airqualitySensor.getRawData();
}

void displaySensorValues()
{
  debugSerial.print("Temperature: ");
  debugSerial.print(temp);
  debugSerial.println(" °C");

  debugSerial.print("Humidity: ");
  debugSerial.print(hum);
  debugSerial.println(" %");

  debugSerial.print("Soil Moisture Capacitance: ");
  debugSerial.println(soilCapacitance); //read capacitance register

  debugSerial.print("Light intensity: ");
  debugSerial.print(lightValue);
  debugSerial.println(" Lux");

  debugSerial.print("Air quality: ");
  debugSerial.print(airValue);
  debugSerial.println(" Analog (0-1023)");
}

void sendSensorValues() {
  byte payload[10];

  payload[0] = highByte(temp);
  payload[1] = lowByte(temp);
  payload[2] = highByte(hum);
  payload[3] = lowByte(hum);
  payload[4] = highByte(lightValue);
  payload[5] = lowByte(lightValue);
  payload[6] = highByte(soilCapacitance);
  payload[7] = lowByte(soilCapacitance);
  payload[8] = highByte(airValue);
  payload[9] = lowByte(airValue);

  ttn.sendBytes(payload, sizeof(payload));
}

float rawToLux(int raw){
  float logLux = raw * 5.0 / 1024;
  return pow(10, logLux);
}

