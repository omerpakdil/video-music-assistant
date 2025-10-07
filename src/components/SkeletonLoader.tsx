import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width: customWidth = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: customWidth,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Skeleton for card/list item
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <SkeletonLoader width="100%" height={180} borderRadius={12} />
      <View style={styles.cardContent}>
        <SkeletonLoader width="70%" height={20} />
        <SkeletonLoader width="50%" height={16} style={{ marginTop: 8 }} />
        <SkeletonLoader width="40%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
};

// Skeleton for list item
export const SkeletonListItem: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.listItem, style]}>
      <SkeletonLoader width={60} height={60} borderRadius={30} />
      <View style={styles.listItemContent}>
        <SkeletonLoader width="60%" height={18} />
        <SkeletonLoader width="40%" height={14} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
};

// Skeleton for video preview
export const SkeletonVideoPreview: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.videoPreview, style]}>
      <SkeletonLoader width="100%" height={240} borderRadius={12} />
      <View style={styles.videoControls}>
        <SkeletonLoader width={60} height={60} borderRadius={30} />
        <View style={styles.videoInfo}>
          <SkeletonLoader width="80%" height={20} />
          <SkeletonLoader width="60%" height={16} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  );
};

// Skeleton for music track
export const SkeletonMusicTrack: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.musicTrack, style]}>
      <SkeletonLoader width={80} height={80} borderRadius={12} />
      <View style={styles.trackInfo}>
        <SkeletonLoader width="70%" height={18} />
        <SkeletonLoader width="50%" height={14} style={{ marginTop: 6 }} />
        <View style={styles.trackMeta}>
          <SkeletonLoader width={40} height={12} />
          <SkeletonLoader width={40} height={12} style={{ marginLeft: 12 }} />
        </View>
      </View>
    </View>
  );
};

// Skeleton screen with multiple items
export const SkeletonScreen: React.FC<{
  type: 'card' | 'list' | 'video' | 'music';
  count?: number;
}> = ({ type, count = 3 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <SkeletonCard />;
      case 'list':
        return <SkeletonListItem />;
      case 'video':
        return <SkeletonVideoPreview />;
      case 'music':
        return <SkeletonMusicTrack />;
      default:
        return <SkeletonCard />;
    }
  };

  return (
    <View style={styles.screen}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          {renderSkeleton()}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  card: {
    backgroundColor: 'rgba(42, 26, 62, 0.6)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  cardContent: {
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 26, 62, 0.6)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  videoPreview: {
    backgroundColor: 'rgba(42, 26, 62, 0.6)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  videoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  videoInfo: {
    flex: 1,
    marginLeft: 16,
  },
  musicTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(42, 26, 62, 0.6)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  trackMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  screen: {
    flex: 1,
    padding: 16,
  },
  skeletonItem: {
    marginBottom: 8,
  },
});

export default SkeletonLoader;
