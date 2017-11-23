/*
 * Project GPSTest
 * Description:
 * Author: Michael Harmon (mpharmon@email.arizona.edu)
 * Date: 11/4/2017
 */

//#include "..\lib\Adafruit_GPS\Adafruit_GPS.h"
#include "Adafruit_GPS.h"
//#include "..\lib\Adafruit_VEML6070\Adafruit_VEML6070.h"
#include "Adafruit_VEML6070.h"

#include "application.h"
#include "HttpClient.h"

#define LOGGING 1

HttpClient http;
http_request_t request;
http_response_t response;
http_header_t headers[] = {
    { "Content-type", "application/json" },
    { NULL, NULL } // NOTE: Always terminate headers will NULL
};

Adafruit_GPS gps = Adafruit_GPS(&Serial1);
Adafruit_VEML6070 uv = Adafruit_VEML6070();

const int reportDelay = 60000;
int lastReport = 0;

void runMachine(){
  // Update GPS
  while (Serial1.available()) {
    char c = gps.read();
    if (gps.newNMEAreceived()) {
      gps.parse(gps.lastNMEA());
    }
  }

  //Send Data to WebHook
  if(millis() > lastReport + reportDelay) {
    Serial.printlnf("Met reportIncrement (%s)", (const char*) Time.timeStr());
    if(gps.latitude == 0.0 || gps.longitude == 0.0){
      //Serial.println("GPS DEBUG: No Fix");
    } else {

      String buffer = String::format("{ \"deviceId\" : \"%s\", \"latitude\" : %f, \"longitude\" : %f, \"uv\" : %i }",
        (const char*) System.deviceID(),
        gps.latitudeDegrees,
        gps.longitudeDegrees,
        uv.readUV()
      );

      //Serial.printlnf("WEBHOOK: %s", (const char*) buffer);
      //Particle.publish("publish", (const char*)buffer, PRIVATE);
      request.hostname = "ec2-18-221-222-52.us-east-2.compute.amazonaws.com";
      request.port = 3000;
      request.path = "/samples/publish";
      request.body = buffer;
      http.post(request, response, headers);
      //delay(2000);
      Serial.printlnf("Response Status: %i", response.status);
      if(response.status == 201){
        lastReport = millis();
      }else{
        lastReport += 10000;
      }
    }
  }
}

Timer stateTimer(10, runMachine);// Call runMachine every 10ms

// setup() runs once, when the device is first turned on.
void setup() {
  Serial.begin(9600);

  STARTUP(WiFi.selectAntenna(ANT_EXTERNAL));

  gps.begin(9600);
  gps.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
  delay(500);
  gps.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);
  delay(500);
  gps.sendCommand(PGCMD_NOANTENNA);
  delay(500);

  uv.begin(VEML6070_1_T);

  stateTimer.start();
}

// loop() runs over and over again, as quickly as it can execute.
long lastSync = 0;

void loop() {
  // Time Sync
    if (millis() - lastSync >86400000) {
        Particle.syncTime();
        lastSync = millis();
    }

    delay(3600000);// Delay 1hr
}
