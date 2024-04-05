import { createContext, useState } from 'react';

export const ImageContext = createContext({
    mainImage: {
        uri: null,
        size: {
            height: 0,
            width: 0
        }
    },
    imageList: [],
    setMainImage: async (image) => { },
});

function ContextProvider({ children }) {
    const [currentMainImage, setCurrentMainImage] = useState({})
    const [currentImageList, setCurrentImageList] = useState([])

    function setMainCurrentImage(newMainImage) {
        setCurrentMainImage(newMainImage)
        setCurrentImageList((imageList) => [...imageList, newMainImage])
    }

    const value = {
        mainImage: currentMainImage,
        imageList: currentImageList,
        setMainImage: setMainCurrentImage
    }

    return (
        <ImageContext.Provider value={value}>
            {children}
        </ImageContext.Provider>
    )
}

export default ContextProvider