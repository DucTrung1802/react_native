import { View, Text, StyleSheet, Image, Dimensions } from "react-native"
import React, { useContext, useEffect, useState } from 'react';
import { ImageContext } from "../store/ContextProvider";
import CustomButton from "../components/CustomButton";
import { MaterialIcons } from '@expo/vector-icons';
import * as ScreenOrientation from "expo-screen-orientation";
import { AndroidOutputFormat } from "expo-av/build/Audio";


function PhotoFullScreen() {
    const appContext = useContext(ImageContext)

    const SCREEN_HEIGHT = Dimensions.get('window').height
    const SCREEN_WIDTH = Dimensions.get('window').width

    const [currentWidth, setCurrentWidth] = useState(Math.min(appContext.mainImage.width, SCREEN_WIDTH))

    const [currentHeight, setCurrentHeight] = useState(Math.min(appContext.mainImage.height * currentWidth / appContext.mainImage.width, SCREEN_HEIGHT))

    const [currentFlexDirection, setCurrentFlexDirection] = useState("column")

    async function rotateScreen() {
        const currentOrientation = await ScreenOrientation.getOrientationLockAsync()
        const LAST_HEIGHT = Dimensions.get('window').height
        const LAST_WIDTH = Dimensions.get('window').width
        var output_height, output_width

        if (currentOrientation == ScreenOrientation.OrientationLock.PORTRAIT_UP) {
            await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
            );
            setCurrentFlexDirection("row")
            console.log(LAST_HEIGHT, LAST_WIDTH)
            output_height = LAST_WIDTH
            output_width = appContext.mainImage.width * output_height / appContext.mainImage.height
        }
        else if (currentOrientation == ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT) {
            await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.PORTRAIT_UP
            );
            setCurrentFlexDirection("column")
            output_width = LAST_HEIGHT
            output_height = appContext.mainImage.height * output_width / appContext.mainImage.width
        }

        setCurrentHeight(output_height)
        setCurrentWidth(output_width)
    }

    return (
        <View style={{ ...styles.container, flexDirection: currentFlexDirection }}>
            <View style={styles.imageContainer}>
                <Image
                    style={{
                        ...styles.fullscreenImage,
                        height: currentHeight,
                        width: currentWidth
                    }}
                    source={
                        { uri: appContext.mainImage.uri }
                    }
                />
            </View>
            <View style={styles.buttonContainer} >
                <CustomButton
                    icon={<MaterialIcons name="screen-rotation" size={24} color="white" />}
                    // text="sometext"
                    onPress={async () => { await rotateScreen() }}
                    buttonStyle={styles.button}
                    buttonTextStyle={styles.buttonText}
                    hasText={false}
                />
            </View>
        </View >
    )
}

export default PhotoFullScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "center",
    },
    imageContainer: {
        flex: 15,
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "red"
    },
    buttonContainer: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "green"
    },
    fullscreenImage: {},
    button: {
        width: "100%",
        height: "100%",
        backgroundColor: "purple",
        alignItems: "center",
        justifyContent: "center",
    },
})