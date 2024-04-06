import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { GlobalStyles } from "../constants/styles";

function CustomButton({ icon, text, onPress, buttonStyle, buttonTextStyle }) {
    return (
        <TouchableOpacity style={{ ...buttonStyle }} onPress={onPress} >
            {icon}
            <Text style={{ ...buttonTextStyle }}>{text}</Text>
        </TouchableOpacity>
    )
}

export default CustomButton

const styles = StyleSheet.create({

})