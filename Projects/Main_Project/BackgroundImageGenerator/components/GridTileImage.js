import { View, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native"

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function GridTileImage({ uri, onPress }) {
    return (
        <View style={styles.gridItem}>
            <TouchableOpacity onPress={onPress} >
                <Image
                    source={{ uri: uri }}
                    style={styles.gridItem}
                />
            </TouchableOpacity>
        </View>
    )
}

export default GridTileImage

const marginValue = 4

const styles = StyleSheet.create({
    gridItem: {
        margin: marginValue,
        width: SCREEN_WIDTH / 3 - marginValue * 3,
        height: SCREEN_WIDTH / 3 - marginValue * 3,
        borderRadius: 10
        // backgroundColor: "blue"
    }
})