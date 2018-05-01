#include <ArduinoHttpClient.h>
#include <WiFi101.h>
#include <Wire.h>
#include <I2CSoilMoistureSensor.h>
#include <DHT.h>


#define DHTPIN 6
#define DHTTYPE DHT22

//DHT air temperature and humidity sensor
DHT dht(DHTPIN, DHTTYPE);

//light sensor pin
int sensorPin = A0;
float rawRange = 1024; // 3.3v
float logRange = 5.0; // 3.3v = 10^5 lux

//Soil Moisture Sensor
I2CSoilMoistureSensor soilMoistureSensor(0x20);

float soilTemperature;
int soilMoisture;

int lightValue;

float airTemperature;
float airHumidity;

//WiFi data ---- CHANGE TO YOUR OWN Wi-Fi settings
const char* MY_SSID = "";
const char* MY_PWD =  "";

//server data
const char* SERVER_ADDRESS = "webhook.site";
const int port = 80;

//http client
WiFiClient wifi;
HttpClient client = HttpClient(wifi, SERVER_ADDRESS, port);
int status = WL_IDLE_STATUS;
String response;
int statusCode = 0;

void setup() {
  Wire.begin();
  Serial.begin(9600);

  // check for the presence of the shield:
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue:
    while (true);
  }

  // attempt to connect to Wifi network:
  while (status != WL_CONNECTED)
  {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(MY_SSID);

    //Connect to WPA/WPA2 network:
    status = WiFi.begin(MY_SSID, MY_PWD);

    // wait 10 seconds for connection:
    delay(10000);
  }

  Serial.println("Connected to wifi");
  printWifiStatus();

  //SoulMoistureSensor setup
  soilMoistureSensor.begin(); // reset sensor
  delay(1000); // give some time to boot up
  Serial.print("I2C Soil Moisture Sensor Address: ");
  Serial.println(soilMoistureSensor.getAddress(), HEX);
  Serial.print("Sensor Firmware version: ");
  Serial.println(soilMoistureSensor.getVersion(), HEX);
  Serial.println();


  //DHT22 Air temperature & Humidity sensor setup
  dht.begin();

  //GA1A12S202 Light Sensor setup
  analogReference(AR_EXTERNAL);
}

void loop() {

  ///////////////////////////////////////////////
  //get all the data from the  moisture sensor
  ///////////////////////////////////////////////
  while (soilMoistureSensor.isBusy()) delay(50); // available since FW 2.3
  soilMoisture = soilMoistureSensor.getCapacitance();
  soilTemperature = soilMoistureSensor.getTemperature() / (float)10;
  soilMoistureSensor.sleep(); // available since FW 2.3


  ///////////////////////////////////
  //get the data from the dht sensor
  ///////////////////////////////////

  airHumidity = dht.readHumidity();
  airTemperature = dht.readTemperature();

  if (isnan(airHumidity) || isnan(airTemperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  ///////////////////////////////////
  //get the data from the light sensor
  ///////////////////////////////////
  int rawValue = analogRead(sensorPin);
  lightValue = RawToLux(rawValue);

  //send captured data to server
  sendDataToServer();
  delay(5000);
}

void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}



void sendDataToServer() {
  Serial.println("\nSending Data to Server...");

  String contentType = "application/json";
  String postData = "{\"soilTemperature\":" + (String)soilTemperature + "," +
                    "\"soilMoisture\":" + (String)soilMoisture + "," +
                    "\"lightValue\":" + (String)lightValue + "," +
                    "\"airTemperature\":" + (String)airTemperature + "," +
                    "\"airHumidity\":" + (String)airHumidity + "}";
  Serial.println(postData + "\n");

  client.post("/cb13e263-66d1-4cf8-95c4-542ad5c7804d", contentType, postData);
  // read the status code and body of the response
  statusCode = client.responseStatusCode();
  response = client.responseBody();

  Serial.print("Status code: ");
  Serial.println(statusCode);
  Serial.print("Response: ");
  Serial.println(response);
}

float RawToLux(int raw) {
  float logLux = raw * logRange / rawRange;
  return pow(10, logLux);
}


