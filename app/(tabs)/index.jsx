// AuthPage.jsx
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  ActivityIndicator, Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../../config/Firebase';

export default function AuthPage() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';

  const [user, loading, error] = useAuthState(auth);

  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [role, setRole] = useState('student');

  const db = getFirestore();

  useEffect(() => {
    if (user) {
      navigation.replace('Drawer');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      return Alert.alert('Error', 'Please fill all fields.');
    }
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      
      // Check if user profile exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        // Create a default profile if it doesn't exist
        const userData = {
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || loginEmail.split('@')[0],
          email: loginEmail,
          role: role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      }
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) {
      return Alert.alert('Error', 'Please fill all fields.');
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: registerName,
      });

      // Create user document in Firestore
      const userData = {
        uid: userCredential.user.uid,
        name: registerName,
        email: registerEmail,
        role: role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // If user is registering as a scribe, create scribe profile
      if (role === 'scribe') {
        const scribeData = {
          name: registerName,
          email: registerEmail,
          languages: ['English'], // Default language
          subjects: [], // Empty subjects array
          city: '',
          isAvailable: true,
          rating: 0,
          totalBookings: 0,
          bio: '',
          experience: '',
          hourlyRate: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, 'scribes', userCredential.user.uid), scribeData);
      }

      setIsLoading(false);
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container, 
        isDarkMode && { backgroundColor: '#121212' },
        isWeb && styles.webContainer
      ]} 
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.contentWrapper, isWeb && styles.webContentWrapper]}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🛡️</Text>
          </View>
        </View>
        
        <Text style={[styles.title, isDarkMode && { color: '#fff' }]}>Welcome back</Text>
        <Text style={[styles.subtitle, isDarkMode && { color: '#ccc' }]}>Sign in with your account</Text>

        <View style={[styles.tabContainer, isWeb && styles.webTabContainer]}>
          <TouchableOpacity 
            onPress={() => setMode('login')} 
            style={[styles.tab, mode === 'login' && styles.activeTabBackground]}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setMode('register')} 
            style={[styles.tab, mode === 'register' && styles.activeTabBackground]}
          >
            <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Register</Text>
          </TouchableOpacity>
        </View>

        {mode === 'login' ? (
          <View style={[styles.form, isWeb && styles.webForm]}>
            <Text style={[styles.roleLabel, isDarkMode && { color: '#ccc' }]}>Sign in as:</Text>
            <View style={[styles.roleContainer, isWeb && styles.webRoleContainer]}>
              <TouchableOpacity 
                onPress={() => setRole('student')} 
                style={[styles.roleOption, role === 'student' && styles.selectedRole]}
              >
                <Text style={[styles.roleText, role === 'student' && styles.selectedRoleText]}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setRole('scribe')} 
                style={[styles.roleOption, role === 'scribe' && styles.selectedRole]}
              >
                <Text style={[styles.roleText, role === 'scribe' && styles.selectedRoleText]}>Scribe</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, isDarkMode && { color: '#ccc' }]}>Email</Text>
            <TextInput 
              placeholder="name@example.com" 
              style={[
                styles.input, 
                isDarkMode && { backgroundColor: '#2a2a2a', color: '#fff' },
                isWeb && styles.webInput
              ]} 
              value={loginEmail} 
              onChangeText={setLoginEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" 
            />
            
            <Text style={[styles.label, isDarkMode && { color: '#ccc' }]}>Password</Text>
            <TextInput 
              placeholder="••••••••" 
              secureTextEntry 
              style={[
                styles.input, 
                isDarkMode && { backgroundColor: '#2a2a2a', color: '#fff' },
                isWeb && styles.webInput
              ]} 
              value={loginPassword} 
              onChangeText={setLoginPassword} 
            />
            
            <TouchableOpacity 
              onPress={handleLogin} 
              style={[styles.button, isWeb && styles.webButton]} 
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
            </TouchableOpacity>

            <View style={styles.divider}>
              <Text style={[styles.dividerText, isDarkMode && { color: '#ccc' }]}>or</Text>
            </View>

            <TouchableOpacity style={[styles.googleButton, isWeb && styles.webGoogleButton]}>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.createAccount}>
              <Text style={[styles.createAccountText, isDarkMode && { color: '#ccc' }]}>New here? </Text>
              <TouchableOpacity onPress={() => setMode('register')}>
                <Text style={styles.createAccountLink}>Create an account</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.form, isWeb && styles.webForm]}>
            <Text style={[styles.label, isDarkMode && { color: '#ccc' }]}>Full Name</Text>
            <TextInput 
              placeholder="John Doe" 
              style={[
                styles.input, 
                isDarkMode && { backgroundColor: '#2a2a2a', color: '#fff' },
                isWeb && styles.webInput
              ]} 
              value={registerName} 
              onChangeText={setRegisterName} 
            />
            
            <Text style={[styles.label, isDarkMode && { color: '#ccc' }]}>Email</Text>
            <TextInput 
              placeholder="name@example.com" 
              style={[
                styles.input, 
                isDarkMode && { backgroundColor: '#2a2a2a', color: '#fff' },
                isWeb && styles.webInput
              ]} 
              value={registerEmail} 
              onChangeText={setRegisterEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" 
            />
            
            <Text style={[styles.label, isDarkMode && { color: '#ccc' }]}>Password</Text>
            <TextInput 
              placeholder="••••••••" 
              secureTextEntry 
              style={[
                styles.input, 
                isDarkMode && { backgroundColor: '#2a2a2a', color: '#fff' },
                isWeb && styles.webInput
              ]} 
              value={registerPassword} 
              onChangeText={setRegisterPassword} 
            />

            <Text style={[styles.label, isDarkMode && { color: '#ccc' }]}>Select Role</Text>
            <View style={[styles.roleContainer, isWeb && styles.webRoleContainer]}>
              <TouchableOpacity onPress={() => setRole('student')} style={[styles.roleOption, role === 'student' && styles.selectedRole]}>
                <Text style={[styles.roleText, role === 'student' && styles.selectedRoleText]}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRole('scribe')} style={[styles.roleOption, role === 'scribe' && styles.selectedRole]}>
                <Text style={[styles.roleText, role === 'scribe' && styles.selectedRoleText]}>Scribe</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={handleRegister} 
              style={[styles.button, isWeb && styles.webButton]} 
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  webContainer: {
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  webContentWrapper: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  iconContainer: { 
    alignItems: 'center', 
    marginBottom: 16 
  },
  iconCircle: { 
    backgroundColor: '#e6f0ff', 
    padding: 12, 
    borderRadius: 999 
  },
  icon: { 
    fontSize: 32, 
    color: '#007bff' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 8,
    color: '#11181C'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6c757d'
  },
  tabContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginBottom: 32, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 12 
  },
  webTabContainer: {
    marginBottom: 40,
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 12 
  },
  activeTabBackground: { 
    backgroundColor: '#e6f0ff' 
  },
  tabText: { 
    fontSize: 16, 
    color: '#6c757d', 
    fontWeight: '600' 
  },
  activeTabText: { 
    color: '#007bff' 
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#11181C'
  },
  label: { 
    marginBottom: 6, 
    fontWeight: '500', 
    color: '#11181C',
    fontSize: 16
  },
  form: { 
    marginBottom: 30 
  },
  webForm: {
    marginBottom: 0,
  },
  input: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    fontSize: 16 
  },
  webInput: {
    padding: 18,
    fontSize: 16,
    marginBottom: 20,
  },
  roleContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 24, 
    gap: 12 
  },
  webRoleContainer: {
    marginBottom: 32,
  },
  roleOption: { 
    flex: 1, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 12, 
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  selectedRole: { 
    backgroundColor: '#8b5cf6', 
    borderColor: '#8b5cf6' 
  },
  roleText: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#6c757d'
  },
  selectedRoleText: {
    color: '#fff'
  },
  button: { 
    backgroundColor: '#8b5cf6', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginBottom: 24
  },
  webButton: {
    padding: 18,
    marginBottom: 32,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  divider: {
    alignItems: 'center',
    marginBottom: 24
  },
  dividerText: {
    fontSize: 16,
    color: '#6c757d',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8b5cf6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24
  },
  webGoogleButton: {
    padding: 18,
    marginBottom: 32,
  },
  googleButtonText: {
    color: '#8b5cf6',
    fontWeight: '600',
    fontSize: 16
  },
  createAccount: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  createAccountText: {
    fontSize: 16,
    color: '#6c757d'
  },
  createAccountLink: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});
