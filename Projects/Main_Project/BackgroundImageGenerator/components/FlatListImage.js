import React, { useContext } from 'react';
import { FlatList, SafeAreaView, StyleSheet } from "react-native"
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
        <FlatList
            data={appContext.imageList}
            keyExtractor={(item) => item.uri}
            renderItem={renderGridTileImage}
            numColumns={3}
        />
    )
}

export default FlatListImage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "red"
    },
})