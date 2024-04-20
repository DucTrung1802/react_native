import React, { useState } from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";

import Constants from "expo-constants";

import { SBImageItem } from "./SBImageItem";
import { SBTextItem } from "./SBTextItem";

const SBItem = (props) => {
    const { style, showIndex = true, index, pretty, img, testID } = props;
    const [isPretty, setIsPretty] = useState(pretty || Constants?.expoConfig?.extra?.enablePretty || false);
    var opacity = useSharedValue(1);

    const handleLongPress = () => {
        setIsPretty(!isPretty);
    };

    const handleStateChange = ({ nativeEvent }) => {
        if (nativeEvent.state === State.BEGAN) {
            opacity = withSpring(0.5);
        } else if (nativeEvent.state === State.END) {
            opacity = withSpring(1);
            handleLongPress();
        }
    };

    return (
        <LongPressGestureHandler onHandlerStateChange={handleStateChange}>
            <Animated.View testID={testID} style={{ flex: 1, opacity: opacity }}>
                {isPretty || img ? (
                    <SBImageItem style={style} index={index} showIndex={typeof index === "number" && showIndex} img={img} />
                ) : (
                    <SBTextItem style={style} index={index} />
                )}
            </Animated.View>
        </LongPressGestureHandler>
    );
};

export default SBItem;
