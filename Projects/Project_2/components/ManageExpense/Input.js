import { View, TextInput, Text } from "react-native"

function Input({ label, textInputConfig }) {
    return (
        <View>
            <Text>{label}</Text>
            <TextInput {...textInputConfig} />
        </View>
    )
}

export default Input