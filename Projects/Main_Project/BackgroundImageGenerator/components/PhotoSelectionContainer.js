import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { GlobalStyles } from "../constants/styles";
import CustomButton from "./CustomButton";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { ImageContext } from "../store/ContextProvider"

import { FontAwesome6 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';

function PhotoSelectionContainer({ resetScroll }) {
    const appContext = useContext(ImageContext)

    async function StartCameraHandler() {
        const photo = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        })

        if (!photo.canceled) {
            var newPhoto = {
                uri: photo.assets[0].uri,
                size: {
                    height: photo.assets[0].height,
                    width: photo.assets[0].width
                }
            }
            await appContext.setMainImage(newPhoto)
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
                size: {
                    height: photo.assets[0].height,
                    width: photo.assets[0].width
                }
            }
            await appContext.setMainImage(newPhoto)
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
                    size: {
                        height: height,
                        width: width
                    }
                }
                await appContext.setMainImage(newPhoto)
                resetScroll()
            }, (error) => {
                console.error('Error getting image size:', error);
            });
        }
    }

    async function ClipboardHandler() {
        let photo = await Clipboard.getImageAsync({})
        if (photo.data && photo.size.height > 0 && photo.size.width > 0) {
            var newPhoto = {
                uri: photo.data,
                size: {
                    height: photo.size.height,
                    width: photo.size.width
                }
            }
            await appContext.setMainImage(newPhoto)
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
                />
                <CustomButton
                    icon={<FontAwesome name="image" size={24} color="white" />}
                    text="Gallery"
                    onPress={OpenGalleryHandler}
                />
                <CustomButton
                    icon={<Feather name="folder" size={24} color="white" />}
                    text="Files"
                    onPress={OpenFileHandler}
                />
                <CustomButton
                    icon={<Fontisto name="scissors" size={24} color="white" />}
                    text="Clipboard"
                    onPress={ClipboardHandler}
                    disabled={!appContext.imageInClipboard}
                />
            </View>
            <View style={styles.photoGridContainer}>

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
    photoGridContainer: {
        flex: 7,
        backgroundColor: GlobalStyles.colors.primary200
    }
})