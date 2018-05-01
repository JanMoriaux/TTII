//libraries
#include <Wire.h>
#include <ATT_LoRaWAN.h>
#include <Adafruit_Sensor.h>
#include <MicrochipLoRaModem.h>
#include "DHT.h"
#include <I2CSoilMoistureSensor.h>
#include "AirQuality2.h"
#include "keys.h"
#include <Container.h>

//BAUD for debug serial
#define SERIAL_BAUD 57600

//sensor pin layout and sensor types
#define DHTPIN 20
#define LIGHTPIN A4
#define AIRQUALITYPIN A0
#define DHTTYPE DHT22

//send values every half hour, with a 20s delay between messages
#define SEND_EVERY 30 * 60 * 1000
#define MIN_TIME_BETWEEN_SEND 15000

//sensors, modem,device and container
DHT dht(DHTPIN, DHTTYPE);
I2CSoilMoistureSensor soilSensor;
AirQuality2 airqualitySensor;
MicrochipLoRaModem Modem(&Serial1, &Serial);
ATTDevice Device(&Modem, &Serial, false, MIN_TIME_BETWEEN_SEND);
Container container(Device);

//sensor value declaration
float temp;
float hum;
float soilCapacitance;
float lightValue;
short airValue;


void setup() {
  //I2C for soil capacitance
  Wire.begin();

  //debugserial
  Serial.begin(SERIAL_BAUD);
  while ((!Serial) && (millis()) < 10000) {}          //wait until serial bus is available, so we get the correct logging on screen. If no serial, then blocks for 10 seconds before run
  
  //modem serial
  Serial1.begin(Modem.getDefaultBaudRate());                    // init the baud rate of the serial connection so that it's ok for the modem

  //Serial.println("Initializing modem");
  while (!Device.initABP(DEV_ADDR, APPSKEY, NWKSKEY))           // there is no point to continue if we can't connect to the cloud: this device's main purpose is to send data to the cloud.
  {
    //Serial.println("Retrying...");
    delay(200);
  }
  //Serial.println();
  //Serial.println("-- Environmental Sensing LoRa experiment --");
  //Serial.println();

  //put modem to sleep until we want to send data
  Modem.sleep();
  initSensors();
}

void loop() {
  //Serial.println("-- LOOP");
  readSensors();
  displaySensorValues();
  sendSensorValues();
  //Serial.print("Delay for: ");
  //Serial.println(SEND_EVERY);
  //Serial.println();
  delay(SEND_EVERY);
}

void initSensors()
{
  //Serial.println("Initializing sensors, this can take a few seconds...");
  //DHT22
  dht.begin();
  //Soil
  soilSensor.begin();
  //light
  pinMode(LIGHTPIN, INPUT);
  //airquality
  airqualitySensor.init(AIRQUALITYPIN);
  //Serial.println("Done");
}

void readSensors()
{
  //Serial.println("Start reading sensors");
  //Serial.println("---------------------");

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
  Serial.print("Temperature: ");
  Serial.print(temp);
  Serial.println(" °C");

  Serial.print("Humidity: ");
  Serial.print(hum);
  Serial.println(" %");

  Serial.print("Soil Moisture Capacitance: ");
  Serial.println(soilCapacitance); //read capacitance register

  Serial.print("Light intensity: ");
  Serial.print(lightValue);
  Serial.println(" Analog (0-1023)");

  Serial.print("Air quality: ");
  Serial.print(airValue);
  Serial.println(" Analog (0-1023)");
}

void sendSensorValues() {
  Modem.wakeUp();
  
  //Serial.println("Start sending data to the ATT cloud platform");
  //Serial.println("--------------------------------------------");
  container.addToQueue(soilCapacitance, LOUDNESS_SENSOR, false); process();
  container.addToQueue(lightValue, LIGHT_SENSOR, false); process();
  container.addToQueue(temp, TEMPERATURE_SENSOR, false); process();
  container.addToQueue(hum, HUMIDITY_SENSOR, false); process();
  container.addToQueue(airValue, AIR_QUALITY_SENSOR, false); process();

  Modem.sleep();
}

void process()
{
  while(Device.processQueue() > 0)
  {
    //Serial.print("QueueCount: ");
    //Serial.println(Device.queueCount());
    delay(MIN_TIME_BETWEEN_SEND);
  }
}
