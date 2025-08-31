import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

export default function BookScribeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { user, createBooking, isAuthenticated } = useFirebase();
  
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [examDetails, setExamDetails] = useState({
    subject: '',
    board: '',
    venue: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  
  // Get scribe data from navigation params if available
  const scribeData = route.params?.scribe;

  // Check if scribe data is available
  useEffect(() => {
    if (!scribeData) {
      Alert.alert('Error', 'No scribe selected. Please go back and select a scribe.');
      navigation.goBack();
      return;
    }
    console.log('Scribe selected:', scribeData.name);
  }, [scribeData, navigation]);

  const timeSlots = [
    'Mon 10:00', 'Tue 14:00', 'Wed 09:00',
    'Thu 11:00', 'Fri 15:00', 'Sat 08:00'
  ];

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleInputChange = (field, value) => {
    setExamDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft functionality
    console.log('Saving draft...');
  };

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to book a scribe');
      return;
    }

    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    if (!examDetails.subject || !examDetails.venue) {
      Alert.alert('Error', 'Please fill in all required fields (Subject and Venue)');
      return;
    }

    try {
      setIsLoading(true);
      
      // Parse the selected slot to get date and time
      const slotParts = selectedSlot.split(' ');
      const day = slotParts[0];
      const time = slotParts[1];
      
      // Create a proper date object (this is a simplified approach)
      const today = new Date();
      const dayMap = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 0 };
      const targetDay = dayMap[day];
      
      // Find next occurrence of the selected day
      let targetDate = new Date(today);
      while (targetDate.getDay() !== targetDay) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      
      // Set the time
      const [hours, minutes] = time.split(':');
      targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
             const bookingData = {
         scribeId: scribeData?.id || 'general',
         scribeName: scribeData?.name || 'Selected Scribe',
         studentId: user.uid,
         studentName: user.displayName || user.email?.split('@')[0] || 'Student',
         status: 'pending',
         examDate: targetDate,
         examDuration: 120, // Default 2 hours
         subject: examDetails.subject,
         board: examDetails.board,
         venue: examDetails.venue,
         specialRequirements: examDetails.notes,
         totalAmount: scribeData?.hourlyRate || 500, // Default amount
         createdAt: serverTimestamp(),
         updatedAt: serverTimestamp()
       };

             console.log('Creating booking with data:', bookingData);
       const result = await createBooking(bookingData);
       console.log('Booking result:', result);
       
               if (result.success) {
          // Set the current booking data for the modal
          setCurrentBooking({
            ...bookingData,
            id: result.data?.id || 'temp-id',
            status: 'pending'
          });
          
          // Show the booking confirmation modal
          setShowBookingModal(true);
          
          // Reset form
          setSelectedSlot(null);
          setExamDetails({
            subject: '',
            board: '',
            venue: '',
            notes: ''
          });
        } else {
          Alert.alert('Error', 'Failed to create booking. Please try again.');
        }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  // If no scribe data, show error or redirect
  if (!scribeData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={[styles.errorText, { color: isDarkMode ? '#fff' : '#11181C' }]}>
            No scribe selected
          </Text>
          <Text style={[styles.errorSubtext, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
            Please go back and select a scribe to book
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
              {scribeData?.name ? `Book ${scribeData.name}` : 'Book a Scribe'}
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

        {/* Select Slot Section */}
        <View style={[styles.section, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Select slot</Text>
          <Text style={[styles.sectionSubtitle, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Pick an available date & time</Text>
          
          <View style={styles.timeSlotsGrid}>
            {timeSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlotButton,
                  selectedSlot === slot && styles.selectedTimeSlot,
                  { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }
                ]}
                onPress={() => handleSlotSelect(slot)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedSlot === slot && styles.selectedTimeSlotText,
                  { color: isDarkMode ? '#ccc' : '#6c757d' }
                ]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exam Details Section */}
        <View style={[styles.section, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Exam details</Text>
          
          <View style={styles.formGrid}>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Subject</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}
                  placeholder="e.g., Economics HL"
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                  value={examDetails.subject}
                  onChangeText={(value) => handleInputChange('subject', value)}
                />
              </View>
              
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Board/Exam</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}
                  placeholder="IB / CBSE / State"
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                  value={examDetails.board}
                  onChangeText={(value) => handleInputChange('board', value)}
                />
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Venue</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}
                  placeholder="School name / center"
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                  value={examDetails.venue}
                  onChangeText={(value) => handleInputChange('venue', value)}
                />
              </View>
              
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Notes</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}
                  placeholder="Any accommodations or instructions"
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                  value={examDetails.notes}
                  onChangeText={(value) => handleInputChange('notes', value)}
                  multiline
                />
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveDraftButton} onPress={handleSaveDraft}>
            <Text style={styles.saveDraftText}>Save draft</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={handleConfirmBooking}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.confirmText}>Confirm booking</Text>
            )}
          </TouchableOpacity>
                 </View>
       </ScrollView>

       {/* Booking Confirmation Modal */}
       {showBookingModal && currentBooking && (
         <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
             <View style={styles.modalHeader}>
               <Ionicons name="checkmark-circle" size={48} color="#10b981" />
               <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                 Booking Confirmed!
               </Text>
               <Text style={[styles.modalSubtitle, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                 Your booking has been successfully created
               </Text>
             </View>

             <View style={styles.bookingDetailsContainer}>
               <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                 Booking Details
               </Text>
               
               <View style={styles.bookingDetailRow}>
                 <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Scribe:</Text>
                 <Text style={[styles.detailValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                   {currentBooking.scribeName}
                 </Text>
               </View>
               
               <View style={styles.bookingDetailRow}>
                 <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Subject:</Text>
                 <Text style={[styles.detailValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                   {currentBooking.subject}
                 </Text>
               </View>
               
               <View style={styles.bookingDetailRow}>
                 <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Date:</Text>
                 <Text style={[styles.detailValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                   {new Date(currentBooking.examDate).toLocaleDateString('en-US', { 
                     weekday: 'long', 
                     year: 'numeric', 
                     month: 'long', 
                     day: 'numeric' 
                   })}
                 </Text>
               </View>
               
               <View style={styles.bookingDetailRow}>
                 <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Time:</Text>
                 <Text style={[styles.detailValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                   {new Date(currentBooking.examDate).toLocaleTimeString('en-US', { 
                     hour: '2-digit', 
                     minute: '2-digit',
                     hour12: true 
                   })}
                 </Text>
               </View>
               
               <View style={styles.bookingDetailRow}>
                 <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Venue:</Text>
                 <Text style={[styles.detailValue, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                   {currentBooking.venue}
                 </Text>
               </View>
               
               <View style={styles.bookingDetailRow}>
                 <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Amount:</Text>
                 <Text style={[styles.detailValue, { color: '#8b5cf6', fontWeight: '600' }]}>
                   ₹{currentBooking.totalAmount}
                 </Text>
               </View>
               
               <View style={styles.bookingDetailRow}>
                 <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Status:</Text>
                 <View style={[styles.statusBadge, { backgroundColor: '#f59e0b' }]}>
                   <Text style={styles.statusText}>Pending</Text>
                 </View>
               </View>
             </View>

             <View style={styles.modalActions}>
               <TouchableOpacity 
                 style={styles.modalButton}
                 onPress={() => {
                   setShowBookingModal(false);
                   setCurrentBooking(null);
                 }}
               >
                 <Text style={styles.modalButtonText}>Close</Text>
               </TouchableOpacity>
               
               <TouchableOpacity 
                 style={[styles.modalButton, styles.primaryModalButton]}
                 onPress={() => {
                   setShowBookingModal(false);
                   setCurrentBooking(null);
                   navigation.navigate('MyCalendar');
                 }}
               >
                 <Text style={[styles.modalButtonText, { color: '#fff' }]}>View My Calendar</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       )}
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
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlotButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: '30%',
  },
  selectedTimeSlot: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  formGrid: {
    gap: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  formField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 44,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  saveDraftButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveDraftText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  backButtonText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  bookingDetailsContainer: {
    marginBottom: 24,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  primaryModalButton: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
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
});
