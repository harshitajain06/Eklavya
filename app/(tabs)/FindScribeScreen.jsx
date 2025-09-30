import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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

export default function FindScribeScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { searchScribes, getNearbyScribes, isAuthenticated } = useFirebase();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Any');
  const [selectedSubject, setSelectedSubject] = useState('Any');
  const maxDistance = '10'; // Default distance in km
  const [scribes, setScribes] = useState([]);
  const [filteredScribes, setFilteredScribes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Available options for dropdowns (matching ScribeProfileScreen)
  const availableLanguages = ['Any', 'English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Punjabi'];
  const availableSubjects = [
    'Any', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 
    'Economics', 'History', 'Geography', 'Literature', 'Philosophy',
    'Psychology', 'Sociology', 'Political Science', 'Engineering', 'Medical'
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadNearbyScribes();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterScribes();
  }, [searchQuery, selectedLanguage, selectedSubject, scribes]);

  const loadNearbyScribes = async () => {
    try {
      setIsLoading(true);
      const result = await getNearbyScribes(null, parseInt(maxDistance));
      if (result.success) {
        setScribes(result.data);
        setFilteredScribes(result.data);
      } else {
        console.error('Failed to load scribes:', result.error);
      }
    } catch (error) {
      console.error('Error loading nearby scribes:', error);
      Alert.alert('Error', 'Failed to load scribes');
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setIsLoading(true);
      setSearchPerformed(true);
      
      const filters = {
        language: selectedLanguage !== 'Any' ? selectedLanguage : null,
        subject: selectedSubject !== 'Any' ? selectedSubject : null,
        maxDistance: parseInt(maxDistance),
        isAvailable: true
      };

      const result = await searchScribes(filters);
      if (result.success) {
        setScribes(result.data);
        setFilteredScribes(result.data);
      } else {
        console.error('Search failed:', result.error);
        Alert.alert('Search Error', 'Failed to search scribes');
      }
    } catch (error) {
      console.error('Error searching scribes:', error);
      Alert.alert('Error', 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const filterScribes = () => {
    let filtered = [...scribes];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(scribe => 
        scribe.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scribe.subjects?.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        scribe.languages?.some(language => language.toLowerCase().includes(searchQuery.toLowerCase())) ||
        scribe.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by language
    if (selectedLanguage !== 'Any') {
      filtered = filtered.filter(scribe => 
        scribe.languages?.includes(selectedLanguage)
      );
    }

    // Filter by subject
    if (selectedSubject !== 'Any') {
      filtered = filtered.filter(scribe => 
        scribe.subjects?.includes(selectedSubject)
      );
    }

    setFilteredScribes(filtered);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color="#fbbf24"
        />
      );
    }
    return stars;
  };

  const handleViewScribe = (scribe) => {
    navigation.navigate('ScribeView', { scribe });
  };


  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowLanguageModal(false);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setShowSubjectModal(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim() || selectedLanguage !== 'Any' || selectedSubject !== 'Any') {
      performSearch();
    } else {
      loadNearbyScribes();
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('Any');
    setSelectedSubject('Any');
    setSearchPerformed(false);
    loadNearbyScribes();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
      <ScrollView style={styles.container}>

        <View style={styles.content}>
          {/* Left Column - Main Content */}
          <View style={styles.mainContent}>
            {/* Search Section */}
            <View style={[styles.searchCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <View style={styles.searchHeader}>
                <View style={styles.searchTitleContainer}>
                  <Ionicons name="search" size={24} color="#8b5cf6" />
                  <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Find Your Perfect Scribe</Text>
                </View>
                <Text style={[styles.searchDescription, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                  Search by name, subject, language, or city to find qualified scribes
                </Text>
              </View>
              
              <View style={styles.searchRow}>
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search" size={20} color="#8b5cf6" style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8fafc' }]}
                    placeholder="Name, subject, language, city"
                    placeholderTextColor={isDarkMode ? '#94a3b8' : '#94a3b8'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                </View>
                
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={[styles.dropdown, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8fafc' }]}
                    onPress={() => setShowLanguageModal(true)}
                  >
                    <Ionicons name="language" size={16} color="#8b5cf6" />
                    <Text style={[styles.dropdownText, { color: isDarkMode ? '#e2e8f0' : '#475569' }]}>{selectedLanguage}</Text>
                    <Ionicons name="chevron-down" size={16} color="#8b5cf6" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={[styles.dropdown, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8fafc' }]}
                    onPress={() => setShowSubjectModal(true)}
                  >
                    <Ionicons name="book" size={16} color="#8b5cf6" />
                    <Text style={[styles.dropdownText, { color: isDarkMode ? '#e2e8f0' : '#475569' }]}>{selectedSubject}</Text>
                    <Ionicons name="chevron-down" size={16} color="#8b5cf6" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.searchActions}>
                <TouchableOpacity style={[styles.searchButton, { backgroundColor: '#8b5cf6' }]} onPress={handleSearch}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="search" size={18} color="#fff" />
                      <Text style={styles.searchButtonText}>Search Scribes</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.resetButton, { backgroundColor: isDarkMode ? '#374151' : '#f1f5f9' }]} onPress={handleResetFilters}>
                  <Ionicons name="refresh" size={16} color={isDarkMode ? '#e2e8f0' : '#475569'} />
                  <Text style={[styles.resetButtonText, { color: isDarkMode ? '#e2e8f0' : '#475569' }]}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>


            {/* Scribe Listings */}
            <View style={styles.scribeListings}>
              <View style={styles.listingsHeader}>
                <View style={styles.listingsTitleContainer}>
                  <Ionicons name="people" size={24} color="#8b5cf6" />
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                  Available Scribes
                </Text>
                </View>
                <View style={[styles.resultsBadge, { backgroundColor: isDarkMode ? '#374151' : '#e0e7ff' }]}>
                  <Text style={[styles.resultsCount, { color: isDarkMode ? '#e2e8f0' : '#8b5cf6' }]}>
                    {filteredScribes.length} {filteredScribes.length === 1 ? 'scribe' : 'scribes'}
                </Text>
                </View>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#8b5cf6" />
                  <Text style={[styles.loadingText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    Searching scribes...
                  </Text>
                </View>
              ) : filteredScribes.length > 0 ? (
                filteredScribes.map((scribe) => (
                  <View key={scribe.id} style={[styles.scribeCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
                    <View style={styles.scribeCardHeader}>
                      <View style={[styles.scribeAvatar, { backgroundColor: '#8b5cf6' }]}>
                        <Text style={styles.scribeInitial}>
                          {scribe.name ? scribe.name.charAt(0).toUpperCase() : 'S'}
                        </Text>
                      </View>
                    <View style={styles.scribeInfo}>
                      <Text style={[styles.scribeName, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                        {scribe.name}
                      </Text>
                        <View style={styles.scribeLocation}>
                          <Ionicons name="location" size={14} color="#8b5cf6" />
                          <Text style={[styles.scribeDistance, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                        {scribe.city || 'Location TBD'}
                      </Text>
                        </View>
                      </View>
                      <View style={[styles.ratingBadge, { backgroundColor: isDarkMode ? '#374151' : '#f0f9ff' }]}>
                        <Ionicons name="star" size={14} color="#fbbf24" />
                        <Text style={[styles.ratingText, { color: isDarkMode ? '#e2e8f0' : '#1e40af' }]}>
                          {scribe.rating?.toFixed(1) || '0.0'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.scribeExpertise}>
                      <View style={styles.expertiseItem}>
                        <Ionicons name="language" size={14} color="#8b5cf6" />
                        <Text style={[styles.expertiseText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                          {scribe.languages?.join(', ') || 'Languages TBD'}
                        </Text>
                      </View>
                      <View style={styles.expertiseItem}>
                        <Ionicons name="book" size={14} color="#8b5cf6" />
                        <Text style={[styles.expertiseText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                          {scribe.subjects?.join(', ') || 'Subjects TBD'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.scribeFooter}>
                      <View style={styles.bookingInfo}>
                        <Ionicons name="calendar" size={14} color="#8b5cf6" />
                        <Text style={[styles.bookingCount, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                          {scribe.totalBookings || 0} bookings completed
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.viewButton, { backgroundColor: '#8b5cf6' }]}
                        onPress={() => handleViewScribe(scribe)}
                      >
                        <Ionicons name="eye" size={16} color="#fff" />
                        <Text style={styles.viewButtonText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : searchPerformed ? (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search" size={48} color="#6c757d" />
                  <Text style={[styles.noResultsText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    No scribes found matching your criteria
                  </Text>
                  <Text style={[styles.noResultsSubtext, { color: isDarkMode ? '#999' : '#6c757d' }]}>
                    Try adjusting your search filters or expanding your search area
                  </Text>
                </View>
              ) : (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="people" size={48} color="#6c757d" />
                  <Text style={[styles.noResultsText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    No scribes available in your area
                  </Text>
                  <Text style={[styles.noResultsSubtext, { color: isDarkMode ? '#999' : '#6c757d' }]}>
                    Check back later or expand your search radius
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Right Column - Sidebar */}
          <View style={styles.sidebar}>
            {/* Quick Stats */}
            <View style={[styles.statsCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Quick Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                    {filteredScribes.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    Available Scribes
                  </Text>
              </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                    {scribes.filter(s => s.rating >= 4.5).length}
                  </Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    Highly Rated
                  </Text>
                </View>
              </View>
            </View>

            {/* Safety Tips */}
            <View style={[styles.safetyCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <View style={styles.safetyHeader}>
                <Ionicons name="shield-checkmark" size={18} color="#10b981" />
                <Text style={[styles.safetyTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Safety Tips</Text>
              </View>
              
              <View style={styles.tipsList}>
                <Text style={[styles.tipItem, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  • Meet in approved exam venues
                </Text>
                <Text style={[styles.tipItem, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  • Share details with guardian
                </Text>
                <Text style={[styles.tipItem, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  • Verify scribe credentials
                </Text>
              </View>
            </View>

            {/* Help Section */}
            <View style={[styles.helpCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.helpTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Need Help?</Text>
              <Text style={[styles.helpText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                Contact support for assistance with finding the right scribe for your exam.
              </Text>
              <TouchableOpacity style={styles.helpButton}>
                <Text style={styles.helpButtonText}>Contact Support</Text>
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
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Select Language</Text>
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
                      selectedLanguage === item && styles.selectedModalItem
                    ]}
                    onPress={() => handleLanguageSelect(item)}
                  >
                    <Text style={[
                      styles.modalItemText,
                      { color: isDarkMode ? '#fff' : '#11181C' },
                      selectedLanguage === item && styles.selectedModalItemText
                    ]}>
                      {item}
                    </Text>
                    {selectedLanguage === item && (
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
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Select Subject</Text>
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
                      selectedSubject === item && styles.selectedModalItem
                    ]}
                    onPress={() => handleSubjectSelect(item)}
                  >
                    <Text style={[
                      styles.modalItemText,
                      { color: isDarkMode ? '#fff' : '#11181C' },
                      selectedSubject === item && styles.selectedModalItemText
                    ]}>
                      {item}
                    </Text>
                    {selectedSubject === item && (
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
  content: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 20,
  },
  mainContent: {
    flex: 2,
    gap: 16,
  },
  sidebar: {
    width: 280,
    gap: 16,
  },
  searchCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  searchHeader: {
    marginBottom: 20,
  },
  searchTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  searchInputContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    paddingLeft: 48,
    fontSize: 16,
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  searchActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scribeListings: {
    gap: 16,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listingsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  scribeCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  scribeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  scribeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scribeInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scribeInfo: {
    flex: 1,
  },
  scribeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scribeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scribeDistance: {
    fontSize: 14,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scribeExpertise: {
    marginBottom: 16,
    gap: 8,
  },
  expertiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expertiseText: {
    fontSize: 13,
    flex: 1,
  },
  scribeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  bookingCount: {
    fontSize: 12,
  },
  scribeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  safetyCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 13,
    lineHeight: 18,
  },
  helpCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  helpButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 12,
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
