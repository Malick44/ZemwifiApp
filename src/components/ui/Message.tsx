import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Image, StyleSheet, useColorScheme, View } from 'react-native'
import { Colors } from '../../../constants/theme'
import { RequestMessage } from '../../stores/messageStore'
import { Typography } from '../ui/Typography'

interface MessageProps {
    message: RequestMessage
    isOwn: boolean
}

export const Message = ({ message, isOwn }: MessageProps) => {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <View style={[
            styles.container,
            isOwn ? styles.ownContainer : styles.otherContainer
        ]}>
            {!isOwn && (
                <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                    <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                        {message.sender_name?.charAt(0) || '?'}
                    </Typography>
                </View>
            )}

            <View style={[
                styles.bubble,
                isOwn ? { backgroundColor: colors.primary } : { backgroundColor: colors.card },
                isOwn ? styles.ownBubble : styles.otherBubble
            ]}>
                {!isOwn && (
                    <Typography
                        variant="caption"
                        style={{ marginBottom: 4, color: colors.primary, fontWeight: '600' }}
                    >
                        {message.sender_name}
                    </Typography>
                )}

                <Typography
                    variant="body"
                    style={{ color: isOwn ? 'white' : colors.text }}
                >
                    {message.content}
                </Typography>

                {message.attachments && message.attachments.length > 0 && (
                    <View style={styles.attachments}>
                        {message.attachments.map((url, index) => (
                            <Image key={index} source={{ uri: url }} style={styles.attachmentImage} />
                        ))}
                    </View>
                )}

                <View style={styles.footer}>
                    <Typography
                        variant="caption"
                        style={{
                            fontSize: 10,
                            color: isOwn ? 'rgba(255,255,255,0.7)' : colors.textSecondary,
                            marginTop: 4
                        }}
                    >
                        {formatTime(message.created_at)}
                    </Typography>
                    {isOwn && (
                        <Ionicons
                            name={message.is_read ? "checkmark-done" : "checkmark"}
                            size={12}
                            color="white"
                            style={{ marginLeft: 4, marginTop: 4 }}
                        />
                    )}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 16,
        maxWidth: '80%',
    },
    ownContainer: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    otherContainer: {
        alignSelf: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    bubble: {
        padding: 12,
        borderRadius: 16,
        maxWidth: '100%',
    },
    ownBubble: {
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        borderTopLeftRadius: 4,
    },
    attachments: {
        marginTop: 8,
        gap: 4,
    },
    attachmentImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
})
