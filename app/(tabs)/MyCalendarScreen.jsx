import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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

export default function MyCalendarScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { user, getUserBookings, getUser, isAuthenticated } = useFirebase();
  
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('student');

  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadUserRole();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (userRole) {
      loadBookings();
    }
  }, [userRole]);

  const loadUserRole = async () => {
    try {
      // Get user profile to determine role
      const userResult = await getUser(user.uid);
      if (userResult.success) {
        setUserRole(userResult.data.role || 'student');
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      
      // Pass the correct role to getUserBookings
      const result = await getUserBookings(userRole);
      
      if (result.success) {
        console.log('Raw bookings data:', result.data);
        console.log('User role:', userRole);
        console.log('User ID:', user.uid);
        
        // Sort bookings by date (upcoming first)
        const sortedBookings = result.data.sort((a, b) => {
          const dateA = new Date(a.examDate?.toDate() || a.examDate);
          const dateB = new Date(b.examDate?.toDate() || b.examDate);
          return dateA - dateB;
        });
        
        console.log('Filtered and sorted bookings:', sortedBookings);
        setBookings(sortedBookings);
      } else {
        console.error('Failed to load bookings:', result.error);
        
        // Check if it's an index error and provide helpful guidance
        if (result.error && result.error.includes('requires an index')) {
          Alert.alert(
            'Index Required', 
            'Firebase needs to create indexes for this query. This will happen automatically in a few minutes. Please try again later.',
            [
              { text: 'OK', style: 'default' },
              { text: 'Retry', onPress: () => loadBookings() }
            ]
          );
        } else {
          Alert.alert('Error', 'Failed to load bookings');
        }
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      
      // Check if it's an index error and provide helpful guidance
      if (error.message && error.message.includes('requires an index')) {
        Alert.alert(
          'Index Required', 
          'Firebase needs to create indexes for this query. This will happen automatically in a few minutes. Please try again later.',
          [
            { text: 'OK', style: 'default' },
            { text: 'Retry', onPress: () => loadBookings() }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load bookings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Date TBD';
    
    const examDate = date.toDate ? date.toDate() : new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[examDate.getDay()];
    const time = examDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    if (examDate.toDateString() === today.toDateString()) {
      return `Today ${time}`;
    } else if (examDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${time}`;
    } else {
      return `${dayName} ${time}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      case 'completed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const handleImportGoogleCalendar = () => {
    Alert.alert('Import Calendar', 'Google Calendar import will be implemented soon');
  };

  const handleAddExam = () => {
    if (userRole === 'scribe') {
      // For scribes, navigate to profile to manage their services
      navigation.navigate('Profile');
    } else {
      // For students, navigate to book scribe
      navigation.navigate('Book Scribe');
    }
  };

  const renderBookingItem = ({ item }) => (
    <View style={[styles.bookingItem, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}>
      <View style={styles.bookingInfo}>
        <Text style={[styles.examName, { color: isDarkMode ? '#fff' : '#11181C' }]}>
          {item.subject || 'Exam'}
        </Text>
        <Text style={[styles.examLocation, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
          {item.venue || 'Location TBD'}
        </Text>
        {userRole === 'scribe' && (
          <Text style={[styles.studentName, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
            Student: {item.studentName || 'Unknown'}
          </Text>
        )}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.bookingTime}>
        <Text style={[styles.timeText, { color: isDarkMode ? '#fff' : '#11181C' }]}>
          {formatDate(item.examDate)}
        </Text>
        {item.examDuration && (
          <Text style={[styles.durationText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
            {Math.round(item.examDuration / 60)}h
          </Text>
        )}
      </View>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDarkMode ? '#fff' : '#11181C' }]}>
            Please log in to view your calendar
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
              onPress={() => {
                if (userRole === 'scribe') {
                  // For scribes, go back to previous screen
                  navigation.goBack();
                } else {
                  // For students, close drawer and go to main tabs
                  navigation.navigate('MainTabs');
                }
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#6c757d" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
              {userRole === 'scribe' ? 'My Bookings' : 'My Calendar'}
            </Text>
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

        {/* Main Content */}
        <View style={[styles.mainCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                {userRole === 'scribe' ? 'Student Bookings' : 'Upcoming exams'}
              </Text>
              <Text style={[styles.cardSubtitle, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                {userRole === 'scribe' ? 'Bookings from students' : 'Your scheduled assessments'}
              </Text>
            </View>
          </View>

          {/* Bookings List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8b5cf6" />
                             <Text style={[styles.loadingText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                 {userRole === 'scribe' ? 'Loading your bookings...' : 'Loading your calendar...'}
               </Text>
            </View>
          ) : bookings.length > 0 ? (
            <View style={styles.bookingsList}>
              {bookings.map((booking, index) => (
                <React.Fragment key={booking.id || index}>
                  {renderBookingItem({ item: booking })}
                  {index < bookings.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: isDarkMode ? '#404040' : '#e5e7eb' }]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          ) : (
            <View style={styles.noBookingsContainer}>
              <Ionicons name="calendar-outline" size={48} color="#6c757d" />
                             <Text style={[styles.noBookingsText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                 {userRole === 'scribe' ? 'No student bookings' : 'No upcoming exams'}
               </Text>
               <Text style={[styles.noBookingsSubtext, { color: isDarkMode ? '#999' : '#6c757d' }]}>
                 {userRole === 'scribe' ? 'Students will appear here when they book you' : 'Book a scribe to see your exams here'}
               </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.importButton}
              onPress={handleImportGoogleCalendar}
            >
              <Text style={styles.importButtonText}>Import from Google Calendar</Text>
            </TouchableOpacity>
            
                         <TouchableOpacity 
               style={styles.addExamButton}
               onPress={handleAddExam}
             >
               <Text style={styles.addExamButtonText}>
                 {userRole === 'scribe' ? 'View Profile' : 'Add exam'}
               </Text>
             </TouchableOpacity>
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
  mainCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 20,
  },
  cardHeader: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  bookingsList: {
    marginBottom: 24,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  bookingInfo: {
    flex: 1,
    marginRight: 16,
  },
  examName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  examLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  studentName: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookingTime: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 0,
  },
  noBookingsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  noBookingsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noBookingsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
  },
  importButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  importButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  addExamButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addExamButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
