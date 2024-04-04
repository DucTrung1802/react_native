import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { GlobalStyles } from "../constants/styles";

function CustomButton({ icon, text, onPress, disabled }) {
    return (
        <TouchableOpacity style={{ ...styles.button, opacity: disabled ? 0.4 : 1 }} onPress={onPress} disabled={disabled} >
            {icon}
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    )
}

export default CustomButton

const styles = StyleSheet.create({
    button: {
        flex: 1,
        backgroundColor: GlobalStyles.colors.primary700,
        marginVertical: "4%",
        marginHorizontal: "2%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    }
})