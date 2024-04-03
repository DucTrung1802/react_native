import { View, Text, StyleSheet } from "react-native"

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
        padding: 16,
        backgroundColor: "red",
        alignItems: "center",
        justifyContent: "center",
    }
})