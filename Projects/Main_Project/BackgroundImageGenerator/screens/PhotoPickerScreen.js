import React, { useCallback, useContext, useRef, useEffect, useState } from 'react';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import BottomSheet from '../components/BottomSheet';
import { GlobalStyles } from '../constants/styles'
import {
    StyleSheet, Text, View,
    Image, Alert, TouchableWithoutFeedback,
    Keyboard, Dimensions, ScrollView
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
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE_ACTIVATED_KEYBOARD = SCREEN_WIDTH - 150
const IMAGE_SIZE_DEACTIVATED_KEYBOARD = SCREEN_WIDTH - 40

function PhotoPickerScreen({ navigation }) {
    const appContext = useContext(ImageContext)
    const [isGenerating, setIsGenerating] = useState(false)

    const imagePlaceholder = require('../assets/image_placeholder.png')
    const ref = useRef(null);

    const [cameraPermission, requestCameraPermission] =
        useCameraPermissions();

    const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions()

    const [inputPrompt, setInputPrompt] = useState("");

    const [inputNegativePrompt, setInputNegativePrompt] = useState("")

    const [isKeyboardActive, setIsKeyboardActive] = useState(false);

    const [networkState, setNetworkState] = useState(null);

    useEffect(() => {
        // Get the network state once
        NetInfo.fetch().then(state => {
            setNetworkState(state);
        });

        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            setNetworkState(state);
        });

        // Unsubscribe from network state updates
        return () => {
            unsubscribe();
        };
    }, []);

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

    function onChangeInputPromptTextHandler(value) {
        value = value.replace("\n", "")
        setInputPrompt(value)
    }

    function onChangeInputNegativePromptTextHandler(value) {
        value = value.replace("\n", "")
        setInputNegativePrompt(value)
    }

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
        // console.log('Vertical dimension of the screen:', SCREEN_HEIGHT);
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

    function cancelButtonHandler(value) {
        setIsGenerating(value)
        if (appContext.cancelToken) {
            appContext.cancelToken.cancel('Request canceled by user')
        }
    }

    async function generateButtonHandler() {
        if (!(networkState && networkState.isConnected && networkState.isInternetReachable)) {
            Alert.alert(
                'Cannot connect to the Internet!',
                'Please connect to the Internet to generate images.'
            )
            return
        }

        var response;

        const source = axios.CancelToken.source();
        await appContext.setCancelToken(source)

        setIsGenerating(true);
        while (!response) {
            response = await postImageToServer(appContext.mainImage, inputPrompt, inputNegativePrompt, source);
        }
        setIsGenerating(false);

        // Post-process response
        // console.log(response)

        if (!response.cancel && response.data && response.data["0"]) {

            const filePath = `${FileSystem.documentDirectory}output_image_${String(Date.now())}.png`;
            await FileSystem.writeAsStringAsync(filePath, response.data["0"], { encoding: "base64" }) // Write binary data to file
                .then(() => {
                    console.log('Image saved successfully.');
                })
                .catch(error => {
                    console.error('Error saving image:', error);
                });

            var newPhoto = {
                uri: filePath,
                isGenerated: true,
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
            await MediaLibrary.createAssetAsync(appContext.mainImage.uri);

            Alert.alert(
                'Successfully!',
                'The image has been saved in your gallery.'
            )

        } catch (error) {
            console.error('Error saving image:', error);
        }
    }

    return (
        <View style={styles.outerContainer}>
            <GestureHandlerRootView style={{ flex: 1 }} >
                <View style={styles.container}>
                    <TouchableWithoutFeedback
                        onPress={handlePressOutside}
                    >
                        <View style={{
                            ...styles.imagePreviewContainer,
                            height: isKeyboardActive ? IMAGE_SIZE_ACTIVATED_KEYBOARD : IMAGE_SIZE_DEACTIVATED_KEYBOARD
                        }}>
                            <Image
                                style={{
                                    ...styles.imagePreview,
                                    width: isKeyboardActive ? IMAGE_SIZE_ACTIVATED_KEYBOARD : IMAGE_SIZE_DEACTIVATED_KEYBOARD,
                                    height: isKeyboardActive ? IMAGE_SIZE_ACTIVATED_KEYBOARD : IMAGE_SIZE_DEACTIVATED_KEYBOARD
                                }}
                                source={
                                    appContext.mainImage.uri ? { uri: appContext.mainImage.uri } : imagePlaceholder
                                }
                            />
                        </View>
                    </TouchableWithoutFeedback>
                    <ScrollView style={{ ...styles.interactContainer }}>
                        <View style={{ height: 10 }}>
                        </View>
                        {appContext.mainImage.uri && <View style={styles.titleContainer}>
                            <Text style={styles.title}>Prompt</Text>
                        </View>}
                        {appContext.mainImage.uri && <View style={styles.textInputContainer}>
                            <TextInput
                                editable
                                multiline
                                textAlignVertical='top'
                                numberOfLines={4}
                                maxLength={350}
                                placeholder="Describe your background image here..."
                                value={inputPrompt}
                                placeholderTextColor="#b3b3b3"
                                onChangeText={text => onChangeInputPromptTextHandler(text)}
                                style={styles.textInput}
                                keyboardType="default"
                            />
                        </View>}
                        {appContext.mainImage.uri && <View style={styles.titleContainer}>
                            <Text style={styles.title}>Negative Prompt</Text>
                        </View>}
                        {appContext.mainImage.uri && <View style={styles.textInputContainer}>
                            <TextInput
                                editable
                                multiline
                                textAlignVertical='top'
                                numberOfLines={3}
                                maxLength={350}
                                placeholder="List what you don't want in your image..."
                                value={inputNegativePrompt}
                                placeholderTextColor="#b3b3b3"
                                onChangeText={text => onChangeInputNegativePromptTextHandler(text)}
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
                        {appContext.mainImage.isGenerated && <CustomButton
                            text={"Save Image"}
                            onPress={saveImageHandler}
                            buttonStyle={{ ...styles.saveImageButton, opacity: appContext.mainImage.isGenerated ? 1 : 0.4 }}
                            buttonTextStyle={styles.buttonText}
                            disabled={!appContext.mainImage.isGenerated}
                        />}
                        <CustomButton
                            text={"+ Choose a Photo"}
                            onPress={chooseAPhotoHandler}
                            buttonStyle={{ ...styles.chooseButton, marginTop: appContext.mainImage.uri ? 10 : 200 }}
                            buttonTextStyle={styles.buttonText}
                        />
                        <View style={{ height: 50 }}>
                        </View>
                    </ScrollView>
                    <BottomSheet ref={ref} >
                        <PhotoSelectionContainer resetScroll={resetScrollHandler} />
                    </BottomSheet>
                </View >
            </GestureHandlerRootView >
            {isGenerating && networkState && <OverlayView onPress={() => { cancelButtonHandler(false) }} />}
        </View >
    )
}

export default PhotoPickerScreen;

const styles = StyleSheet.create({
    outerContainer: {
        height: '100%',
    },
    container: {
        height: '100%',
        backgroundColor: GlobalStyles.colors.primary400,
        alignItems: 'center',
        justifyContent: 'top',
    },
    imagePreviewContainer: {
        marginTop: 10,
        height: 300,
        width: "100%",
        // backgroundColor: 'green',
        alignItems: "center",
        justifyContent: 'center',
    },
    imagePreview: {
        height: 300,
        width: 300,
        borderRadius: 10,
        borderColor: "white",
        borderWidth: 3,
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
        // justifyContent: 'top',
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