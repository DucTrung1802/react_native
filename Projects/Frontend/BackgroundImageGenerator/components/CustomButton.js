import { StyleSheet, TouchableOpacity, Text } from "react-native";

function CustomButton({ icon, text, onPress, buttonStyle, buttonTextStyle, disabled, hasText = true }) {
    return (
        <TouchableOpacity style={{ ...buttonStyle }} onPress={onPress} disabled={disabled}>
            {icon}
            {hasText && <Text style={{ ...buttonTextStyle }}>{text}</Text>}
        </TouchableOpacity>
    )
}

export default CustomButton

const styles = StyleSheet.create({

})