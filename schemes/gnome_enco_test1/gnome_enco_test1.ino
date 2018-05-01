#include <SPI.h>
#include <Wire.h>
#include <ATT_LoRa_IOT.h>
#include <MicrochipLoRaModem.h>
#include "DHT.h"
#include <I2CSoilMoistureSensor.h>
#include "AirQuality2.h"
#include "keys.h"

#define DHTPIN 20
#define LIGHTPIN A4
#define AIRQUALITYPIN A0

#define DHTTYPE DHT22

//send every hour
#define SEND_EVERY 300000

#define loraSerial Serial1
#define debugSerial Serial

DHT dht(DHTPIN, DHTTYPE);
I2CSoilMoistureSensor soilSensor;
AirQuality2 airqualitySensor;
MicrochipLoRaModem Modem(&Serial1, &Serial);
ATTDevice Device(&Modem, &Serial);

float temp;
float hum;
float soilCapacitance;
float lightValue;
short airValue;


void setup() {
  //analogReference(EXTERNAL);
  Wire.begin();

  while ((!Serial) && (millis()) < 2000) {}          //wait until serial bus is available, so we get the correct logging on screen. If no serial, then blocks for 2 seconds before run
  Serial.begin(57600);
  Serial1.begin(Modem.getDefaultBaudRate());                    // init the baud rate of the serial connection so that it's ok for the modem

  Serial.println("-- Environmental Sensing LoRa experiment --");
  Serial.print("Sending data each "); Serial.print(SEND_EVERY); Serial.println(" milliseconds");

  Serial.println("Initializing modem");
  while (!Device.Connect(DEV_ADDR, APPSKEY, NWKSKEY))           // there is no point to continue if we can't connect to the cloud: this device's main purpose is to send data to the cloud.
  {
    Serial.println("Retrying...");
    delay(200);
  }

  Device.SetMinTimeBetweenSend(15000);                          // wait between sending 2 messages, to make certain that the base station doesn't punish us for sending too much data too quickly, default = 0.
  initSensors();
}

void loop() {
  Serial.println("-- LOOP");
  readSensors();
  displaySensorValues();
  sendSensorValues();
  Serial.print("Delay for: ");
  Serial.println(SEND_EVERY);
  Serial.println();
  delay(SEND_EVERY);
}

void initSensors()
{
  Serial.println("Initializing sensors, this can take a few seconds...");
  //DHT22
  dht.begin();
  //Soil
  soilSensor.begin();
  //light
  pinMode(LIGHTPIN, INPUT);
  //airquality
  airqualitySensor.init(AIRQUALITYPIN);
  Serial.println("Done");
}

void readSensors()
{
  Serial.println("Start reading sensors");
  Serial.println("---------------------");

  //DHT22
  temp = dht.readTemperature();
  hum = dht.readHumidity();
  //Soil
  while (soilSensor.isBusy()) delay(50);
  soilCapacitance = soilSensor.getCapacitance();
  //light
  lightValue = analogRead(LIGHTPIN);
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
  debugSerial.println(" Analog (0-1023)");

  debugSerial.print("Air quality: ");
  debugSerial.print(airValue);
  debugSerial.println(" Analog (0-1023)");
}

void sendSensorValues() {
  Serial.println("Start uploading data to the Proximus EnCo");
  Serial.println("----------------------------------------------");
  
  Serial.println("Sending soil capacitance value... ");
  Device.Send(soilCapacitance, LOUDNESS_SENSOR,false);
  
  Serial.println("Sending light value... ");
  Device.Send(lightValue, LIGHT_SENSOR,false);
  
  Serial.println("Sending temperature value... ");
  Device.Send(temp, TEMPERATURE_SENSOR,false);
  
  Serial.println("Sending humidity value... ");
  Device.Send(hum, HUMIDITY_SENSOR,false);
  
  Serial.println("Sending air quality value... ");
  Device.Send(airValue, AIR_QUALITY_SENSOR,false);
}



