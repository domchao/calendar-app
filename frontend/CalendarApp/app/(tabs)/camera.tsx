import React, { useState, useEffect } from 'react';
import {
    Button,
    Image,
    View,
    StyleSheet,
    Alert,
    Text,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Ensure directories exist with proper error handling
const imgDir = FileSystem.documentDirectory + 'images/';
const resDir = FileSystem.documentDirectory + 'responses/';

const ensureDirExists = async (dirPath: string) => {
    try {
        const dirInfo = await FileSystem.getInfoAsync(dirPath);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
        }
    } catch (error) {
        console.error('Error creating directory:', error);
    }
};

export default function App() {
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [lastImage, setLastImage] = useState<string | null>(null);

    // Request permissions on app start
    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
                const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                
                if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
                    Alert.alert('Sorry', 'Camera and media library permissions are required to use this feature');
                }
            }
        })();
    }, []);

    // Select image from camera
    const selectImage = async () => {
        try {
            const options: ImagePicker.ImagePickerOptions = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.75
            };

            const result = await ImagePicker.launchCameraAsync(options);

            // Save image if not cancelled
            if (!result.canceled) {
                const uri = result.assets[0].uri;
                await saveImage(uri);
                await uploadImage(uri);
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            Alert.alert('Error', 'Failed to select or process image');
        }
    };

    // Save image to file system
    const saveImage = async (uri: string) => {
        try {
            await ensureDirExists(imgDir);
            const filename = new Date().getTime() + '.jpeg';
            const dest = imgDir + filename;
            await FileSystem.copyAsync({ from: uri, to: dest });
            
            setImages(prevImages => [...prevImages, dest]);
            setLastImage(dest);
        } catch (error) {
            console.error('Error saving image:', error);
            Alert.alert('Error', 'Failed to save image');
        }
    };

    // Upload image to server
    const uploadImage = async (uri: string) => {
        try {
            setUploading(true);

            // Create FormData for more reliable upload
            const formData = new FormData();
            formData.append('file', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                type: 'image/jpeg',
                name: 'upload.jpg'
            } as any);

            const response = await fetch('http://192.168.0.5:8000/upload/', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const responseData = await response.text();
            await saveResponse(responseData);
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    // Save response from api
    const saveResponse = async (responseBody: string) => {
        try {
            await ensureDirExists(resDir);
            const filename = "calendar_update.ics";
            const dest = resDir + filename;

            // Write response directly to file
            await FileSystem.writeAsStringAsync(dest, responseBody);

            // Optional: Share the file
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(dest);
            }
        } catch (error) {
            console.error('Error saving response:', error);
            Alert.alert('Error', 'Failed to save API response');
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Take a Picture" onPress={selectImage} />
            {uploading && <Text>Uploading...</Text>}
            {lastImage && (
                <Image 
                    source={{ uri: lastImage }} 
                    style={styles.image} 
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 200,
        height: 200,
        marginTop: 20,
    },
});