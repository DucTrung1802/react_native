import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const AppLoadingScreen = () => {
    const [countdown, setCountdown] = useState(5);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Start the countdown
        const interval = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        // Simulate async response (replace with your actual async function)
        setTimeout(() => {
            setLoading(false);
            clearInterval(interval);
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const handleCancelPress = () => {
        // Handle cancel button press
        console.log('Cancel button pressed');
    };

    return (
        <View style={styles.appLoadingContainer}>
            {/* {loading ? (
                <>
                    <Text style={{ fontSize: 20 }}>AppLoading...</Text>
                    <Text style={{ fontSize: 16 }}>Please wait {countdown} seconds</Text>
                    <Button title="Cancel" onPress={handleCancelPress} disabled={countdown > 0} />
                </>
            ) : (
                <Text style={{ fontSize: 20 }}>Loading completed!</Text>
            )} */}
        </View>
    );
};

export default AppLoadingScreen;

const styles = StyleSheet.create({
    appLoadingContainer: {
        flex: 1,
        backgroundColor: "black"
    }
})