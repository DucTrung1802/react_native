import { View, Text, StyleSheet, BackHandler } from "react-native"
import React, { useEffect } from 'react';

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