import { StyleSheet, TextInput, View, Button, Modal, Image } from "react-native"
import { useState } from "react";

function GoalInput(props) {
    const [enteredGoalText, setEnteredGoalText] = useState("");

    function goalInputHandler(enteredText) {
        setEnteredGoalText(enteredText)
    }

    function addGoalHandler() {
        if (enteredGoalText) {
            props.onAddGoal(enteredGoalText);
            setEnteredGoalText("");
        }
    }

    function pressCancel() {
        setEnteredGoalText("")
        props.onCancel()
    }

    return (
        <Modal visible={props.visible} animationType="slide">
            <View style={styles.inputContainer}>
                <Image source={require("../assets/goal.png")} style={styles.image} />
                <TextInput
                    style={styles.textInput}
                    placeholder='Your course goal!'
                    onChangeText={goalInputHandler}
                    value={enteredGoalText}
                />
                <View style={styles.buttonContainer}>
                    <View style={styles.button}>
                        <Button title="Add Goal" onPress={addGoalHandler} color="#5e0acc" />
                    </View>
                    <View style={styles.button}>
                        <Button title="Cancel" onPress={pressCancel} color="#f31282" />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default GoalInput

styles = StyleSheet.create({
    inputContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#311b6b"
    },
    image: {
        width: 200,
        height: 200,
        margin: 20
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#e4d0ff",
        backgroundColor: "#e4d0ff",
        color: "#120438",
        width: "100%",
        padding: 8,
        borderRadius: 6
    },
    buttonContainer: {
        marginTop: 16,
        flexDirection: "row",
    },
    button: {
        width: "30%",
        margin: 8
    }
})