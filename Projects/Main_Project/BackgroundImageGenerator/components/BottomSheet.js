import { Dimensions, StyleSheet, View } from 'react-native';
import React, { useCallback, useImperativeHandle } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { GlobalStyles } from "../constants/styles"

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 15;

const BottomSheet = React.forwardRef(
    function BottomSheet({ children }, ref) {
        const translateY = useSharedValue(0);
        const active = useSharedValue(false);

        const scrollTo = useCallback((destination) => {
            'worklet';
            active.value = destination !== 0;

            translateY.value = withSpring(destination, { damping: 50 });
        }, []);

        const isActive = useCallback(() => {
            return active.value;
        }, []);

        useImperativeHandle(ref, () => ({ scrollTo, isActive }), [
            scrollTo,
            isActive,
        ]);

        const context = useSharedValue({ y: 0 });
        const gesture = Gesture.Pan()
            .onStart(() => {
                context.value = { y: translateY.value };
            })
            .onUpdate((event) => {
                translateY.value = event.translationY + context.value.y;
                translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
            })
            .onEnd(() => {
                if (-translateY.value > SCREEN_HEIGHT * 0.8) {
                    scrollTo(MAX_TRANSLATE_Y);
                }
                else if (-translateY.value > SCREEN_HEIGHT * 0.5 && -translateY.value < SCREEN_HEIGHT * 0.8) {
                    scrollTo(MAX_TRANSLATE_Y);
                }
                else if (-translateY.value < SCREEN_HEIGHT * 0.5) {
                    scrollTo(0);
                }
            });

        const rBottomSheetStyle = useAnimatedStyle(() => {
            const borderRadius = interpolate(
                translateY.value,
                [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
                [15, 5],
                Extrapolation.CLAMP
            );

            return {
                borderRadius,
                transform: [{ translateY: translateY.value }],
            };
        });

        const rBackdropStyle = useAnimatedStyle(() => {
            return {
                opacity: withTiming(active.value ? 1 : 0),
            };
        }, []);

        const rBackdropProps = useAnimatedProps(() => {
            return {
                pointerEvents: active.value ? 'auto' : 'none',
            };
        }, []);

        return (
            <>
                <Animated.View
                    onTouchStart={() => {
                        // Dismiss the BottomSheet
                        scrollTo(0);
                    }}
                    animatedProps={rBackdropProps}
                    style={[
                        {
                            ...StyleSheet.absoluteFillObject,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                        },
                        rBackdropStyle,
                    ]}
                />
                <GestureDetector gesture={gesture}>
                    <Animated.View
                        style={[styles.bottomSheetContainer, rBottomSheetStyle]}
                    >
                        {children}
                    </Animated.View>
                </GestureDetector>
            </>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetContainer: {
        height: SCREEN_HEIGHT,
        width: '100%',
        backgroundColor: GlobalStyles.colors.primary200,
        position: 'absolute',
        top: SCREEN_HEIGHT,
        paddingVertical: 10
    },
});

export default BottomSheet;
