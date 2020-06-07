import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { Table, Row, Rows } from 'react-native-table-component';
import axios from 'axios';

export default function App() {
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [textLatitude, setTextLatitude] = useState(null);
  const [textLongitude, setTextLongitude] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tableHead, setTableHead] = useState(['Latitude', 'Longitude'])
  const [tableData, setTableData] = useState([]);
  const [polyName, setPolyName] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }

      let location = await Location.getCurrentPositionAsync({});
      if(!textLatitude) setLatitude(location.coords.latitude);
      if(!textLongitude) setLongitude(location.coords.longitude);
    })();
  });

  const addLocation = () => {
    if(textLatitude && textLongitude) 
      setTableData(tableData.concat([[parseFloat(textLatitude), parseFloat(textLongitude)]]));
    else setTableData(tableData.concat([[latitude, longitude]]))
  }

  const sendPolygon = () => {
    let polygon = {...nowforcePolygonFormat};
    polygon.OrganizationPolygonItem.PolygonName = polyName;
    tableData.forEach(location => {
      let coords = {
        Lat: location[0],
        Long: location[1],
      }
      polygon.OrganizationPolygonItem.CoordinatesFormated.push(coords);
    })
    polygon.OrganizationPolygonItem.CoordinatesFormated.push(polygon.OrganizationPolygonItem.CoordinatesFormated[0]);
    axios({
      method: 'post',
      url: 'http://lb.nowforce.com/api/en-us/Polygon/Upsert/json/2584/2584',
      headers: {
          SnapAuthorization: 'Basic MTIzNDYzMDgyNw==Xw==HG5rNJXiEuvFDYhPF2fWOQ=='
      },
      data: polygon
  }).then(response => Alert.alert(`${response.data.OrganizationPolygonItem.PolygonName} added`))
  .catch(error => Alert.alert('Error, try again'));    
  }

  return (
    <View style={styles.container}>

      <View style={styles.addButton}>
        <TextInput placeholder={`Current latitude: ${latitude}`}
          onChangeText={text => setTextLatitude(text)}>
        </TextInput>
        <TextInput placeholder={`Current longitude: ${longitude}`}
          onChangeText={text => setTextLongitude(text)}>
        </TextInput>
        <Button
          title="Add Location"
          onPress={() => addLocation()}
        />
      </View>

      <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
        <Row data={tableHead} style={styles.head} textStyle={styles.text}/>
        <Rows data={tableData} textStyle={styles.text}/>
      </Table>

      <View style={styles.sendButton}> 
        <TextInput 
          onChangeText={text => setPolyName(text)} 
          placeholder={'Set polygon name'} style = {styles.input}>
        </TextInput>
        <Button
          title="send polygon"
          onPress={() => sendPolygon()}
          color='red'
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 70, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#f1f8ff' },
  text: { margin: 6 },
  addButton : {},
  sendButton: { position: "absolute", bottom: 30, left: '5%', width: '100%', flex:1,  }
});

const nowforcePolygonFormat = {
  OrganizationPolygonItem : {
      PolygonName : "",
      PolygonColor : "#ff1000",
      IsMain : true,
      CoordinatesFormated : []
  }
}