import React from 'react';
import { Image, ImageResizeMode, ImageStyle, StyleSheet, ImageSourcePropType } from 'react-native';

interface OptimizedImageProps {
  uri?: string;
  source?: ImageSourcePropType;
  priority?: 'low' | 'normal' | 'high';
  cache?: 'immutable' | 'web' | 'cacheOnly';
  resizeMode?: ImageResizeMode;
  style?: ImageStyle | ImageStyle[];
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  source,
  resizeMode = 'cover',
  style,
}) => {
  const imageSource = uri ? { uri } : source;

  return (
    <Image
      source={imageSource as ImageSourcePropType}
      resizeMode={resizeMode}
      style={style as any}
    />
  );
};

export const AvatarImage: React.FC<Omit<OptimizedImageProps, 'resizeMode'>> = ({
  style,
  ...props
}) => {
  return (
    <OptimizedImage
      {...props}
      resizeMode="cover"
      style={[styles.avatar, style as any]}
    />
  );
};

export const ThumbnailImage: React.FC<OptimizedImageProps> = (props) => {
  return <OptimizedImage {...props} />;
};

export const BackgroundImage: React.FC<OptimizedImageProps> = (props) => {
  return <OptimizedImage {...props} resizeMode="cover" />;
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 999,
  },
});

export default OptimizedImage;
