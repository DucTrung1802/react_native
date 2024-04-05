import { createContext, useState } from 'react';

export const ImageContext = createContext({
    imageInClipboard: false,
    mainImage: {
        id: 0,
        uri: null,
        size: {
            height: 0,
            width: 0
        }
    },
    imageList: [],
    setImageInClipboard: (imageInClipboard) => { },
    setMainImage: async (image) => { },
});

function ContextProvider({ children }) {
    const [currentImageInClipboard, setCurrentImageInClipboard] = useState(false)
    const [currentMainImage, setCurrentMainImage] = useState({})
    const [currentImageList, setCurrentImageList] = useState([])

    function setImageInClipboard(imageInClipboard) {
        setCurrentImageInClipboard(imageInClipboard)
    }

    function setMainCurrentImage(newMainImage) {
        var nextID = currentImageList.length + 1
        newMainImage.id = nextID
        setCurrentMainImage(newMainImage)
        setCurrentImageList((imageList) => [...imageList, newMainImage])
    }

    const value = {
        imageInClipboard: currentImageInClipboard,
        mainImage: currentMainImage,
        imageList: currentImageList,
        setImageInClipboard: setImageInClipboard,
        setMainImage: setMainCurrentImage
    }

    return (
        <ImageContext.Provider value={value}>
            {children}
        </ImageContext.Provider>
    )
}

export default ContextProvider