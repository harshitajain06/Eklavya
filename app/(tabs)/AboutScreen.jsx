import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="grid" size={20} color="#6c757d" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#6c757d" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>About</Text>
          </View>
          <View style={styles.headerActions}>
            <Text style={styles.themeText}>Theme</Text>
            <TouchableOpacity style={[styles.aboutButton, styles.activeAboutButton]}>
              <Ionicons name="information-circle" size={16} color="#6c757d" />
              <Text style={styles.aboutText}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={20} color="#6c757d" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play-circle" size={20} color="#6c757d" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* About Project Card */}
          <View style={[styles.aboutCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
            <Text style={[styles.projectTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
              About Project Eklavya – Scribe
            </Text>
            
            <Text style={[styles.projectDescription, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
              This is a UI prototype to visualize core user flows for connecting visually impaired students with trained scribes.
            </Text>
            
            <View style={styles.featuresSection}>
              <Text style={[styles.featuresTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                Key Features/User Flows:
              </Text>
              
              <View style={styles.featuresList}>
                <Text style={[styles.featureItem, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  • Account creation for students & scribes
                </Text>
                <Text style={[styles.featureItem, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  • Search & filters (language, subject, distance)
                </Text>
                <Text style={[styles.featureItem, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  • Booking flow with exam details
                </Text>
                <Text style={[styles.featureItem, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  • Messaging and safety-first UX
                </Text>
              </View>
            </View>
            
            <View style={styles.technicalSection}>
              <Text style={[styles.technicalTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                Technical Implementation:
              </Text>
              <Text style={[styles.technicalDescription, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                Built as a single-file React app using Tailwind-style components for speed.
              </Text>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  themeText: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  activeAboutButton: {
    backgroundColor: '#e0e7ff',
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  aboutText: {
    fontSize: 14,
    color: '#11181C',
    fontWeight: '500',
  },
  menuButton: {
    padding: 8,
  },
  playButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  aboutCard: {
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  projectDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    fontSize: 16,
    lineHeight: 24,
  },
  technicalSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
  },
  technicalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  technicalDescription: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
