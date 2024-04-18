import { View, Text, StyleSheet } from "react-native"
import React from 'react';

function PhotoFullScreen() {
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
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "center",
    }
})