import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const Loader = () => {
  const circles = Array.from({ length: 6 }, () => useRef(new Animated.Value(0)).current);
  const colors = ['#ff4d4d', '#ff6666', '#ff8080', '#ff9999', '#ffb3b3', '#e23e3e'];

  useEffect(() => {
    circles.forEach((circle, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(circle, {
            toValue: 1,
            duration: index === circles.length - 1 ? 500 : 700, 
            delay: index * 100, 
            useNativeDriver: true,
          }),
          Animated.timing(circle, {
            toValue: 0,
            duration: index === circles.length - 1 ? 300 : 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [circles]);

  return (
    <View style={styles.container}>
      {circles.map((circle, index) => {
        const scaleInterpolation = circle.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1.4], // Adjusted scale for smoother transition
        });

        const opacityInterpolation = circle.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 1],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.circle,
              {
                backgroundColor: colors[index],
                transform: [{ scale: scaleInterpolation }],
                opacity: opacityInterpolation,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
  },
  circle: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
  },
});

export default Loader;
