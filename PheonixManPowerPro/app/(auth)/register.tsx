import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, User, Phone, ArrowLeft, Briefcase, HardHat } from 'lucide-react-native';
import { UserRole } from '@/types/user';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');
    clearError();
    
    // Validate name
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    }
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }
    
    // Validate phone
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      isValid = false;
    } else if (!/^\+?[0-9]{10,12}$/.test(phone.replace(/\s/g, ''))) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleRegister = async () => {
    if (validateForm()) {
      try {
        await register(email, password, name, phone, role);
      } catch (error) {
        console.error('Registration error:', error);
      }
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleLogin = () => {
    router.push('/login');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.placeholder }]}>
              Join Phoenix Man Power Pro
            </Text>
          </View>
          
          <View style={styles.roleSelector}>
            <Text style={[styles.roleSelectorLabel, { color: colors.text }]}>
              I want to:
            </Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'worker' && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => setRole('worker')}
              >
                <HardHat 
                  size={24} 
                  color={role === 'worker' ? '#FFFFFF' : colors.text} 
                />
                <Text 
                  style={[
                    styles.roleButtonText,
                    { color: role === 'worker' ? '#FFFFFF' : colors.text }
                  ]}
                >
                  Find Work
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'organizer' && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => setRole('organizer')}
              >
                <Briefcase 
                  size={24} 
                  color={role === 'organizer' ? '#FFFFFF' : colors.text} 
                />
                <Text 
                  style={[
                    styles.roleButtonText,
                    { color: role === 'organizer' ? '#FFFFFF' : colors.text }
                  ]}
                >
                  Hire Workers
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              error={nameError}
              leftIcon={<User size={20} color={colors.placeholder} />}
            />
            
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
              leftIcon={<Mail size={20} color={colors.placeholder} />}
            />
            
            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={phoneError}
              leftIcon={<Phone size={20} color={colors.placeholder} />}
            />
            
            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={passwordError}
              leftIcon={<Lock size={20} color={colors.placeholder} />}
            />
            
            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={confirmPasswordError}
              leftIcon={<Lock size={20} color={colors.placeholder} />}
            />
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              </View>
            )}
            
            <Button
              title="Register"
              onPress={handleRegister}
              isLoading={isLoading}
              style={styles.registerButton}
            />
            
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.placeholder }]}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity style={styles.termsContainer}>
            <Text style={[styles.termsText, { color: colors.placeholder }]}>
              By registering, you agree to our{' '}
              <Text style={{ color: colors.primary }}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  roleSelector: {
    marginBottom: 24,
  },
  roleSelectorLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  roleButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  registerButton: {
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  loginText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  loginLink: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  termsContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  termsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
});