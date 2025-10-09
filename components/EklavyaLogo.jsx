import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function EklavyaLogo({ size = 80, color = '#8b5cf6' }) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.circle, { backgroundColor: color }]}>
        <Text style={[styles.text, { fontSize: size * 0.4, color: '#fff' }]}>E</Text>
      </View>
      <View style={[styles.scribble, { borderColor: color }]}>
        <View style={[styles.line, { backgroundColor: color }]} />
        <View style={[styles.line, styles.line2, { backgroundColor: color }]} />
        <View style={[styles.line, styles.line3, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    width: '70%',
    height: '70%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  scribble: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: '40%',
    height: '40%',
    borderWidth: 2,
    borderRadius: 20,
    transform: [{ rotate: '15deg' }],
  },
  line: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  line2: {
    top: '30%',
    width: '60%',
    transform: [{ rotate: '10deg' }],
  },
  line3: {
    top: '60%',
    width: '40%',
    transform: [{ rotate: '-5deg' }],
  },
});
