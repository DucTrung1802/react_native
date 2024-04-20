import React, { useState } from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";

const SBItem = ({ index, uri, height, width }) => {
    var opacity = useSharedValue(1);

    return (
        <Animated.View style={{ flex: 1, opacity: opacity }}>
            <Image
                cachePolicy={'memory-disk'}
                index={index}
                style={styles.imagePreview}
                source={{ uri: uri }} />
        </Animated.View>
    );
};

export default SBItem;

const styles = StyleSheet.create({
    imagePreview: {
        flex: 1,
        borderRadius: 10,
        borderColor: "white",
        borderWidth: 3
    }
})