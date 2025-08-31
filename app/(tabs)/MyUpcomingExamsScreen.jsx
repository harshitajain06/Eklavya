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

export default function MyUpcomingExamsScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const upcomingExams = [
    {
      id: 1,
      name: 'Math Mock Exam',
      details: 'Room 204',
      time: 'Tue 10:00'
    },
    {
      id: 2,
      name: 'IB Hindi IA',
      details: 'Hall A',
      time: 'Fri 14:00'
    },
    {
      id: 3,
      name: 'Economics Paper 1',
      details: 'Center 12',
      time: 'Mon 09:00'
    }
  ];

  const handleImportFromGoogle = () => {
    // TODO: Implement Google Calendar import
    console.log('Importing from Google Calendar...');
  };

  const handleAddExam = () => {
    // TODO: Implement add exam functionality
    console.log('Adding new exam...');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="expand" size={20} color="#6c757d" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#6c757d" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>My Calendar</Text>
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
            <TouchableOpacity style={styles.layoutButton}>
              <Ionicons name="square" size={20} color="#6c757d" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Upcoming Exams Card */}
          <View style={[styles.examsCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#11181C' }]}>Upcoming exams</Text>
              <Text style={[styles.cardSubtitle, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>Your scheduled assessments</Text>
            </View>
            
            <View style={styles.examsList}>
              {upcomingExams.map((exam) => (
                <View key={exam.id} style={styles.examItem}>
                  <View style={styles.examInfo}>
                    <Text style={[styles.examName, { color: isDarkMode ? '#fff' : '#11181C' }]}>
                      {exam.name}
                    </Text>
                    <Text style={[styles.examDetails, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                      {exam.details}
                    </Text>
                  </View>
                  <Text style={[styles.examTime, { color: isDarkMode ? '#ccc' : '#6c757d' }]}>
                    {exam.time}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.importButton}
                onPress={handleImportFromGoogle}
              >
                <Text style={styles.importButtonText}>Import from Google Calendar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.addExamButton}
                onPress={handleAddExam}
              >
                <Text style={styles.addExamButtonText}>Add exam</Text>
              </TouchableOpacity>
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
  layoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  examsCard: {
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#6c757d',
  },
  examsList: {
    marginBottom: 32,
  },
  examItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  examInfo: {
    flex: 1,
  },
  examName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  examDetails: {
    fontSize: 14,
  },
  examTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  importButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
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
    flex: 1,
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addExamButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});