#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#define ssid "he"         // Ganti dengan SSID WiFi anda
#define password "aaaaaaaa"     // Ganti dengan password WiFi anda
//mlx90614
#include <Adafruit_MLX90614.h>
Adafruit_MLX90614 mlx = Adafruit_MLX90614();

//voice recognition
byte com = 0;

//pulse sensor
#define USE_ARDUINO_INTERRUPTS true
#include <PulseSensorPlayground.h>    
const int PulseWire = 0;        
int Threshold = 550;                                      
PulseSensorPlayground pulseSensor;  

void setup() {
Serial.begin(9600);

//mlx90614
mlx.begin();

//voice recognition
Serial.write(0xAA);
Serial.write(0x37);
delay(1000);
Serial.write(0xAA);
Serial.write(0x21);

//pulse sensor
 pulseSensor.analogInput(PulseWire);         
  pulseSensor.setThreshold(Threshold);   
   if (pulseSensor.begin()) {
    Serial.println("Memulai pembacaan detak jantung");  
  }
}

void loop() {

//voice recognition
while(Serial.available()) {
  com = Serial.read();
  switch(com) {
      case 0x11:   //Hidup
      Serial.println("ON");
      break;

      case 0x12:  //Mati
      Serial.println("OFF");
      break;

      case 0x13:  //Batuk Kering
      digitalWrite(led2, HIGH);
      Serial.println("Dry Cough");
      break;

      case 0x14:  //Suara asal(tidak digunakan)
      break;

      case 0x15:  //Suara asal(tidak digunakan)
      break;
            }
      }
//pulse sensor
 int myBPM = pulseSensor.getBeatsPerMinute();  
 if (pulseSensor.sawStartOfBeat()) {            
}

//string
int Suhu_Tubuh = mlx.readObjectTempC();
int Suara_Batuk = Serial.read();
//Server 
  HTTPClient http;  //Declare an object of class HTTPClient
  String uri = "http://xco19.herokuapp.com/sensor/?temp=" + String(Suhu_Tubuh) + "&ht=" + String(myBPM) + "&cough=" + String(Suara_Batuk) + "&id=z46Z1CRciEAV2HBEULna";
  http.begin(uri);
  Serial.println(uri);
  int httpCode = http.GET();                                                                  //Send the request
  if (httpCode > 0) { 
    String payload = http.getString();   //Get the request response payload
      Serial.println(payload);                     //Print the response payload
  } 
  http.end();   //Close connection    //Send a request every 30 seconds
  // baca setiap 3 detik
  delay(3000);
}
int convertToPercent(int value)
{
  int percentValue = 0;
  percentValue = map(value, 1023, 465, 0, 100);
  return percentValue;
}
