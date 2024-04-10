import { View, Text, StyleSheet, BackHandler } from "react-native"
import React, { useEffect } from 'react';

function PhotoFullScreen() {
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
        return () => backHandler.remove()
    }, [])

    return (
        <View style={styles.container}>
            <Text>PhotoFullScreen</Text>
        </View>
    )
}

export default PhotoFullScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "red",
        alignItems: "center",
        justifyContent: "center",
    }
})