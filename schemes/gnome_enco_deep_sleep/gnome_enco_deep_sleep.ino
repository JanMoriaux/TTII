//References:
//https://github.com/GabrielNotman/Testing/blob/master/Structured_Sleep/Structured_Sleep.ino
//https://github.com/allthingstalk/arduino-lorawan-rdk/blob/master/examples/environmental-sensing/environmental-sensing.ino

//LIBRARIES

#include <Wire.h>
#include <avr/sleep.h>
#include <RTCTimer.h>
#include <Sodaq_DS3231.h>
#include <Sodaq_PcInt.h>
#include <ATT_LoRaWAN.h>
#include <MicrochipLoRaModem.h>
#include <Container.h>
#include "DHT.h"
#include <I2CSoilMoistureSensor.h>
#include "AirQuality2.h"
#include "keys.h"

//SERIAL PORT BAUD RATE

#define PC_BAUD 57600

//TIMING AND INTERVALS

//The delay in seconds between the sensor readings
//This should be a whole multiple (units!) of the RTC_INT_PERIOD
//hours * minutes * seconds
#define SENSOR_INTERVAL 2 * 60 * 60

//Minimum number of readings before uploading data
#define UPLOAD_READING_INTERVAL 1

//Minimum time between sending of sensor values to EnCo network
#define MIN_TIME_BETWEEN_SEND 15000

//RTC Interrupt period
#define RTC_INT_PERIOD EveryHour

//PINS
//RTC Interrupt pin
#define RTC_PIN A7

//Sensor pins and types
#define DHTPIN 20
#define DHTTYPE DHT22
#define LIGHTPIN A4
#define AIRQUALITYPIN A0

//SENSOR, DEVICE, MODEM, CONTAINER AND TIMER INSTANCES
MicrochipLoRaModem Modem(&Serial1, &Serial);
ATTDevice Device(&Modem, &Serial, false, MIN_TIME_BETWEEN_SEND);
Container container(Device);
DHT dht(DHTPIN, DHTTYPE);
I2CSoilMoistureSensor soilSensor;
AirQuality2 airqualitySensor;
RTCTimer timer;

//SENSOR VALUES
float temp;
float hum;
float soilCapacitance;
float lightValue;
short airValue;

//ISR FLAGS
volatile bool timer_flag = false;

size_t readingCount = 0;

void setup()
{
  //Initialize the serial connection
  //Serial.begin(PC_BAUD);
  //while ((!Serial) && (millis()) < 10000) {}          //wait until serial bus is available, so we get the correct logging on screen. If no serial, then blocks for 10 seconds before run
  //Serial.println("Power up...");

  //Initialize sensors
  setupSensors();

  //Setup timer events
  setupTimer();

  //Setup communications module
  setupCommunication();

  //Setup sleep mode
  setupSleep();
}

void loop()
{
  if (timer_flag) {
    //Clear this first in case the main code takes > 1 min
    timer_flag = false;
    rtc.clearINTStatus();

    //Update the timer
    timer.update();
  }

  //Sleep
  systemSleep();
}

void setupSleep()
{
  pinMode(RTC_PIN, INPUT_PULLUP);
  PcInt::attachInterrupt(RTC_PIN, wakeISR);

  //Schedule the wakeup interrupt for every minute
  rtc.enableInterrupts(RTC_INT_PERIOD);
  rtc.clearINTStatus();

  //Set the sleep mode
  set_sleep_mode(SLEEP_MODE_PWR_DOWN);
}

void wakeISR()
{
  //Check if the trigger was FALLING
  if (!digitalRead(RTC_PIN)) {
    timer_flag = true;
  }
}

void systemSleep()
{
  //Serial.print("Attempting sleep. Timer flag: "); Serial.println(timer_flag);

  
  //Wait until the serial ports have finished transmitting
  //Serial.flush();
  Serial1.flush();

  //Serial.end();

  //Disable ADC
  ADCSRA &= ~_BV(ADEN);

  //Sleep time
  noInterrupts();

  
  
  if (!timer_flag) {
    sleep_enable();
    interrupts();
    sleep_cpu();

    //Zzzz Zzzz

    sleep_disable();
  }
  interrupts();

  //Enbale ADC
  ADCSRA |= _BV(ADEN);

  //Serial.begin(PC_BAUD);
}

void takeReading(uint32_t ts)
{
  //Serial.println("Start reading sensors");
  //showTime(getNow());
  //Serial.println("---------------------");

  //DHT22
  temp = dht.readTemperature();
  hum = dht.readHumidity();
  //I2CSoilMostureSensor
  while (soilSensor.isBusy()) delay(50);
  soilCapacitance = soilSensor.getCapacitance();
  //light value
  lightValue = analogRead(LIGHTPIN);
  //airquality
  airValue = airqualitySensor.getRawData();

  //displaySensorValues();

  readingCount++;
  if (readingCount >= UPLOAD_READING_INTERVAL) {
    if (uploadData()) {
      readingCount = 0;
    }
  }
}

void setupSensors()
{
  //Serial.println("Initializing sensors, this can take a few seconds...");

  //Wire protocol for the I2C (SoilMoisture) sensor
  Wire.begin();
  //DS3231 RTC
  rtc.begin();
  //DHT22 sensor
  dht.begin();
  //Initialize the I2CSoilMoistureSensor
  soilSensor.begin();
  //light sensor
  pinMode(LIGHTPIN, INPUT);
  //air quality sensor
  airqualitySensor.init(AIRQUALITYPIN);

  //Serial.println("Done");
}

void setupTimer()
{
  //Instruct the RTCTimer how to get the current time reading
  timer.setNowCallback(getNow);

  //Schedule the reading interval
  timer.every(SENSOR_INTERVAL, takeReading);
}

void setupCommunication()
{
  Serial1.begin(Modem.getDefaultBaudRate());                    // init the baud rate of the serial connection so that it's ok for the modem
  //Serial.println("Initializing modem");
  while (!Device.initABP(DEV_ADDR, APPSKEY, NWKSKEY))           // there is no point to continue if we can't connect to the cloud: this device's main purpose is to send data to the cloud.
  {
    //Serial.println("Retrying...");
    delay(200);
  }
  Modem.sleep();                                               // put the modem to sleep until we're ready to start uploading data
  //Serial.println("Done");
}

bool uploadData()
{
  //Serial.println("Uploading data...");

  bool result = false;

  Modem.wakeUp();
  
  container.addToQueue(soilCapacitance, LOUDNESS_SENSOR, false); process();
  container.addToQueue(lightValue, LIGHT_SENSOR, false); process();
  container.addToQueue(temp, TEMPERATURE_SENSOR, false); process();
  container.addToQueue(hum, HUMIDITY_SENSOR, false); process();
  container.addToQueue(airValue, AIR_QUALITY_SENSOR, false); process();

  Modem.sleep();

  result = true;

  if (result) {
    //Serial.println("Upload succeeded...");
  } else {
    //Serial.println("Upload failed...");
  }
  return result;
}

uint32_t getNow()
{
  return rtc.now().getEpoch();
}

//void displaySensorValues() {
//  //Serial.print("Temperature: ");
//  //Serial.print(temp);
//  //Serial.println(" °C");
//
//  Serial.print("Humidity: ");
//  Serial.print(hum);
//  Serial.println(" %");
//
//  Serial.print("Soil Moisture Capacitance: ");
//  Serial.println(soilCapacitance); //read capacitance register
//
//  Serial.print("Light intensity: ");
//  Serial.print(lightValue);
//  Serial.println(" Analog (0-1023)");
//
//  Serial.print("Air quality: ");
//  Serial.print(airValue);
//  Serial.println(" Analog (0-1023)");
//};

void process()
{
  while(Device.processQueue() > 0)
  {
    //Serial.print("QueueCount: ");
    //Serial.println(Device.queueCount());
    delay(MIN_TIME_BETWEEN_SEND);
  }
}

//void showTime(uint32_t ts)
//{
//  //Retrieve and display the current date/time
//  //String dateTime = getDateTime();
//  //Serial.println(dateTime);
//}
//
//String getDateTime()
//{
//  String dateTimeStr;
//  
//  //Create a DateTime object from the current time
//  DateTime dt(rtc.makeDateTime(rtc.now().getEpoch()));
//
//  //Convert it to a String
//  dt.addToString(dateTimeStr);
//  
//  return dateTimeStr;  
//}



