import React, { useCallback, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '../components/BottomSheet';
import { GlobalStyles } from '../constants/styles'
import { StyleSheet, Text, View, TouchableOpacity, Image, } from 'react-native';
import PhotoSelectionContainer from "../components/PhotoSelectionContainer"

function ImagePickerScreen({ navigation }) {
    const ref = useRef(null);

    const startFromPhotoHandler = useCallback(() => {
        const isActive = ref?.current?.isActive();
        if (isActive) {
            ref?.current?.scrollTo(0);
        } else {
            ref?.current?.scrollTo(-420);
        }
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.imagePreviewContainer}>
                    <TouchableOpacity
                        // onPress={() => { navigation.navigate("PhotoFullScreen") }}
                        onPress={() => { }}
                    >
                        <Image
                            style={styles.imagePreview}
                            source={require('../assets/image_placeholder.png')}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={startFromPhotoHandler}>
                        <Text style={styles.buttonText}>+ Choose a photo</Text>
                    </TouchableOpacity>
                </View>
                <BottomSheet ref={ref} >
                    <PhotoSelectionContainer />
                </BottomSheet>
            </View>
        </GestureHandlerRootView >
    )
}

export default ImagePickerScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalStyles.colors.primary400,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePreviewContainer: {
        flex: 1.2,
        alignContent: 'center',
        justifyContent: "center",
        // backgroundColor: 'green'
    },
    imagePreview: {
        height: 300,
        width: 300,
        borderRadius: 10,
    },
    buttonContainer: {
        flex: 1,
        // backgroundColor: 'orange',
        justifyContent: "center",
        alignItems: 'center',
    },
    button: {
        justifyContent: "center",
        alignItems: 'center',
        height: 50,
        borderRadius: 10,
        aspectRatio: 6,
        backgroundColor: GlobalStyles.colors.primary800,
        opacity: 1,
    },
    buttonText: {
        color: "white",
        fontWeight: 'bold',
        fontSize: 18,
    }
});