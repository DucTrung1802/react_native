import { View, Text, StyleSheet, Image, Dimensions } from "react-native"
import React, { useContext } from 'react';
import { ImageContext } from "../store/ContextProvider";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

function PhotoFullScreen() {
    const appContext = useContext(ImageContext)

    function resizeImage(height, width) {
        var output_height = 0
        var output_width = 0

        output_width = Math.min(width, SCREEN_WIDTH)
        output_height = Math.min(height * output_width / width, SCREEN_HEIGHT)

        return { height: output_height, width: output_width }
    }

    console.log(resizeImage(appContext.mainImage.height, appContext.mainImage.width))

    return (
        <View style={styles.container}>
            <Image
                style={{
                    ...styles.fullscreenImage,
                    height: resizeImage(appContext.mainImage.height, appContext.mainImage.width).height,
                    width: resizeImage(appContext.mainImage.height, appContext.mainImage.width).width
                }}
                source={
                    { uri: appContext.mainImage.uri }
                }
            />
        </View>
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
    fullscreenImage: {}
})