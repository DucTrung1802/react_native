import { TextInput, View } from "react-native-web";

function Input({ label, TextInputConfig }) {
    return <View>
        <Text>{label}</Text>
        <TextInput {...TextInputConfig} />
    </View>
}

export default Input;