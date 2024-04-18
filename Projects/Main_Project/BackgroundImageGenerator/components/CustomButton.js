import { StyleSheet, TouchableOpacity, Text } from "react-native";

function CustomButton({ icon, text, onPress, buttonStyle, buttonTextStyle, disabled }) {
    return (
        <TouchableOpacity style={{ ...buttonStyle }} onPress={onPress} disabled={disabled}>
            {icon}
            <Text style={{ ...buttonTextStyle }}>{text}</Text>
        </TouchableOpacity>
    )
}

export default CustomButton

const styles = StyleSheet.create({

})