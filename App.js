import 'react-native-gesture-handler';
import React,{useState,useEffect,useRef} from 'react';
import { SafeAreaView, StyleSheet, Text, View,TouchableOpacity,Platform, Modal,Image,NativeModules } from 'react-native';
import { Camera } from 'expo-camera';
import {FontAwesome} from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import PixelColor from './GetColor';

export function getPixelRGBA(imageName, x, y) {
  return new Promise((resolve, reject) => {
      NativeModules.RNPixelColor.get(imageName, x, y, (err, color) => {        
        if (err) {
          return reject(err);
        }
        resolve(color);
      });
  });
}



export default function App() {

  const camRef = useRef(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [hasPermission,setHaspermission] = useState(null);
  const [capturedPhoto,setcapturedPhoto] = useState(null);
  const[open,setOpen] = useState(false);

  useEffect(()=>{
     (async() =>{
       const {status} = await Camera.requestPermissionsAsync();
       setHaspermission(status == 'granted');
     })();

     (async() =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      setHaspermission(status == 'granted');
    })();

  },[]);

  if(hasPermission === null){
    return <View/>
  }

  if(hasPermission === false){
    return <Text>Acesso Negado!</Text>
  }

  async function takePicture(){
     if(camRef){
       const data = await camRef.current.takePictureAsync();
      
       setcapturedPhoto(data.uri);
       setOpen(true);
        
     
       console.log(data);
     }
  }

  async function savePicture(){
    const base64 = await FileSystem.readAsStringAsync(capturedPhoto, { encoding: 'base64' });
    let x =1;
    let y =1;
    PixelColor.getHex(capturedPhoto, {x: x, y: y}).then((color) => {
      // #000000
    }).catch((err) => {console.log(err)});
  }

  return (
    <SafeAreaView style={styles.container}>
       <Camera
          style={{ flex: 1 }}
          type={type}
          ref={camRef}
       >
         <View  style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            }}>
            
             <TouchableOpacity 
             style={{
              alignSelf: 'flex-end',
               button:20,
               left:20,
               }}
               onPress={() => {
                setType(
                  type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
                );

               }}
             >
            <Text style={{fontSize:30, marginBottom:13,color:'#fff'}}>Trocar</Text>
             </TouchableOpacity>
            
            </View>  
       </Camera>

       <TouchableOpacity style={styles.botao} onPress={takePicture} >
         <FontAwesome name='camera' size={23}  color='#fff' />

       </TouchableOpacity>

       {capturedPhoto &&
         <Modal
           animationType='slide'
           transparent ={false}
           visible={open}
         >

          <View style={{flex:1,justifyContent:'center',alignItems:'center', margin:20}}>
              
             <View style={{margin:10, flexDirection:'row'}}>

             <TouchableOpacity style={{margin:10}} onPress={()=>{setOpen(false)}}>
                  <FontAwesome name='window-close' size={50} color='#ff0000'/>
              </TouchableOpacity>


              <TouchableOpacity style={{margin:10}} onPress={savePicture}>
                  <FontAwesome name='upload' size={50} color='#121212'/>
              </TouchableOpacity>


             </View>

              <Image
               style={{width:'100%', height: 300, borderRadius:20}}
               source={{uri:capturedPhoto}}
              />

          </View>

         </Modal>
       }

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    justifyContent: 'center',
  },
  botao:{
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor:'#121212',
    margin:20,
    borderRadius:10,
    height:50,
  }
});

