import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import useFirebase from '../../hooks/useFirebase';

export default function ScribeViewScreen({ route, navigation }) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { user, createBooking } = useFirebase();
  
  const { scribe } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const handleBookScribe = () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to book a scribe');
      return;
    }

    // Navigate to BookScribeScreen with the scribe data
    navigation.navigate('BookScribe', { scribe });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name="star" size={16} color="#fbbf24" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#fbbf24" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#d1d5db" />
      );
    }

    return stars;
  };

  if (!scribe) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDarkMode ? '#fff' : '#11181C' }]}>
            Scribe information not found
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#6c757d" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
              Scribe Profile
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Scribe Profile Card */}
            <View style={[styles.profileCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <View style={styles.profileHeader}>
                <View style={styles.profileInitial}>
                  <Text style={styles.initialText}>
                    {scribe.name ? scribe.name.charAt(0).toUpperCase() : 'S'}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.scribeName, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                    {scribe.name || 'Name not provided'}
                  </Text>
                  <Text style={[styles.scribeLocation, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    <Ionicons name="location-outline" size={16} color="#6c757d" />
                    {' '}{scribe.city || 'Location not specified'}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <View style={styles.stars}>
                      {renderStars(scribe.rating || 0)}
                    </View>
                    <Text style={[styles.ratingText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                      {scribe.rating?.toFixed(1) || '0.0'}
                    </Text>
                    <Text style={[styles.ratingCount, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                      ({scribe.totalBookings || 0} bookings)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Quick Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                    {scribe.totalBookings || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    Total Bookings
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                    {scribe.subjects?.length || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    Subjects
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                    {scribe.languages?.length || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    Languages
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={handleBookScribe}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="calendar-outline" size={20} color="#fff" />
                    <Text style={styles.bookButtonText}>Book Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Detailed Information */}
            <View style={[styles.detailsCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                Detailed Information
              </Text>
              
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  Languages Spoken
                </Text>
                <View style={styles.tagsContainer}>
                  {scribe.languages && scribe.languages.length > 0 ? (
                    scribe.languages.map((language, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{language}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.noDataText, { color: isDarkMode ? '#666' : '#999' }]}>
                      Languages not specified
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  Academic Subjects
                </Text>
                <View style={styles.tagsContainer}>
                  {scribe.subjects && scribe.subjects.length > 0 ? (
                    scribe.subjects.map((subject, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{subject}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.noDataText, { color: isDarkMode ? '#666' : '#999' }]}>
                      Subjects not specified
                    </Text>
                  )}
                </View>
              </View>

              {scribe.bio && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    About
                  </Text>
                  <Text style={[styles.bioText, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                    {scribe.bio}
                  </Text>
                </View>
              )}

              {scribe.experience && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    Experience
                  </Text>
                  <Text style={[styles.experienceText, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                    {scribe.experience}
                  </Text>
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  Hourly Rate
                </Text>
                <Text style={[styles.rateText, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                  {scribe.hourlyRate ? `₹${scribe.hourlyRate}/hour` : 'Rate not specified'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  Availability Status
                </Text>
                <View style={styles.availabilityContainer}>
                  <View style={[
                    styles.availabilityDot, 
                    { backgroundColor: scribe.isAvailable ? '#10b981' : '#ef4444' }
                  ]} />
                  <Text style={[
                    styles.availabilityText, 
                    { color: isDarkMode ? '#fff' : '#11181C' }
                  ]}>
                    {scribe.isAvailable ? 'Available for bookings' : 'Currently unavailable'}
                  </Text>
                </View>
              </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    paddingVertical: 20,
  },
  mainContent: {
    gap: 20,
  },
  profileCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  profileInitial: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  scribeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scribeLocation: {
    fontSize: 16,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
  },
  experienceText: {
    fontSize: 16,
    lineHeight: 24,
  },
  rateText: {
    fontSize: 18,
    fontWeight: '600',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availabilityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
