import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import useFirebase from '../../hooks/useFirebase';

export default function StudentProfileScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { user, getUser, updateUser } = useFirebase();

  const [name, setName] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [subjects, setSubjects] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      if (user?.uid) {
        const result = await getUser(user.uid);
        if (result.success) {
          const userData = result.data;
          setName(userData.name || '');
          setAboutMe(userData.aboutMe || '');
          setSubjects(userData.subjects ? userData.subjects.join(', ') : '');
          setCity(userData.city || '');
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return;
    }

    try {
      setIsLoading(true);
      
      const subjectsArray = subjects.trim() 
        ? subjects.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

      const profileData = {
        name: name.trim(),
        aboutMe: aboutMe.trim(),
        subjects: subjectsArray,
        city: city.trim(),
        updatedAt: new Date()
      };

      const result = await updateUser(profileData, user.uid);
      
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'Failed to update profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#6c757d" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
              Student Profile
            </Text>
          </View>
        </View>

        {/* Profile Form */}
        <View style={[styles.profileCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
            Personal Information
          </Text>
          
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#11181C' }]}>
              Name *
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                color: isDarkMode ? '#fff' : '#11181C',
                borderColor: isDarkMode ? '#404040' : '#e5e7eb'
              }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={isDarkMode ? '#666' : '#9ca3af'}
            />
          </View>

          {/* About Me Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#11181C' }]}>
              About Me
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                color: isDarkMode ? '#fff' : '#11181C',
                borderColor: isDarkMode ? '#404040' : '#e5e7eb'
              }]}
              value={aboutMe}
              onChangeText={setAboutMe}
              placeholder="Tell us about yourself, your interests, and goals"
              placeholderTextColor={isDarkMode ? '#666' : '#9ca3af'}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Subjects Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#11181C' }]}>
              Subjects You&apos;re Studying
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                color: isDarkMode ? '#fff' : '#11181C',
                borderColor: isDarkMode ? '#404040' : '#e5e7eb'
              }]}
              value={subjects}
              onChangeText={setSubjects}
              placeholder="e.g., Mathematics, Physics, Chemistry (separate with commas)"
              placeholderTextColor={isDarkMode ? '#666' : '#9ca3af'}
            />
            <Text style={[styles.helperText, { color: isDarkMode ? '#999' : '#6c757d' }]}>
              Separate multiple subjects with commas
            </Text>
          </View>

          {/* City Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#11181C' }]}>
              City *
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                color: isDarkMode ? '#fff' : '#11181C',
                borderColor: isDarkMode ? '#404040' : '#e5e7eb'
              }]}
              value={city}
              onChangeText={setCity}
              placeholder="Enter your city"
              placeholderTextColor={isDarkMode ? '#666' : '#9ca3af'}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, { opacity: isLoading ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
