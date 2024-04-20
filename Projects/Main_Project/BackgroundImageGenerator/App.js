import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GlobalStyles } from './constants/allConstants';

import PhotoPickerScreen from './screens/PhotoPickerScreen';
import PhotoFullScreen from './screens/PhotoFullScreen';
import ContextProvider from './store/ContextProvider';

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 1000);

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <>
            <StatusBar style="light" />
            <ContextProvider>
                <NavigationContainer>
                    <Stack.Navigator
                        screenOptions={{
                            headerTintColor: GlobalStyles.colors.primary0,
                            headerStyle: { backgroundColor: GlobalStyles.colors.primary800 },
                        }}
                    >
                        <Stack.Screen
                            name="PhotoPickerScreen"
                            component={PhotoPickerScreen}
                            options={{
                                headerShown: true,
                                title: "Photo Picker Screen",
                            }} />
                        <Stack.Screen
                            name="PhotoFullScreen"
                            component={PhotoFullScreen}
                            options={{
                                headerShown: false,
                            }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </ContextProvider>
        </>
    );
}

const styles = StyleSheet.create({
});
