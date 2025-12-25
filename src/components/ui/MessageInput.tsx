import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native'
import { Colors } from '../../../constants/theme'

interface MessageInputProps {
    onSend: (text: string) => Promise<void>
    loading?: boolean
}

export const MessageInput = ({ onSend, loading = false }: MessageInputProps) => {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']
    const [text, setText] = useState('')

    const handleSend = async () => {
        if (!text.trim() || loading) return

        await onSend(text.trim())
        setText('')
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>

            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Écrivez votre message..."
                    placeholderTextColor={colors.textSecondary}
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={500}
                />
            </View>

            <TouchableOpacity
                style={[
                    styles.sendButton,
                    { backgroundColor: text.trim() ? colors.primary : colors.disabled }
                ]}
                onPress={handleSend}
                disabled={!text.trim() || loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Ionicons name="send" size={20} color="white" />
                )}
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        borderTopWidth: 1,
        gap: 8,
    },
    attachButton: {
        padding: 10,
        marginBottom: 2,
    },
    inputContainer: {
        flex: 1,
        borderRadius: 20,
        minHeight: 40,
        maxHeight: 100,
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    input: {
        fontSize: 16,
        padding: 0,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
})
