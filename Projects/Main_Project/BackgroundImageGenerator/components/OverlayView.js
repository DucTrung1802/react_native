import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { GlobalStyles, IMAGE_GENERATION_TIMEOUT } from '../constants/styles';

function OverlayView({ onPress }) {
    const [countdown, setCountdown] = useState(IMAGE_GENERATION_TIMEOUT);

    useEffect(() => {
        // Start the countdown
        const interval = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);
    }, []);

    return (
        <View style={styles.overlay}>
            <View style={styles.overlayContent}>
                <ActivityIndicator size={70} color="white" />
                <Text style={styles.waitingText}>Waiting for image generation!</Text>
            </View>
            <TouchableOpacity onPress={onPress} style={{ ...styles.overlayButton, opacity: countdown > 0 ? 0.4 : 1 }} disabled={countdown > 0}>
                <Text style={styles.buttonText}>{countdown > 0 ? countdown : "Cancel"}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Transparent background
    },
    overlayContent: {
        // backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    overlayButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: GlobalStyles.colors.accent500,
        borderRadius: 5,
        alignItems: 'center',
        width: "50%",
    },
    buttonText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
    waitingText: {
        color: "white",
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 20
    }
});

export default OverlayView;
