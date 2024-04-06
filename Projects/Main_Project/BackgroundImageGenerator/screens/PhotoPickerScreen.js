import React, { useCallback, useContext, useRef, useEffect, useState } from 'react';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import BottomSheet from '../components/BottomSheet';
import { GlobalStyles } from '../constants/styles'
import {
    AppState, StyleSheet, Text, View,
    TouchableOpacity, Image, Alert, ScrollView,
    TouchableWithoutFeedback, Keyboard
} from 'react-native';
import PhotoSelectionContainer from "../components/PhotoSelectionContainer"
import {
    useCameraPermissions,
    PermissionStatus,
} from 'expo-image-picker';
import { ImageContext } from "../store/ContextProvider";
import * as Clipboard from 'expo-clipboard';
import CustomButton from "../components/CustomButton";

function ImagePickerScreen({ navigation }) {
    const appContext = useContext(ImageContext)

    const imagePlaceholder = require('../assets/image_placeholder.png')
    const ref = useRef(null);

    const [cameraPermissionInformation, requestPermission] =
        useCameraPermissions();

    const [text, setChangeText] = useState("");

    useEffect(() => {
        // Add event listener when component mounts
        AppState.addEventListener("change", handleAppStateChange);

        // Remove event listener when component unmounts
        return () => {
            // AppState.removeEventListener("change", handleAppStateChange);
        };
    }, []);

    function onChangeTextHandler(value) {
        value.replace("\n", "")
        setChangeText(value)
    }

    const handleAppStateChange = async (nextAppState) => {
        if (nextAppState === 'active') {
            // App has come to the foreground
            // Call your function here
            handleAppForeground()
            await checkClipboard()
        } else if (nextAppState === 'background') {
            // App has gone to the background
            // Call your function here
            handleAppBackground();
        }
    };

    const handleAppForeground = () => {
        // Add your code to execute when the app is in the foreground
        console.log("App is in the foreground");
    };

    const handleAppBackground = () => {
        // Add your code to execute when the app is in the background
        console.log("App is in the background");
    };

    async function verifyPermissions() {
        if (cameraPermissionInformation.status === PermissionStatus.UNDETERMINED) {
            const permissionResponse = await requestPermission();

            return permissionResponse.granted;
        }

        if (cameraPermissionInformation.status === PermissionStatus.DENIED) {
            Alert.alert(
                'Insufficient Permissions!',
                'You need to grant camera permissions to use this app.'
            );
            return false;
        }

        return true;
    }

    async function checkClipboard() {
        let photo = null
        try {
            photo = await Clipboard.getImageAsync({})
        }
        catch (err) { }
        if (photo && photo.data && photo.size.height > 0 && photo.size.width > 0) {
            if (!appContext.imageList.some(item => item.uri === photo.data)) {
                appContext.setImageInClipboard(photo.data)
                appContext.setDisableClipboardButton(false)
            }
        }
    }

    async function startFromPhotoHandler() {
        const hasPermission = await verifyPermissions();

        if (!hasPermission) {
            return;
        }

        await checkClipboard()

        const isActive = ref?.current?.isActive();
        if (isActive) {
            ref?.current?.scrollTo(0);
        } else {
            ref?.current?.scrollTo(-400);
        }
    }
    const resetScrollHandler = useCallback(() => {
        const isActive = ref?.current?.isActive();
        if (isActive) {
            ref?.current?.scrollTo(0);
        }
    })

    const handlePressOutside = () => {
        Keyboard.dismiss(); // Dismiss the keyboard
    };

    function generateButtonHandler() {
        console.log(text)
    }

    return (
        <TouchableWithoutFeedback onPress={handlePressOutside}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={{ ...styles.imagePreviewContainer, flex: appContext.mainImage.uri ? 2.2 : 6 }}>
                        <TouchableWithoutFeedback onPress={handlePressOutside}>
                            <Image
                                style={styles.imagePreview}
                                source={appContext.mainImage.uri ? { uri: appContext.mainImage.uri } : imagePlaceholder}
                            />
                        </TouchableWithoutFeedback>
                    </View>
                    {appContext.mainImage.uri && <View style={styles.titleContainer}>
                        <Text style={styles.title}>Prompt</Text>
                    </View>}
                    <View style={styles.interactContainer}>
                        <ScrollView>
                            {appContext.mainImage.uri && <View style={styles.textInputContainer}>
                                <TextInput
                                    editable
                                    multiline
                                    textAlignVertical='top'
                                    numberOfLines={4}
                                    maxLength={150}
                                    placeholder="Enter your prompt here..."
                                    value={text}
                                    placeholderTextColor="#b3b3b3"
                                    onChangeText={text => onChangeTextHandler(text)}
                                    style={styles.textInput}
                                    keyboardType="default"
                                />
                            </View>}
                            {appContext.mainImage.uri && <CustomButton
                                text={"Generate Background"}
                                onPress={generateButtonHandler}
                                buttonStyle={styles.generateButton}
                                buttonTextStyle={styles.buttonText}
                            />}
                            <CustomButton
                                text={"+ Choose a Photo"}
                                onPress={startFromPhotoHandler}
                                buttonStyle={styles.chooseButton}
                                buttonTextStyle={styles.buttonText}
                            />
                        </ScrollView>
                    </View>
                    <BottomSheet ref={ref} >
                        <PhotoSelectionContainer resetScroll={resetScrollHandler} />
                    </BottomSheet>
                </View >
            </GestureHandlerRootView >
        </TouchableWithoutFeedback>
    )
}

export default ImagePickerScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalStyles.colors.primary400,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePreviewContainer: {
        flex: 2.2,
        alignContent: 'center',
        justifyContent: "top",
        padding: 15,
        // backgroundColor: 'green'
    },
    imagePreview: {
        height: 350,
        width: 350,
        borderRadius: 10,
    },
    titleContainer: {
        // backgroundColor: "red",
        width: "90%"
    },
    title: {
        color: "white",
        fontWeight: "bold",
        fontSize: 20
    },
    interactContainer: {
        flex: 2,
        // backgroundColor: 'orange',
        width: "100%",
        justifyContent: 'center'
    },
    textInputContainer: {
        marginHorizontal: "5%",
        backgroundColor: GlobalStyles.colors.primary800,
        marginVertical: 10,
        borderRadius: 10,
        // backgroundColor: "red"
    },
    textInput: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        color: "white",
        fontWeight: "bold",
        fontSize: 17,
    },
    chooseButton: {
        marginHorizontal: "10%",
        justifyContent: "center",
        alignItems: 'center',
        height: 50,
        borderRadius: 10,
        backgroundColor: GlobalStyles.colors.primary800,
        opacity: 1,
        marginVertical: 10
    },
    generateButton: {
        marginHorizontal: "10%",
        justifyContent: "center",
        alignItems: 'center',
        height: 50,
        borderRadius: 10,
        backgroundColor: GlobalStyles.colors.error500,
        opacity: 1,
        marginVertical: 10
    },
    buttonText: {
        color: "white",
        fontWeight: 'bold',
        fontSize: 18,
    }
});