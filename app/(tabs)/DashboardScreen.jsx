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

export default function DashboardScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { user, getUser, getUpcomingBookings, getUserBookings, isAuthenticated } = useFirebase();

  const [userProfile, setUserProfile] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated:', user);
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load user profile first
      const userResult = await getUser(user?.uid);
      console.log('User result:', userResult);
      
      if (userResult.success) {
        console.log('User profile loaded:', userResult.data);
        setUserProfile(userResult.data);
        
        // Now load bookings with the user's role
        const userRole = userResult.data.role || 'student';
        console.log('User role:', userRole);
        
        // Load upcoming bookings
        const upcomingResult = await getUpcomingBookings(user?.uid, userRole);
        if (upcomingResult.success) {
          setUpcomingBookings(upcomingResult.data.slice(0, 3)); // Show only 3 upcoming
        }

        // Load recent bookings
        const recentResult = await getUserBookings(user?.uid, userRole);
        if (recentResult.success) {
          setRecentBookings(recentResult.data.slice(0, 3)); // Show only 3 recent
        }
      } else {
        console.error('Failed to load user profile:', userResult.error);
        Alert.alert('Error', 'Failed to load user profile');
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRequest = () => {
    // TODO: Navigate to booking screen
    if (userProfile?.role === 'student') {
      // For students, navigate to Find Scribe
      navigation.navigate('Find Scribe');
    } else {
      Alert.alert('New Request', 'Navigate to booking screen');
    }
  };

  const handleSetAvailability = () => {
    // TODO: Navigate to availability settings
    Alert.alert('Set Availability', 'Navigate to availability settings');
  };

  const handleViewAllBookings = () => {
    // TODO: Navigate to all bookings screen
    if (userProfile?.role === 'student') {
      // For students, navigate to My Calendar
      navigation.navigate('MyCalendar');
    } else {
      Alert.alert('View All', 'Navigate to all bookings screen');
    }
  };

  const handleQuickAction = (action) => {
    Alert.alert('Quick Action', `${action} clicked`);
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={[styles.loadingText, { color: isDarkMode ? '#fff' : '#11181C' }]}>
            Loading dashboard...
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
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
              Welcome back, {userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User'}!
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
              {userProfile?.role === 'scribe' ? 'Manage your scribe services' : (userProfile?.role === 'student' ? 'Track your exam bookings' : 'Welcome to Eklavya')}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#6c757d" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={24} color="#6c757d" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Cards - Show for students */}
        {userProfile?.role === 'student' && (
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <View style={styles.summaryIcon}>
                <Ionicons name="calendar-outline" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryNumber, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                  {upcomingBookings.length}
                </Text>
                <Text style={[styles.summaryLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  Upcoming
                </Text>
              </View>
            </View>
            
            <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <View style={styles.summaryIcon}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
              </View>
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryNumber, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                  {recentBookings.filter(b => b.status === 'confirmed').length}
                </Text>
                <Text style={[styles.summaryLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  Confirmed
                </Text>
              </View>
            </View>
            
            <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <View style={styles.summaryIcon}>
                <Ionicons name="time-outline" size={24} color="#f59e0b" />
              </View>
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryNumber, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                  {recentBookings.filter(b => b.status === 'pending').length}
                </Text>
                <Text style={[styles.summaryLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  Pending
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.content}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* New Requests / Set Availability */}
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                {userProfile?.role === 'scribe' ? 'New Requests' : 'Book a Scribe'}
              </Text>
              <Text style={[styles.cardSubtitle, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                {userProfile?.role === 'scribe' 
                  ? 'View and respond to new booking requests' 
                  : 'Find and book a qualified scribe for your exam'
                }
              </Text>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleNewRequest}
              >
                <Text style={styles.primaryButtonText}>
                  {userProfile?.role === 'scribe' ? 'View Requests' : 'Book Now'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Set Availability (Scribe only) */}
            {userProfile?.role === 'scribe' && (
              <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                  Set Availability
                </Text>
                <Text style={[styles.cardSubtitle, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  Update your availability and working hours
                </Text>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleSetAvailability}>
                  <Text style={styles.secondaryButtonText}>Update Schedule</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Announcements */}
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                Announcements
              </Text>
              <View style={styles.announcementItem}>
                <Ionicons name="megaphone" size={16} color="#8b5cf6" />
                <Text style={[styles.announcementText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  New safety guidelines for in-person exams
                </Text>
              </View>
              <View style={styles.announcementItem}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={[styles.announcementText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                  Rate your scribe after exam completion
                </Text>
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Upcoming */}
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                  {userProfile?.role === 'student' ? 'Upcoming Bookings' : 'Upcoming'}
                </Text>
                <TouchableOpacity onPress={handleViewAllBookings}>
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              </View>
              
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking, index) => (
                  <View key={booking.id} style={[styles.bookingItem, index < upcomingBookings.length - 1 && styles.bookingItemWithBorder]}>
                    <View style={styles.bookingInfo}>
                      {userProfile?.role === 'student' ? (
                        // Student view - show scribe details
                        <>
                          <Text style={[styles.bookingTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                            {booking.scribeName || 'Scribe TBD'}
                          </Text>
                          <Text style={[styles.bookingSubject, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                            {booking.subject || 'Subject TBD'}
                          </Text>
                          <Text style={[styles.bookingDetails, { color: isDarkMode ? '#999' : '#9ca3af' }]}>
                            {new Date(booking.examDate?.toDate() || booking.examDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })} • {new Date(booking.examDate?.toDate() || booking.examDate).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            })} • {booking.venue || 'Venue TBD'}
                          </Text>
                          {booking.examDuration && (
                            <Text style={[styles.bookingDuration, { color: isDarkMode ? '#999' : '#9ca3af' }]}>
                              Duration: {Math.round(booking.examDuration / 60)}h
                            </Text>
                          )}
                        </>
                      ) : (
                        // Scribe view - show exam details
                        <>
                          <Text style={[styles.bookingTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                            Exam: {booking.subject || 'General'}
                          </Text>
                          <Text style={[styles.bookingDetails, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                            {new Date(booking.examDate?.toDate() || booking.examDate).toLocaleDateString()} • {booking.venue || 'Venue TBD'}
                          </Text>
                        </>
                      )}
                    </View>
                    <View style={styles.bookingRight}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
                      </View>
                      {userProfile?.role === 'student' && booking.totalAmount && (
                        <Text style={[styles.bookingAmount, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                          ₹{booking.totalAmount}
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noBookingsContainer}>
                  <Ionicons 
                    name={userProfile?.role === 'student' ? 'calendar-outline' : 'book-outline'} 
                    size={32} 
                    color="#6c757d" 
                  />
                  <Text style={[styles.noBookingsText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    {userProfile?.role === 'scribe' 
                      ? 'No upcoming exams' 
                      : 'No upcoming bookings'
                    }
                  </Text>
                  <Text style={[styles.noBookingsSubtext, { color: isDarkMode ? '#999' : '#9ca3af' }]}>
                    {userProfile?.role === 'scribe' 
                      ? 'Students will appear here when they book you' 
                      : 'Book a scribe to see your upcoming exams here'
                    }
                  </Text>
                </View>
              )}
            </View>

            {/* Recent Bookings - Show for students */}
            {userProfile?.role === 'student' && recentBookings.length > 0 && (
              <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                    Recent Bookings
                  </Text>
                  <TouchableOpacity onPress={handleViewAllBookings}>
                    <Text style={styles.viewAllText}>View all</Text>
                  </TouchableOpacity>
                </View>
                
                {recentBookings.slice(0, 2).map((booking, index) => (
                  <View key={booking.id} style={[styles.bookingItem, index < Math.min(recentBookings.length, 2) - 1 && styles.bookingItemWithBorder]}>
                    <View style={styles.bookingInfo}>
                      <Text style={[styles.bookingTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                        {booking.scribeName || 'Scribe TBD'}
                      </Text>
                      <Text style={[styles.bookingSubject, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                        {booking.subject || 'Subject TBD'}
                      </Text>
                      <Text style={[styles.bookingDetails, { color: isDarkMode ? '#999' : '#9ca3af' }]}>
                        {new Date(booking.examDate?.toDate() || booking.examDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} • {booking.venue || 'Venue TBD'}
                      </Text>
                    </View>
                    <View style={styles.bookingRight}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Quick Links */}
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                Quick Links
              </Text>
              <View style={styles.quickLinksGrid}>
                <TouchableOpacity 
                  style={styles.quickLinkItem} 
                  onPress={() => handleQuickAction('Resources')}
                >
                  <Ionicons name="library-outline" size={24} color="#8b5cf6" />
                  <Text style={[styles.quickLinkText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    Resources
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickLinkItem} 
                  onPress={() => handleQuickAction('Calendar')}
                >
                  <Ionicons name="calendar-outline" size={24} color="#8b5cf6" />
                  <Text style={[styles.quickLinkText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    Calendar
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickLinkItem} 
                  onPress={() => handleQuickAction('Support')}
                >
                  <Ionicons name="help-circle-outline" size={24} color="#8b5cf6" />
                  <Text style={[styles.quickLinkText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    Support
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickLinkItem} 
                  onPress={() => handleQuickAction('Settings')}
                >
                  <Ionicons name="settings-outline" size={24} color="#8b5cf6" />
                  <Text style={[styles.quickLinkText, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    Settings
                  </Text>
                </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    padding: 8,
  },
  profileButton: {
    padding: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContent: {
    flex: 1,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  leftColumn: {
    flex: 1,
    gap: 20,
  },
  rightColumn: {
    flex: 1,
    gap: 20,
  },
  card: {
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '600',
  },
  announcementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  announcementText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  bookingItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  bookingInfo: {
    flex: 1,
    marginRight: 16,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingSubject: {
    fontSize: 14,
    marginBottom: 6,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  bookingDetails: {
    fontSize: 13,
    marginBottom: 4,
  },
  bookingDuration: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  bookingRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookingAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  noBookingsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noBookingsText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  noBookingsSubtext: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickLinkItem: {
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  quickLinkText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
