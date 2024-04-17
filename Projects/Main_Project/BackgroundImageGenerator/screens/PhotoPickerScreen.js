import React, { useCallback, useContext, useRef, useEffect, useState } from 'react';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import BottomSheet from '../components/BottomSheet';
import { GlobalStyles } from '../constants/styles'
import {
    AppState, StyleSheet, Text, View,
    Image, Alert, ScrollView,
    TouchableWithoutFeedback, Keyboard,
    Dimensions
} from 'react-native';
import PhotoSelectionContainer from "../components/PhotoSelectionContainer"
import { useCameraPermissions } from 'expo-image-picker';
import { ImageContext } from "../store/ContextProvider";
import * as Clipboard from 'expo-clipboard';
import CustomButton from "../components/CustomButton";
import OverlayView from '../components/OverlayView';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { postImageToServer } from "../backend/http"

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function PhotoPickerScreen({ navigation }) {
    const appContext = useContext(ImageContext)
    const [isGenerating, setIsGenerating] = useState(false)

    const imagePlaceholder = require('../assets/image_placeholder.png')
    const ref = useRef(null);

    const [cameraPermission, requestCameraPermission] =
        useCameraPermissions();

    const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions()

    const [inputPrompt, setInputPrompt] = useState("");

    const [isKeyboardActive, setIsKeyboardActive] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setIsKeyboardActive(true);
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setIsKeyboardActive(false);
            }
        );

        // Clean up listeners
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    function onChangeTextHandler(value) {
        value = value.replace("\n", "")
        setInputPrompt(value)
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
        // console.log("App is in the foreground");
        // console.log("");
    };

    const handleAppBackground = () => {
        // Add your code to execute when the app is in the background
        // console.log("App is in the background");
        // console.log("");
    };

    async function verifyCameraPermissions() {
        const responsePermission = await requestCameraPermission();

        if (!responsePermission.granted) {
            Alert.alert(
                'Insufficient Permissions!',
                'You need to grant camera permissions to use this app.'
            );
            return false;
        }

        return true;
    }

    async function verifyMediaLibraryPermissions() {
        const responsePermission = await requestMediaLibraryPermission();

        if (!responsePermission.granted) {
            Alert.alert(
                'Insufficient Permissions!',
                'You need to grant media library permissions to use this app.'
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

    async function chooseAPhotoHandler() {
        console.log('Vertical dimension of the screen:', SCREEN_HEIGHT);
        const hasPermission = await verifyCameraPermissions();

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

    function setIsGeneratingHandler(value) {
        setIsGenerating(value)
    }

    async function generateButtonHandler() {
        var response;
        setIsGeneratingHandler(true);
        while (!response) {
            response = await postImageToServer(appContext.mainImage, inputPrompt);
        }
        setIsGeneratingHandler(false);

        // Post-process response
        // console.log(response)

        if (response && response.data && response.data["0"]) {
            var newPhoto = {
                uri: `data:image/png;base64,${response.data["0"]}`,
                canBeSave: true,
            }

            appContext.setMainImage(newPhoto)
        }
    }

    async function saveImageHandler() {
        const hasPermission = await verifyMediaLibraryPermissions();

        if (!hasPermission) {
            return;
        }

        try {
            const base64ImageData = appContext.mainImage.uri.split(",")[1];

            const fileUri = FileSystem.documentDirectory + 'image.png';

            await FileSystem.writeAsStringAsync(fileUri, base64ImageData, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Once the file is saved, you can save it to the media library
            await MediaLibrary.createAssetAsync(fileUri);

            Alert.alert(
                'Successfully!',
                'The image has been saved in your gallery.'
            )

        } catch (error) {
            console.error('Error saving image:', error);
        }
    }

    return (
        <>
            <TouchableWithoutFeedback onPress={handlePressOutside}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <View style={styles.container}>
                        <View style={{ ...styles.imagePreviewContainer }}>
                            <TouchableWithoutFeedback
                                onPress={handlePressOutside}
                            >
                                <Image
                                    style={styles.imagePreview}
                                    source={appContext.mainImage.uri ? { uri: appContext.mainImage.uri } : imagePlaceholder}
                                />
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={{ ...styles.interactContainer }}>
                            {appContext.mainImage.uri && <View style={styles.titleContainer}>
                                <Text style={styles.title}>Prompt</Text>
                            </View>}
                            <ScrollView>
                                {appContext.mainImage.uri && <View style={styles.textInputContainer}>
                                    <TextInput
                                        editable
                                        multiline
                                        textAlignVertical='top'
                                        numberOfLines={4}
                                        maxLength={150}
                                        placeholder="Enter your prompt here..."
                                        value={inputPrompt}
                                        placeholderTextColor="#b3b3b3"
                                        onChangeText={text => onChangeTextHandler(text)}
                                        style={styles.textInput}
                                        keyboardType="default"
                                    />
                                </View>}
                                {appContext.mainImage.uri && <CustomButton
                                    text={"Generate Background"}
                                    onPress={generateButtonHandler}
                                    buttonStyle={{ ...styles.generateButton, opacity: inputPrompt.length ? 1 : 0.4 }}
                                    buttonTextStyle={styles.buttonText}
                                    disabled={!inputPrompt.length}
                                />}
                                {appContext.mainImage.canBeSave && <CustomButton
                                    // {/* {<CustomButton */}
                                    text={"Save Image"}
                                    onPress={saveImageHandler}
                                    buttonStyle={{ ...styles.saveImageButton, opacity: appContext.mainImage.canBeSave ? 1 : 0.4 }}
                                    buttonTextStyle={styles.buttonText}
                                    disabled={!appContext.mainImage.canBeSave}
                                />}
                                <CustomButton
                                    text={"+ Choose a Photo"}
                                    onPress={chooseAPhotoHandler}
                                    buttonStyle={{ ...styles.chooseButton, marginTop: appContext.mainImage.uri ? 10 : 200 }}
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
            {isGenerating && <OverlayView onPress={() => { setIsGeneratingHandler(false) }} />}
        </>
    )
}

export default PhotoPickerScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalStyles.colors.primary400,
        alignItems: 'center',
        justifyContent: 'top',
    },
    imagePreviewContainer: {
        marginTop: 10,
        height: 310,
        width: 310,
        // backgroundColor: 'green'F
    },
    imagePreview: {
        height: 300,
        width: 300,
        borderRadius: 10,
        top: 5,
        left: 5,
    },
    titleContainer: {
        // backgroundColor: "red",
        width: "90%",
        left: "5%",
        marginVertical: 5
    },
    title: {
        color: "white",
        fontWeight: "bold",
        fontSize: 20,
    },
    interactContainer: {
        // backgroundColor: 'orange',
        width: "100%",
        justifyContent: 'top',
    },
    textInputContainer: {
        marginHorizontal: "5%",
        backgroundColor: GlobalStyles.colors.primary800,
        marginVertical: 5,
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
        height: 40,
        borderRadius: 10,
        backgroundColor: GlobalStyles.colors.primary800,
        opacity: 1,
    },
    generateButton: {
        marginHorizontal: "10%",
        justifyContent: "center",
        alignItems: 'center',
        height: 40,
        borderRadius: 10,
        backgroundColor: GlobalStyles.colors.red500,
        marginVertical: 10
    },
    saveImageButton: {
        marginHorizontal: "10%",
        justifyContent: "center",
        alignItems: 'center',
        height: 40,
        borderRadius: 10,
        backgroundColor: GlobalStyles.colors.accent500,
        marginVertical: 10
    },
    buttonText: {
        color: "white",
        fontWeight: 'bold',
        fontSize: 18,
    }
});