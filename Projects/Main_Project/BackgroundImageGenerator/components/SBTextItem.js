import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const SBTextItem = ({ style, index }) => {
    return (
        <View style={[styles.container, style]}>
            {typeof index === "number" && <Text style={{ fontSize: 30, color: "black" }}>{index}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "red",
    },
});
