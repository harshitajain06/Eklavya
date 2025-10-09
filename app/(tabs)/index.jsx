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
import EklavyaLogo from '../../components/EklavyaLogo';
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
  const [loginErrors, setLoginErrors] = useState({});

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerErrors, setRegisterErrors] = useState({});
  const [role, setRole] = useState('student');

  const db = getFirestore();

  useEffect(() => {
    if (user) {
      navigation.replace('Drawer');
    }
  }, [user]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validateLoginForm = () => {
    const errors = {};
    
    if (!loginEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginEmail)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!loginPassword) {
      errors.password = 'Password is required';
    } else if (!validatePassword(loginPassword)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};
    
    if (!registerName.trim()) {
      errors.name = 'Full name is required';
    } else if (!validateName(registerName)) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!registerEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(registerEmail)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!registerPassword) {
      errors.password = 'Password is required';
    } else if (!validatePassword(registerPassword)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) {
      return;
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
    if (!validateRegisterForm()) {
      return;
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
        <View style={styles.logoContainer}>
          <EklavyaLogo size={isWeb ? 60 : 50} color="#8b5cf6" />
        </View>
        
        <Text style={[styles.title, isDarkMode && { color: '#fff' }]}>Eklavya</Text>
        <Text style={[styles.subtitle, isDarkMode && { color: '#ccc' }]}>
          {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
        </Text>

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
                isWeb && styles.webInput,
                loginErrors.email && styles.inputError
              ]} 
              value={loginEmail} 
              onChangeText={(text) => {
                setLoginEmail(text);
                if (loginErrors.email) {
                  setLoginErrors({ ...loginErrors, email: '' });
                }
              }} 
              keyboardType="email-address" 
              autoCapitalize="none" 
            />
            {loginErrors.email && <Text style={styles.errorText}>{loginErrors.email}</Text>}
            
            <Text style={[styles.label, isDarkMode && { color: '#ccc' }]}>Password</Text>
            <TextInput 
              placeholder="••••••••" 
              secureTextEntry 
              style={[
                styles.input, 
                isDarkMode && { backgroundColor: '#2a2a2a', color: '#fff' },
                isWeb && styles.webInput,
                loginErrors.password && styles.inputError
              ]} 
              value={loginPassword} 
              onChangeText={(text) => {
                setLoginPassword(text);
                if (loginErrors.password) {
                  setLoginErrors({ ...loginErrors, password: '' });
                }
              }} 
            />
            {loginErrors.password && <Text style={styles.errorText}>{loginErrors.password}</Text>}
            
            <TouchableOpacity 
              onPress={handleLogin} 
              style={[styles.button, isWeb && styles.webButton]} 
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
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
                isWeb && styles.webInput,
                registerErrors.name && styles.inputError
              ]} 
              value={registerName} 
              onChangeText={(text) => {
                setRegisterName(text);
                if (registerErrors.name) {
                  setRegisterErrors({ ...registerErrors, name: '' });
                }
              }} 
            />
            {registerErrors.name && <Text style={styles.errorText}>{registerErrors.name}</Text>}
            
            <Text style={[styles.label, isDarkMode && { color: '#ccc' }]}>Email</Text>
            <TextInput 
              placeholder="name@example.com" 
              style={[
                styles.input, 
                isDarkMode && { backgroundColor: '#2a2a2a', color: '#fff' },
                isWeb && styles.webInput,
                registerErrors.email && styles.inputError
              ]} 
              value={registerEmail} 
              onChangeText={(text) => {
                setRegisterEmail(text);
                if (registerErrors.email) {
                  setRegisterErrors({ ...registerErrors, email: '' });
                }
              }} 
              keyboardType="email-address" 
              autoCapitalize="none" 
            />
            {registerErrors.email && <Text style={styles.errorText}>{registerErrors.email}</Text>}
            
            <Text style={[styles.label, isDarkMode && { color: '#ccc' }]}>Password</Text>
            <TextInput 
              placeholder="••••••••" 
              secureTextEntry 
              style={[
                styles.input, 
                isDarkMode && { backgroundColor: '#2a2a2a', color: '#fff' },
                isWeb && styles.webInput,
                registerErrors.password && styles.inputError
              ]} 
              value={registerPassword} 
              onChangeText={(text) => {
                setRegisterPassword(text);
                if (registerErrors.password) {
                  setRegisterErrors({ ...registerErrors, password: '' });
                }
              }} 
            />
            {registerErrors.password && <Text style={styles.errorText}>{registerErrors.password}</Text>}

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
    padding: 8,
    paddingTop: 16,
    backgroundColor: '#f8fafc',
    minHeight: '100%',
    flex: 1,
  },
  webContainer: {
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
    flex: 1,
    justifyContent: 'center',
  },
  webContentWrapper: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: '90vh',
    overflow: 'hidden',
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 12 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 4,
    color: '#11181C'
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16,
    color: '#6c757d'
  },
  tabContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginBottom: 16, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 8 
  },
  webTabContainer: {
    marginBottom: 20,
  },
  tab: { 
    flex: 1, 
    paddingVertical: 8, 
    alignItems: 'center', 
    borderRadius: 8 
  },
  activeTabBackground: { 
    backgroundColor: '#e6f0ff' 
  },
  tabText: { 
    fontSize: 13, 
    color: '#6c757d', 
    fontWeight: '600' 
  },
  activeTabText: { 
    color: '#007bff' 
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    color: '#11181C'
  },
  label: { 
    marginBottom: 3, 
    fontWeight: '500', 
    color: '#11181C',
    fontSize: 13
  },
  form: { 
    marginBottom: 12 
  },
  webForm: {
    marginBottom: 0,
  },
  input: { 
    backgroundColor: '#fff', 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    fontSize: 13 
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 10,
    marginTop: -4,
    marginBottom: 4,
    marginLeft: 4,
  },
  webInput: {
    padding: 12,
    fontSize: 13,
    marginBottom: 10,
  },
  roleContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12, 
    gap: 8 
  },
  webRoleContainer: {
    marginBottom: 16,
  },
  roleOption: { 
    flex: 1, 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 8, 
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  selectedRole: { 
    backgroundColor: '#8b5cf6', 
    borderColor: '#8b5cf6' 
  },
  roleText: { 
    fontSize: 13, 
    fontWeight: '600',
    color: '#6c757d'
  },
  selectedRoleText: {
    color: '#fff'
  },
  button: { 
    backgroundColor: '#8b5cf6', 
    padding: 10, 
    borderRadius: 8, 
    alignItems: 'center',
    marginBottom: 10
  },
  webButton: {
    padding: 12,
    marginBottom: 16,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 13 
  },
  createAccount: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  createAccountText: {
    fontSize: 13,
    color: '#6c757d'
  },
  createAccountLink: {
    fontSize: 13,
    color: '#8b5cf6',
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});
