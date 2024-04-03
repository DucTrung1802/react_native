import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetRefProps } from './components/BottomSheet';
import { GlobalStyles } from './constants/styles'

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 1000);

export default function App() {
  const ref = useRef(null);

  const startFromPhotoHandler = useCallback(() => {
    const isActive = ref?.current?.isActive();
    if (isActive) {
      ref?.current?.scrollTo(0);
    } else {
      ref?.current?.scrollTo(-400);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.imagePreviewContainer}>

        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={startFromPhotoHandler}>
            <Text style={styles.buttonText}>+ Start from Photo</Text>
          </TouchableOpacity>
        </View>

        <BottomSheet ref={ref}>
          <View style={{ flex: 1, backgroundColor: GlobalStyles.colors.primary100 }} />
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.primary400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewContainer: {
    flex: 4
  },
  buttonContainer: {
    flex: 1
  },
  button: {
    justifyContent: "center",
    alignItems: 'center',
    height: 50,
    borderRadius: 10,
    aspectRatio: 6,
    backgroundColor: GlobalStyles.colors.primary800,
    opacity: 1,
  },
  buttonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 18,
  }
});
