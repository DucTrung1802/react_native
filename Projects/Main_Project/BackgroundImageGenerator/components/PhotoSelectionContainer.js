import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { GlobalStyles } from "../constants/styles";
import CustomButton from "./CustomButton";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';

import { FontAwesome6 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';

function PhotoSelectionContainer({ resetScroll }) {
    const [imageURI, setImageURI] = useState(null);

    async function StartCameraHandler() {
        const photo = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1
        })
        console.log(photo)
    }

    async function OpenGalleryHandler() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    async function OpenFileHandler() {
        let result = await DocumentPicker.getDocumentAsync({
            type: 'image/*',
            copyToCacheDirectory: false,
        })

        console.log(result)
    }

    async function ClipboardHandler() {
        let imageContent = await Clipboard.getImageAsync({})
        if (imageContent) {
            setImageURI(imageContent.data);
        }
        console.log(imageContent)
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
                    disabled={false}
                />
            </View>
            <View style={styles.photoGridContainer}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'top' }}>
                    <Image
                        source={{ uri: imageURI }}
                        style={{ width: 300, height: 300 }} // Set your desired width and height
                    />
                </View>
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