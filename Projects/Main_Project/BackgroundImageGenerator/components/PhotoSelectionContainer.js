import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Alert } from "react-native";
import { GlobalStyles } from "../constants/styles";
import CustomButton from "./CustomButton";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { ImageContext } from "../store/ContextProvider"
import FlatListImage from './FlatListImage';

import { FontAwesome6 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';

function PhotoSelectionContainer({ resetScroll }) {
    const appContext = useContext(ImageContext)

    const [mediaLibraryPermission, requestMediaLibraryPermission] =
        ImagePicker.useMediaLibraryPermissions();

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

    async function StartCameraHandler() {
        const hasPermission = await verifyMediaLibraryPermissions();

        if (!hasPermission) {
            return;
        }

        const photo = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        })

        if (!photo.canceled) {
            var newPhoto = {
                uri: photo.assets[0].uri,
                canBeSave: false
            }
            await appContext.setMainImageAndAdd(newPhoto)
            resetScroll()
        }
    }

    async function OpenGalleryHandler() {
        let photo = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!photo.canceled) {
            var newPhoto = {
                uri: photo.assets[0].uri,
                canBeSave: false
            }
            await appContext.setMainImageAndAdd(newPhoto)
            resetScroll()
        }
    }

    async function OpenFileHandler() {
        let photo = await DocumentPicker.getDocumentAsync({
            type: 'image/*',
            copyToCacheDirectory: false,
        })

        if (!photo.canceled && photo.assets.length > 0) {
            const imageUri = photo.assets[0].uri;

            Image.getSize(imageUri, async (width, height) => {
                var newPhoto = {
                    uri: imageUri,
                    canBeSave: false
                }
                await appContext.setMainImageAndAdd(newPhoto)
                resetScroll()
            }, (error) => {
                console.error('Error getting image size:', error);
            });
        }
    }

    async function ClipboardHandler() {
        appContext.setDisableClipboardButton(true)
        let photo = await Clipboard.getImageAsync({})
        if (photo && photo.data && photo.size.height > 0 && photo.size.width > 0) {
            var newPhoto = {
                uri: photo.data,
                canBeSave: false
            }
            await appContext.setMainImageAndAdd(newPhoto)
            resetScroll()
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerCancelButtonContainer}>
                    <TouchableOpacity onPress={() => { resetScroll() }}>
                        <FontAwesome6 name="x" size={20} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitleText}>Insert</Text>
                </View>
                <View style={styles.headerCancelButtonContainer}>
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <CustomButton
                    icon={<Feather name="camera" size={24} color="white" />}
                    text="Camera"
                    onPress={StartCameraHandler}
                    buttonStyle={styles.button}
                    buttonTextStyle={styles.buttonText}
                />
                <CustomButton
                    icon={<FontAwesome name="image" size={24} color="white" />}
                    text="Gallery"
                    onPress={OpenGalleryHandler}
                    buttonStyle={styles.button}
                    buttonTextStyle={styles.buttonText}
                />
                <CustomButton
                    icon={<Feather name="folder" size={24} color="white" />}
                    text="Files"
                    onPress={OpenFileHandler}
                    buttonStyle={styles.button}
                    buttonTextStyle={styles.buttonText}
                />
                <CustomButton
                    icon={<Fontisto name="scissors" size={24} color="white" />}
                    text="Clipboard"
                    onPress={appContext.disableClipboardButton ? () => { } : ClipboardHandler}
                    buttonStyle={{ ...styles.button, opacity: appContext.disableClipboardButton ? 0.4 : 1 }}
                    buttonTextStyle={styles.buttonText}
                />
            </View>
            <View style={styles.photoGridContainer}>
                <View style={styles.titleContainer}>
                    <Text style={styles.headerTitleText}>History</Text>
                </View>
                <FlatListImage resetScroll={resetScroll} />
            </View>
        </View>
    )
}

export default PhotoSelectionContainer

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 0.35,
        // backgroundColor: "red",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10
    },
    headerCancelButtonContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "black",
    },
    headerTitleContainer: {
        flex: 10,
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "blue",
    },
    headerTitleText: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        // backgroundColor: "black",
        justifyContent: "center"
    },
    buttonContainer: {
        flexDirection: "row",
        flex: 1,
        backgroundColor: GlobalStyles.colors.primary200,
        paddingHorizontal: "2%"
    },
    titleContainer: {
        marginHorizontal: 20,
        alignItems: "center",
        marginBottom: 5
    },
    photoGridContainer: {
        flex: 7,
        backgroundColor: GlobalStyles.colors.primary200
    },
    button: {
        flex: 1,
        backgroundColor: GlobalStyles.colors.primary700,
        marginVertical: "4%",
        marginHorizontal: "2%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    }
})