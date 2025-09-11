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
  const [maxDistance, setMaxDistance] = useState('10');
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
        scribe.languages?.some(language => language.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const handleBookScribe = (scribe) => {
    // TODO: Navigate to booking screen
    Alert.alert('Book Scribe', `Booking ${scribe.name} for exam`);
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
    setMaxDistance('10');
    setSearchPerformed(false);
    loadNearbyScribes();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#6c757d" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Find a Scribe</Text>
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

        <View style={styles.content}>
          {/* Left Column - Main Content */}
          <View style={styles.mainContent}>
            {/* Search Section */}
            <View style={[styles.searchCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Search</Text>
              
              <View style={styles.searchRow}>
                <TextInput
                  style={[styles.searchInput, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}
                  placeholder="Name, subject, language"
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={[styles.dropdown, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}
                    onPress={() => setShowLanguageModal(true)}
                  >
                    <Text style={[styles.dropdownText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>{selectedLanguage}</Text>
                    <Ionicons name="chevron-down" size={16} color="#6c757d" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={[styles.dropdown, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}
                    onPress={() => setShowSubjectModal(true)}
                  >
                    <Text style={[styles.dropdownText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>{selectedSubject}</Text>
                    <Ionicons name="chevron-down" size={16} color="#6c757d" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.searchActions}>
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.searchButtonText}>Search</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.mapPlaceholder, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}>
                <Ionicons name="map" size={24} color="#6c757d" />
                <Text style={[styles.mapText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  Map preview placeholder (auto-centers to your city)
                </Text>
              </View>
            </View>

            {/* Scribe Listings */}
            <View style={styles.scribeListings}>
              <View style={styles.listingsHeader}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                  Available Scribes
                </Text>
                <Text style={[styles.resultsCount, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  {filteredScribes.length} {filteredScribes.length === 1 ? 'scribe' : 'scribes'} found
                </Text>
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
                    <View style={styles.scribeInfo}>
                      <Text style={[styles.scribeName, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                        {scribe.name}
                      </Text>
                      <Text style={[styles.scribeDistance, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                        {scribe.city || 'Location TBD'}
                      </Text>
                      <Text style={[styles.scribeExpertise, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                        {scribe.languages?.join(', ') || 'Languages TBD'} • {scribe.subjects?.join(', ') || 'Subjects TBD'}
                      </Text>
                      <View style={styles.ratingContainer}>
                        <View style={styles.stars}>
                          {renderStars(scribe.rating || 0)}
                        </View>
                        <Text style={[styles.ratingText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                          {scribe.rating?.toFixed(1) || '0.0'}
                        </Text>
                        <Text style={[styles.bookingCount, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                          ({scribe.totalBookings || 0} bookings)
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.scribeActions}>
                      <TouchableOpacity 
                        style={styles.viewButton}
                        onPress={() => handleViewScribe(scribe)}
                      >
                        <Text style={styles.viewButtonText}>View</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.bookButton}
                        onPress={() => handleBookScribe(scribe)}
                      >
                        <Text style={styles.bookButtonText}>Book</Text>
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
            {/* Filters */}
            <View style={[styles.filtersCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Filters</Text>
              
              <View style={styles.filterField}>
                <Text style={[styles.filterLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Max distance</Text>
                <TextInput
                  style={[styles.distanceInput, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}
                  value={maxDistance}
                  onChangeText={setMaxDistance}
                  keyboardType="numeric"
                />
                <Text style={[styles.distanceUnit, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>km</Text>
              </View>
              
              <TouchableOpacity style={styles.advancedButton}>
                <Text style={styles.advancedButtonText}>Advanced...</Text>
              </TouchableOpacity>
            </View>

            {/* Safety Tips */}
            <View style={[styles.safetyCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Safety tips</Text>
              
              <View style={styles.tipsList}>
                <Text style={[styles.tipItem, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  • Always meet in approved exam venues.
                </Text>
                <Text style={[styles.tipItem, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  • Share booking details with a guardian.
                </Text>
                <Text style={[styles.tipItem, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  • Verify scribe credentials before booking.
                </Text>
              </View>
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
    flex: 1,
    gap: 16,
  },
  searchCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
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
    borderRadius: 8,
    padding: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  resetButtonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '600',
  },
  mapPlaceholder: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mapText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scribeListings: {
    gap: 16,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
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
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scribeInfo: {
    marginBottom: 16,
  },
  scribeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scribeDistance: {
    fontSize: 14,
    marginBottom: 4,
  },
  scribeExpertise: {
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingCount: {
    fontSize: 12,
    color: '#6c757d',
  },
  scribeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#e0e7ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filtersCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  distanceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  distanceUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  advancedButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  advancedButtonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '600',
  },
  safetyCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
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
