import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet,  Alert,  Image, TouchableOpacity } from 'react-native';
import Dialog from 'react-native-dialog';
import * as Location from 'expo-location';
import axios from 'axios';
//import { Table, Row, Rows } from 'react-native-table-component';

console.disableYellowBox = true;

export default function App() {
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [textLatitude, setTextLatitude] = useState(null);
  const [textLongitude, setTextLongitude] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tableHead, setTableHead] = useState(['Latitude', 'Longitude'])
  const [tableData, setTableData] = useState([]);
  const [polyName, setPolyName] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [manualVisible, setManualVisible] = useState(false);


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

  const deletePolygon = () => {
    setTableData([]);
  }

  return (
    <View style={styles.container}>

      <View style={styles.topContainer}>

        <View style={styles.header}> 
            <Image style={styles.pikud} source={require('./assets/pikud-logo.png')}></Image>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>הזנת פוליגון זיהום</Text>
              <Text style={styles.subtitle}>לשרתי nowforce</Text>
            </View>
            <Image style={styles.gasMask} source={require('./assets/gas-mask.png')}></Image>
        </View>
      
        <View style={styles.body}>
          <Image style={styles.gpsIcon} source={require('./assets/gps-icon.png')}></Image>
          <Text style={styles.title}>האם זיהית זיהום</Text>
          <Text style={styles.title}>בנקודת הציון הנוכחית?</Text>
          <Text style={styles.info}>במידה וזיהית זיהום בנקודת הציון הנוכחית, לחץ על כפתור שמור נקודה כדי להוסיפה לפוליגון.</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => addLocation()}>
            <Text style={styles.buttonText}>שמור נקודת ציון</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>נאספו {tableData.length} נקודות בפוליגון הנוכחי</Text>
          <Text style={styles.testButton} onPress={() => setManualVisible(true)}>הזן נקודת ציון ידנית</Text>
        </View>

      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deletePolygon()}>
            <Text style={styles.buttonText}>מחק פוליגון</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={() => setDialogVisible(true)}>
            <Text style={styles.buttonText}>שלח פוליגון</Text>
        </TouchableOpacity>
      </View>

      <Dialog.Container visible={dialogVisible}>
          <Dialog.Title>בחר שם לפוליגון</Dialog.Title>
          <Dialog.Input style={styles.input} onChangeText={text => setPolyName(text)}></Dialog.Input>
          <Dialog.Button label="ביטול" onPress={() => setDialogVisible(false)} />
          <Dialog.Button label="שלח" onPress={() => {sendPolygon(); setDialogVisible(false)}} disabled={polyName==''} />
      </Dialog.Container>

      <Dialog.Container visible={manualVisible}>
          <Dialog.Title>הזן נקודת ציון</Dialog.Title>
          <Dialog.Input label='קו רוחב' style={styles.input} onChangeText={text => setTextLatitude(text)}></Dialog.Input>
          <Dialog.Input label='קו אורך' style={styles.input} onChangeText={text => setTextLongitude(text)}></Dialog.Input>
          <Dialog.Button label="ביטול" onPress={() => setManualVisible(false)} />
          <Dialog.Button label="שמור" onPress={() => { addLocation(); setManualVisible(false); }} disabled={!textLatitude || !textLongitude} />
      </Dialog.Container>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    backgroundColor: '#2868f8',
    flex: 1,
    alignItems: 'center',
  },

  topContainer: { 
    backgroundColor: '#f5f8ff',
    flex: 7,
    alignItems: 'center',
    borderBottomRightRadius: 40,  
    borderBottomLeftRadius: 40, 
  },

  bottomContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },

  header: {
    backgroundColor: 'white', 
    borderBottomRightRadius: 40,  
    borderBottomLeftRadius: 40, 
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  


  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1d2957'
  },

  subtitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#f67741'
  },

  pikud: {
    width: 70,
    height: 90,
  },

  gasMask: {
    width: 50,
    height: 70
  },

  body: {
    flex: 4,
    alignItems: 'center',
    padding: 20,
  },


  gpsIcon: {
    width: 100,
    height: 120,
  },
  

  info:{
    textAlign: "center",
    fontSize: 18,
    marginTop: 15,
    color: '#1d2957',
  },

  addButton:{
    height: 50,
    width: 180,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2868f8',
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 20,
  },

  buttonText:{
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  
  sendButton:{
    height: 50,
    width: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f67741',
    marginTop: 20,
    borderRadius: 10,
  },

  deleteButton:{
    height: 50,
    width: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    marginTop: 20,
    borderRadius: 10,
  },

  input: {
    borderBottomColor: '#2868f8',
    borderBottomWidth: 2,
  },

  testButton: {
    color: 'lightgrey'
  }
});

const nowforcePolygonFormat = {
  OrganizationPolygonItem : {
      PolygonName : "",
      PolygonColor : "#ff0000",
      IsMain : true,
      CoordinatesFormated : []
  }
}



{/* <View style={styles.addButton}>
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
</View> */}