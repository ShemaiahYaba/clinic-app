import {  StyleSheet, Text, View, ImageBackground } from 'react-native'
import React, {useState, useEffect} from 'react'
import CreateAccount from '@/app/(Authentication)/CreateAccount';
import Image from '@/constants/Image';


const LoadScreen = () => {

  const[loading,isLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      isLoading(false)
    },4000 )

    return () => clearTimeout(timer);
  }, []);


if(loading){
  return (
    <View style={styles.container}>
      <ImageBackground source={Image.SplashScreen} style={styles.background} resizeMode='cover'/>
    </View>
  )
}

else{
  return(
      <CreateAccount/>
  );
}
}

export default LoadScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
    alignItems: "center",
    width: "100%"
},
  text: {
       fontSize: 30,
       fontWeight: "bold"
   },
   background: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "center"
   },
})