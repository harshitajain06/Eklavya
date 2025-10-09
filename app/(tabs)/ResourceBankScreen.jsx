import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function ResourceBankScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
      <ScrollView style={styles.container}>

        {/* Work in Progress */}
        <View style={styles.workInProgressContainer}>
          <View style={[styles.workInProgressCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
            <Ionicons name="construct-outline" size={64} color="#8b5cf6" />
            <Text style={[styles.workInProgressTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
              Work in Progress
            </Text>
            <Text style={[styles.workInProgressDescription, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
              We&apos;re building an amazing resource bank with audio materials, guides, and tips for students and scribes. Stay tuned!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  workInProgressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  workInProgressCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: 320,
  },
  workInProgressTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  workInProgressDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});