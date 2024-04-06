import React, { useContext } from 'react';
import { StyleSheet, SafeAreaView } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { ImageContext } from "../store/ContextProvider"
import GridTileImage from "./GridTileImage"

function FlatListImage({ resetScroll }) {
    const appContext = useContext(ImageContext)
    function renderGridTileImage(itemData) {
        function pressHandler() {
            appContext.setMainImage(itemData.item)
            resetScroll()
        }

        return (
            <GridTileImage
                uri={itemData.item.uri}
                onPress={pressHandler}
            />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={appContext.imageList}
                keyExtractor={(item) => item.uri}
                renderItem={renderGridTileImage}
                numColumns={3}
            />
        </SafeAreaView>
    )
}

export default FlatListImage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 75
        // backgroundColor: "red",
    }
})