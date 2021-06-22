import React, { useState, useEffect } from 'react';
import { Text, View, Button, Alert  } from 'react-native';
import * as Location from 'expo-location';
import Device from '../src/device';

const deviceSvc = new Device();

export default function Main() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [tracker, setTracker] = useState("");
    const [device, setDevice] = useState("");

    useEffect(() => {
        
        (async () => {

          deviceSvc.init()
          .then((resp)=> {
              if(resp !== null){
                  setTracker(resp.trackerName);
                  setDevice(resp.name);
              }
          })
  
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
          } else {

          let isLocationServicesEnabled = await Location.hasServicesEnabledAsync();
          let locationPRoviderStatus = await Location.getProviderStatusAsync();
          console.log(`loc enabled: ${isLocationServicesEnabled}`);
          console.log(`loc status: ${JSON.stringify(locationPRoviderStatus)}`);
          if(isLocationServicesEnabled){
            let loc = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
            await Location.watchPositionAsync({
                enableHighAccuracy: true,
                distanceInterval: 1,
                timeInterval: 30000}, newLoc => {
                  console.log(`new loc: ${newLoc}`);
                  setLocation(newLoc);
                  deviceSvc.setLocation(newLoc.coords.latitude, newLoc.coords.longitude);
                });
            console.log(`loc: ${JSON.stringify(loc)}`);
            setLocation(loc);
            if(loc.coords !== null){
              deviceSvc.setLocation(loc.coords.latitude, loc.coords.longitude);
            }
            }
          }
  
        })();
        
    }, []);

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = "";//JSON.stringify(location);
   }

    return (
        <View>
            <Text>Device: {device}</Text>
            <Text>Tracker: {tracker}</Text>
            <Text>Lat: {location?.coords?.latitude}</Text>
            <Text>Lon: {location?.coords?.longitude}</Text>
            <Text>{text}</Text>
      </View>
    );
}