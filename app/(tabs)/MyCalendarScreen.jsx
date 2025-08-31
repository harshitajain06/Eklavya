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
  const { user, getUserBookings, getUser, isAuthenticated, updateBookingStatus } = useFirebase();
  
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const [lastUpdated, setLastUpdated] = useState(null);

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
        setLastUpdated(new Date());
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
      case 'rejected':
        return '#dc2626';
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
      case 'rejected':
        return 'Rejected';
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

  const handleConfirmBooking = async (bookingId) => {
    try {
      const result = await updateBookingStatus(bookingId, 'confirmed', {
        confirmedBy: user.uid
      });
      
      if (result.success) {
        Alert.alert('Success', 'Booking confirmed successfully!');
        // Reload bookings to reflect the change
        loadBookings();
      } else {
        Alert.alert('Error', 'Failed to confirm booking: ' + result.error);
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      Alert.alert('Error', 'Failed to confirm booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    Alert.prompt(
      'Reject Booking',
      'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: async (rejectionReason) => {
            try {
              const result = await updateBookingStatus(bookingId, 'rejected', {
                rejectedBy: user.uid,
                rejectionReason: rejectionReason || 'No reason provided'
              });
              
              if (result.success) {
                Alert.alert('Success', 'Booking rejected successfully!');
                // Reload bookings to reflect the change
                loadBookings();
              } else {
                Alert.alert('Error', 'Failed to reject booking: ' + result.error);
              }
            } catch (error) {
              console.error('Error rejecting booking:', error);
              Alert.alert('Error', 'Failed to reject booking');
            }
          }
        }
      ],
      'plain-text',
      'Schedule conflict'
    );
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      const result = await updateBookingStatus(bookingId, 'completed', {
        completedBy: user.uid
      });
      
      if (result.success) {
        Alert.alert('Success', 'Booking marked as completed!');
        // Reload bookings to reflect the change
        loadBookings();
      } else {
        Alert.alert('Error', 'Failed to mark booking as completed: ' + result.error);
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      Alert.alert('Error', 'Failed to mark booking as completed');
    }
  };

  const showBookingDetails = (booking) => {
    const details = [
      `Subject: ${booking.subject || 'Not specified'}`,
      `Venue: ${booking.venue || 'Location TBD'}`,
      `Date: ${formatDate(booking.examDate)}`,
      `Duration: ${booking.examDuration ? Math.round(booking.examDuration / 60) + ' hours' : 'Not specified'}`,
      `Status: ${getStatusText(booking.status)}`,
      `Type: ${booking.examType || 'Not specified'}`,
      `Notes: ${booking.notes || 'No additional notes'}`,
    ];

    if (userRole === 'scribe') {
      details.push(`Student: ${booking.studentName || 'Unknown'}`);
      if (booking.studentEmail) details.push(`Student Email: ${booking.studentEmail}`);
      if (booking.studentPhone) details.push(`Student Phone: ${booking.studentPhone}`);
    } else {
      details.push(`Scribe: ${booking.scribeName || 'Unknown'}`);
      if (booking.scribeEmail) details.push(`Scribe Email: ${booking.scribeEmail}`);
      if (booking.scribePhone) details.push(`Scribe Phone: ${booking.scribePhone}`);
    }

    if (booking.status === 'confirmed' && booking.confirmedAt) {
      details.push(`Confirmed on: ${new Date(booking.confirmedAt.toDate ? booking.confirmedAt.toDate() : booking.confirmedAt).toLocaleDateString()}`);
    }

    if (booking.status === 'rejected' && booking.rejectionReason) {
      details.push(`Rejection Reason: ${booking.rejectionReason}`);
    }

    Alert.alert(
      'Booking Details',
      details.join('\n'),
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.bookingItem, 
        { 
          backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
          borderColor: isDarkMode ? '#404040' : '#e5e7eb'
        }
      ]}
      onPress={() => showBookingDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.bookingInfo}>
        <Text style={[styles.examName, { color: isDarkMode ? '#fff' : '#11181C' }]}>
          {item.subject || 'Exam'}
        </Text>
        <Text style={[styles.examLocation, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
          {item.venue || 'Location TBD'}
        </Text>
        
        {/* Show student info for scribes, scribe info for students */}
        {userRole === 'scribe' ? (
          <Text style={[styles.studentName, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
            Student: {item.studentName || 'Unknown'}
          </Text>
        ) : (
          <Text style={[styles.scribeName, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
            Scribe: {item.scribeName || 'Unknown'}
          </Text>
        )}
        
        {/* Show additional details */}
        {item.examType && (
          <Text style={[styles.examType, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
            Type: {item.examType}
          </Text>
        )}
        
        {item.examDuration && (
          <Text style={[styles.examDuration, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
            Duration: {Math.round(item.examDuration / 60)} hours
          </Text>
        )}
        
        {item.notes && (
          <Text style={[styles.notes, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
            Notes: {item.notes}
          </Text>
        )}
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#6c757d" style={styles.chevronIcon} />
        </View>
        
        {/* Show status-specific information */}
        {item.status === 'confirmed' && item.confirmedAt && (
          <Text style={[styles.statusInfo, { color: isDarkMode ? '#10b981' : '#059669' }]}>
            Confirmed on {new Date(item.confirmedAt.toDate ? item.confirmedAt.toDate() : item.confirmedAt).toLocaleDateString()}
          </Text>
        )}
        
        {item.status === 'rejected' && item.rejectionReason && (
          <Text style={[styles.statusInfo, { color: isDarkMode ? '#ef4444' : '#dc2626' }]}>
            Reason: {item.rejectionReason}
          </Text>
        )}
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
        
        {/* Action buttons for scribes */}
        {userRole === 'scribe' && item.status === 'pending' && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleConfirmBooking(item.id)}
            >
              <Text style={styles.actionButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectBooking(item.id)}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Action button for completed bookings */}
        {userRole === 'scribe' && item.status === 'confirmed' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleCompleteBooking(item.id)}
          >
            <Text style={styles.actionButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
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
            <View>
              <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                {userRole === 'scribe' ? 'My Bookings' : 'My Calendar'}
              </Text>
              {bookings.length > 0 && (
                <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  {bookings.length} {userRole === 'scribe' ? 'bookings' : 'exams'}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadBookings}
              disabled={isLoading}
            >
              <Ionicons 
                name="refresh" 
                size={16} 
                color={isLoading ? "#9ca3af" : "#8b5cf6"} 
              />
            </TouchableOpacity>
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
              {lastUpdated && (
                <Text style={[styles.lastUpdated, { color: isDarkMode ? '#999' : '#9ca3af' }]}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              )}
            </View>
          </View>

          {/* Summary Section */}
          <View style={[styles.summarySection, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                {bookings.filter(b => b.status === 'pending').length}
              </Text>
              <Text style={[styles.summaryLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                Pending
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                {bookings.filter(b => b.status === 'confirmed').length}
              </Text>
              <Text style={[styles.summaryLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                Confirmed
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                {bookings.filter(b => b.status === 'completed').length}
              </Text>
              <Text style={[styles.summaryLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                Completed
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
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  refreshButton: {
    padding: 8,
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
  lastUpdated: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
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
  scribeName: {
    fontSize: 14,
    marginBottom: 8,
  },
  examType: {
    fontSize: 14,
    marginBottom: 4,
  },
  examDuration: {
    fontSize: 14,
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  statusInfo: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
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
  chevronIcon: {
    marginLeft: 8,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  completeButton: {
    backgroundColor: '#8b5cf6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
