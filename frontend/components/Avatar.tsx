import { View, Image, ImageSourcePropType } from 'react-native';
import React from 'react';
import { cn } from '../lib/utils';

interface AvatarProps {
    source: ImageSourcePropType;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
    borderColor?: string;
    borderWidth?: number;
}

const sizeMap = {
    xs: { width: 32, height: 32 },
    sm: { width: 48, height: 48 },
    md: { width: 64, height: 64 },
    lg: { width: 80, height: 80 },
    xl: { width: 96, height: 96 },
    '2xl': { width: 128, height: 128 }
};

export default function Avatar({
    source,
    size = 'md',
    className = '',
    borderColor = '#FFFFFF',
    borderWidth = 0
}: AvatarProps) {
    const dimensions = sizeMap[size];

    return (
        <View
            style={{
                width: dimensions.width,
                height: dimensions.height,
                borderRadius: dimensions.width * 0.42,
                borderColor,
                borderWidth,
                overflow: 'hidden',
                backgroundColor: '#F3F4F6'
            }}
            className={cn("shadow-sm items-center justify-center bg-gray-100", className)}
        >
            <Image
                source={source}
                resizeMode="cover"
                style={{
                    width: '100%',
                    height: '100%',
                }}
            />
        </View>
    );
}
