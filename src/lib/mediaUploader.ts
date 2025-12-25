import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from './supabase'

export interface UploadResult {
    url: string
    path: string
    error?: string
}

/**
 * Upload utility for handling media uploads to Supabase Storage
 */
export class MediaUploader {
    private bucketName = 'technician-requests'

    /**
     * Request camera permissions
     */
    async requestCameraPermission(): Promise<boolean> {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        return status === 'granted'
    }

    /**
     * Request media library permissions
     */
    async requestMediaLibraryPermission(): Promise<boolean> {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        return status === 'granted'
    }

    /**
     * Pick an image from the camera
     */
    async pickImageFromCamera(): Promise<ImagePicker.ImagePickerAsset | null> {
        const hasPermission = await this.requestCameraPermission()
        if (!hasPermission) {
            throw new Error('Camera permission denied')
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        })

        if (result.canceled) {
            return null
        }

        return result.assets[0]
    }

    /**
     * Pick an image from the gallery
     */
    async pickImageFromGallery(): Promise<ImagePicker.ImagePickerAsset | null> {
        const hasPermission = await this.requestMediaLibraryPermission()
        if (!hasPermission) {
            throw new Error('Media library permission denied')
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        })

        if (result.canceled) {
            return null
        }

        return result.assets[0]
    }

    /**
     * Upload an image to Supabase Storage
     * @param uri - Local file URI
     * @param userId - User ID for folder organization
     * @param requestId - Optional request ID for naming
     */
    async uploadImage(
        uri: string,
        userId: string,
        requestId?: string
    ): Promise<UploadResult> {
        try {
            // Read file as base64
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            })

            // Generate unique filename
            const timestamp = Date.now()
            const fileExt = uri.split('.').pop() || 'jpg'
            const fileName = requestId
                ? `${requestId}_${timestamp}.${fileExt}`
                : `${timestamp}.${fileExt}`

            // Create path: userId/fileName
            const filePath = `${userId}/${fileName}`

            // Convert base64 to ArrayBuffer
            const arrayBuffer = decode(base64)

            // Determine content type
            const contentType = this.getContentType(fileExt)

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(this.bucketName)
                .upload(filePath, arrayBuffer, {
                    contentType,
                    upsert: false,
                })

            if (error) {
                console.error('Upload error:', error)
                return {
                    url: '',
                    path: '',
                    error: error.message,
                }
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(data.path)

            return {
                url: urlData.publicUrl,
                path: data.path,
            }
        } catch (error) {
            console.error('Upload exception:', error)
            return {
                url: '',
                path: '',
                error: error instanceof Error ? error.message : 'Upload failed',
            }
        }
    }

    /**
     * Delete an image from Supabase Storage
     * @param path - File path in storage
     */
    async deleteImage(path: string): Promise<boolean> {
        try {
            const { error } = await supabase.storage
                .from(this.bucketName)
                .remove([path])

            if (error) {
                console.error('Delete error:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Delete exception:', error)
            return false
        }
    }

    /**
     * Get content type from file extension
     */
    private getContentType(extension: string): string {
        const ext = extension.toLowerCase()
        switch (ext) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg'
            case 'png':
                return 'image/png'
            case 'webp':
                return 'image/webp'
            default:
                return 'image/jpeg'
        }
    }

    /**
     * Show image picker options (camera or gallery)
     */
    async showImagePickerOptions(): Promise<ImagePicker.ImagePickerAsset | null> {
        // This would typically show an action sheet
        // For now, we'll default to gallery
        return this.pickImageFromGallery()
    }
}

// Export singleton instance
export const mediaUploader = new MediaUploader()
