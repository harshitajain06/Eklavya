import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import useFirebase from '../../hooks/useFirebase';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { user, getUser, updateUser, createScribeProfile, updateScribeProfile, getScribeProfile, signOut } = useFirebase();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showInSearch, setShowInSearch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    city: '',
    languages: [],
    subjects: [],
    bio: '',
    experience: '',
    hourlyRate: '',
    isAvailable: true
  });

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Available options for dropdowns
  const availableLanguages = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Punjabi'];
  const availableSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 
    'Economics', 'History', 'Geography', 'Literature', 'Philosophy',
    'Psychology', 'Sociology', 'Political Science', 'Engineering', 'Medical'
  ];

  useEffect(() => {
    if (user?.uid) {
      loadScribeProfile();
    }
  }, [user]);

  const loadScribeProfile = async () => {
    try {
      setIsLoading(true);
      const result = await getScribeProfile(user.uid);
      
      if (result.success) {
        const data = result.data;
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          city: data.city || '',
          languages: data.languages || [],
          subjects: data.subjects || [],
          bio: data.bio || '',
          experience: data.experience || '',
          hourlyRate: data.hourlyRate?.toString() || '',
          isAvailable: data.isAvailable !== undefined ? data.isAvailable : true
        });
        setSelectedLanguages(data.languages || []);
        setSelectedSubjects(data.subjects || []);
        setShowInSearch(data.isAvailable !== undefined ? data.isAvailable : true);
      } else {
        // If no scribe profile exists, try to get user data
        const userResult = await getUser(user.uid);
        if (userResult.success) {
          const userData = userResult.data;
          setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            city: '',
            languages: ['English'],
            subjects: [],
            bio: '',
            experience: '',
            hourlyRate: '',
            isAvailable: true
          });
          setSelectedLanguages(['English']);
          setSelectedSubjects([]);
        }
      }
    } catch (error) {
      console.error('Error loading scribe profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLanguageToggle = (language) => {
    setSelectedLanguages(prev => {
      if (prev.includes(language)) {
        return prev.filter(l => l !== language);
      } else {
        return [...prev, language];
      }
    });
  };

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      } else {
        return [...prev, subject];
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const updatedProfileData = {
        ...profileData,
        languages: selectedLanguages,
        subjects: selectedSubjects,
        isAvailable: showInSearch,
        updatedAt: new Date()
      };

      // Try to update scribe profile first
      let result = await updateScribeProfile(updatedProfileData, user.uid);
      
      // If update fails, try to create a new profile
      if (!result.success) {
        result = await createScribeProfile(user.uid, updatedProfileData);
      }
      
      if (result.success) {
        setIsEditing(false);
        Alert.alert('Success', 'Profile saved successfully!');
        await loadScribeProfile(); // Reload to get updated data
      } else {
        Alert.alert('Error', 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleNotificationSettings = () => {
    Alert.alert('Notifications', 'Notification settings will be implemented soon');
  };

  const handleDownloadData = () => {
    Alert.alert('Download Data', 'Data download feature will be implemented soon');
  };

  const handleMyRatings = () => {
    Alert.alert('My Ratings', 'Ratings view will be implemented soon');
  };

  const handleHelp = () => {
    Alert.alert('Help', 'Help section will be implemented soon');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDarkMode ? '#fff' : '#11181C' }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Scribe Profile</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.themeButton}>
              <Text style={styles.themeText}>Theme</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aboutButton}>
              <Ionicons name="information-circle" size={16} color="#6c757d" />
              <Text style={styles.aboutText}>About</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Your Profile Section */}
            <View style={[styles.profileCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Your Profile</Text>
                {isEditing ? (
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.profileInitial}>
                <Text style={styles.initialText}>
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'S'}
                </Text>
              </View>
              
              <View style={styles.profileFields}>
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Name</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.input, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}
                      value={profileData.name}
                      onChangeText={(value) => handleInputChange('name', value)}
                      placeholder="Enter your name"
                    />
                  ) : (
                    <Text style={[styles.fieldValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                      {profileData.name || 'Not set'}
                    </Text>
                  )}
                </View>
                
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Email</Text>
                  <Text style={[styles.fieldValue, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    {profileData.email || 'Not set'}
                  </Text>
                </View>
                
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>City</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.input, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}
                      value={profileData.city}
                      onChangeText={(value) => handleInputChange('city', value)}
                      placeholder="Enter your city"
                    />
                  ) : (
                    <Text style={[styles.fieldValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                      {profileData.city || 'Not set'}
                    </Text>
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Languages</Text>
                  {isEditing ? (
                    <TouchableOpacity 
                      style={styles.dropdownButton}
                      onPress={() => setShowLanguageModal(true)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {selectedLanguages.length > 0 ? selectedLanguages.join(', ') : 'Select languages'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#6c757d" />
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.fieldValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                      {selectedLanguages.length > 0 ? selectedLanguages.join(', ') : 'Not set'}
                    </Text>
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Subjects</Text>
                  {isEditing ? (
                    <TouchableOpacity 
                      style={styles.dropdownButton}
                      onPress={() => setShowSubjectModal(true)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {selectedSubjects.length > 0 ? selectedSubjects.join(', ') : 'Select subjects'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#6c757d" />
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.fieldValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                      {selectedSubjects.length > 0 ? selectedSubjects.join(', ') : 'Not set'}
                    </Text>
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Bio</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.textArea, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}
                      value={profileData.bio}
                      onChangeText={(value) => handleInputChange('bio', value)}
                      placeholder="Tell students about yourself"
                      multiline
                      numberOfLines={3}
                    />
                  ) : (
                    <Text style={[styles.fieldValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                      {profileData.bio || 'No bio added'}
                    </Text>
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Experience</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.textArea, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}
                      value={profileData.experience}
                      onChangeText={(value) => handleInputChange('experience', value)}
                      placeholder="Describe your experience"
                      multiline
                      numberOfLines={2}
                    />
                  ) : (
                    <Text style={[styles.fieldValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                      {profileData.experience || 'No experience added'}
                    </Text>
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Hourly Rate (₹)</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.input, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}
                      value={profileData.hourlyRate}
                      onChangeText={(value) => handleInputChange('hourlyRate', value)}
                      placeholder="Enter hourly rate"
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={[styles.fieldValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                      {profileData.hourlyRate ? `₹${profileData.hourlyRate}/hr` : 'Not set'}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Privacy & Safety Section */}
            <View style={[styles.privacyCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Privacy & Safety</Text>
              
              <View style={styles.privacySetting}>
                <Text style={[styles.settingLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  Show me in search
                </Text>
                <Switch
                  value={showInSearch}
                  onValueChange={setShowInSearch}
                  trackColor={{ false: '#e5e7eb', true: '#8b5cf6' }}
                  thumbColor={showInSearch ? '#fff' : '#f3f4f6'}
                />
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Account Section */}
            <View style={[styles.accountCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Account</Text>
              
              <TouchableOpacity style={styles.accountButton} onPress={handleNotificationSettings}>
                <Text style={styles.accountButtonText}>Notifications</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.accountButton} onPress={handleDownloadData}>
                <Text style={styles.accountButtonText}>Download data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Log out</Text>
              </TouchableOpacity>
            </View>

            {/* More Section */}
            <View style={[styles.moreCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>More</Text>
              
              <TouchableOpacity style={styles.moreButton} onPress={handleMyRatings}>
                <Text style={styles.moreButtonText}>My ratings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.moreButton} onPress={handleHelp}>
                <Text style={styles.moreButtonText}>Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Select Languages</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={availableLanguages}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      selectedLanguages.includes(item) && styles.selectedModalItem
                    ]}
                    onPress={() => handleLanguageToggle(item)}
                  >
                    <Text style={[
                      styles.modalItemText,
                      { color: isDarkMode ? '#fff' : '#11181C' },
                      selectedLanguages.includes(item) && styles.selectedModalItemText
                    ]}>
                      {item}
                    </Text>
                    {selectedLanguages.includes(item) && (
                      <Ionicons name="checkmark" size={20} color="#8b5cf6" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Subject Selection Modal */}
        <Modal
          visible={showSubjectModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSubjectModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Select Subjects</Text>
                <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={availableSubjects}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      selectedSubjects.includes(item) && styles.selectedModalItem
                    ]}
                    onPress={() => handleSubjectToggle(item)}
                  >
                    <Text style={[
                      styles.modalItemText,
                      { color: isDarkMode ? '#fff' : '#11181C' },
                      selectedSubjects.includes(item) && styles.selectedModalItemText
                    ]}>
                      {item}
                    </Text>
                    {selectedSubjects.includes(item) && (
                      <Ionicons name="checkmark" size={20} color="#8b5cf6" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  themeText: {
    fontSize: 14,
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
  content: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 20,
  },
  leftColumn: {
    flex: 1,
    gap: 16,
  },
  rightColumn: {
    flex: 1,
    gap: 16,
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileInitial: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  initialText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  profileFields: {
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#11181C',
    flex: 1,
  },
  privacyCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  privacySetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  accountButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  moreCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moreButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  moreButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedModalItem: {
    backgroundColor: '#8b5cf6',
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedModalItemText: {
    color: '#fff',
  },
});
