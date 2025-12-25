import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Colors } from '../../../constants/theme'
import { Typography } from '../ui/Typography'

interface NotificationBadgeProps {
    count: number
    color?: string
    size?: number
}

export const NotificationBadge = ({ count, color, size = 18 }: NotificationBadgeProps) => {
    if (count <= 0) return null

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: color || Colors.light.error,
                width: size,
                height: size,
                borderRadius: size / 2,
            }
        ]}>
            <Typography
                variant="caption"
                style={{
                    color: 'white',
                    fontSize: size * 0.6,
                    fontWeight: 'bold',
                    lineHeight: size // Center vertically
                }}
            >
                {count > 99 ? '99+' : count}
            </Typography>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: -4,
        right: -4,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'white',
        zIndex: 10,
    },
})
