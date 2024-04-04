import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { GlobalStyles } from "../constants/styles";
import CustomButton from "./CustomButton";

import { FontAwesome6 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';

function PhotoSelectionContainer({ resetScroll }) {
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
                    onPress={() => { }}
                />
                <CustomButton
                    icon={<FontAwesome name="image" size={24} color="white" />}
                    text="Gallery"
                    onPress={() => { }}
                />
                <CustomButton
                    icon={<Feather name="folder" size={24} color="white" />}
                    text="Files"
                    onPress={() => { }}
                />
                <CustomButton
                    icon={<Fontisto name="scissors" size={24} color="white" />}
                    text="Clipboard"
                    onPress={() => { }}
                    disabled={true}
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