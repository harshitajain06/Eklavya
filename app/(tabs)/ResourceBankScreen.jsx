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

export default function ResourceBankScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const resources = [
    {
      id: 1,
      title: 'Math audio resources',
      subtitle: 'Audio',
      description: 'Curated playlists for IB & CBSE',
      type: 'audio'
    },
    {
      id: 2,
      title: 'Screen reader shortcuts',
      subtitle: 'Guide',
      description: 'NVDA, VoiceOver, TalkBack',
      type: 'guide'
    },
    {
      id: 3,
      title: 'Accessible exam tips',
      subtitle: 'Tips',
      description: 'Best practices for students & scribes',
      type: 'tips'
    }
  ];

  const handleOpenResource = (resource) => {
    // TODO: Implement resource opening functionality
    console.log('Opening resource:', resource.title);
  };

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
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Resource Bank</Text>
          </View>
          <View style={styles.headerActions}>
            <Text style={styles.themeText}>Theme</Text>
            <TouchableOpacity style={styles.aboutButton}>
              <Ionicons name="information-circle" size={16} color="#6c757d" />
              <Text style={styles.aboutText}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={20} color="#6c757d" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Resource Cards */}
        <View style={styles.resourcesContainer}>
          {resources.map((resource) => (
            <View key={resource.id} style={[styles.resourceCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <View style={styles.resourceHeader}>
                <Text style={[styles.resourceTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                  {resource.title}
                </Text>
                <Text style={[styles.resourceSubtitle, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  {resource.subtitle}
                </Text>
              </View>
              
              <Text style={[styles.resourceDescription, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                {resource.description}
              </Text>
              
              <TouchableOpacity 
                style={styles.openButton}
                onPress={() => handleOpenResource(resource)}
              >
                <Text style={styles.openButtonText}>Open</Text>
              </TouchableOpacity>
            </View>
          ))}
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
  aboutText: {
    fontSize: 14,
    color: '#11181C',
    fontWeight: '500',
  },
  menuButton: {
    padding: 8,
  },
  resourcesContainer: {
    gap: 16,
    paddingVertical: 20,
  },
  resourceCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceHeader: {
    marginBottom: 12,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resourceSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  resourceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  openButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  openButtonText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
});