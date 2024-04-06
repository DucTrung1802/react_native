import React, { useCallback, useContext, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '../components/BottomSheet';
import { GlobalStyles } from '../constants/styles'
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import PhotoSelectionContainer from "../components/PhotoSelectionContainer"
import {
    useCameraPermissions,
    PermissionStatus,
} from 'expo-image-picker';
import { ImageContext } from "../store/ContextProvider";
import * as Clipboard from 'expo-clipboard';
import { getString } from '../backend/http';

function ImagePickerScreen({ navigation }) {
    const appContext = useContext(ImageContext)

    const imagePlaceholder = require('../assets/image_placeholder.png')
    const ref = useRef(null);

    const [cameraPermissionInformation, requestPermission] =
        useCameraPermissions();

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
        let photo = await Clipboard.getImageAsync({})
        if (photo && photo.data && photo.size.height > 0 && photo.size.width > 0) {
            if (photo.data != appContext.imageInClipboard) {
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

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.imagePreviewContainer}>
                    <TouchableOpacity
                        // onPress={() => { navigation.navigate("PhotoFullScreen") }}
                        onPress={() => { }}
                    >
                        <Image
                            style={styles.imagePreview}
                            source={appContext.mainImage.uri ? { uri: appContext.mainImage.uri } : imagePlaceholder}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={startFromPhotoHandler}
                    >
                        <Text style={styles.buttonText}>+ Choose a photo</Text>
                    </TouchableOpacity>
                </View>
                <BottomSheet ref={ref} >
                    <PhotoSelectionContainer resetScroll={resetScrollHandler} />
                </BottomSheet>
            </View>
        </GestureHandlerRootView >
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
        flex: 1.2,
        alignContent: 'center',
        justifyContent: "center",
        // backgroundColor: 'green'
    },
    imagePreview: {
        height: 350,
        width: 350,
        borderRadius: 10,
    },
    buttonContainer: {
        flex: 1,
        // backgroundColor: 'orange',
        justifyContent: "center",
        alignItems: 'center',
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