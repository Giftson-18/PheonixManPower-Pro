import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    clearError();
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
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
    
    return isValid;
  };
  
  const handleLogin = async () => {
    if (validateForm()) {
      try {
        await login(email, password);
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };
  
  const handleRegister = () => {
    router.push('/register');
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
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.placeholder }]}>
              Sign in to your account
            </Text>
          </View>
          
          <View style={styles.form}>
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
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={passwordError}
              leftIcon={<Lock size={20} color={colors.placeholder} />}
            />
            
            <TouchableOpacity 
              onPress={handleForgotPassword}
              style={styles.forgotPasswordContainer}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              </View>
            )}
            
            <Button
              title="Login"
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.loginButton}
            />
            
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: colors.placeholder }]}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={[styles.registerLink, { color: colors.primary }]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.demoAccountsContainer}>
            <Text style={[styles.demoAccountsTitle, { color: colors.text }]}>
              Demo Accounts
            </Text>
            <View style={[styles.demoAccount, { backgroundColor: colors.card }]}>
              <Text style={[styles.demoAccountLabel, { color: colors.text }]}>
                Worker:
              </Text>
              <Text style={[styles.demoAccountValue, { color: colors.placeholder }]}>
                worker@example.com / password
              </Text>
            </View>
            <View style={[styles.demoAccount, { backgroundColor: colors.card }]}>
              <Text style={[styles.demoAccountLabel, { color: colors.text }]}>
                Organizer:
              </Text>
              <Text style={[styles.demoAccountValue, { color: colors.placeholder }]}>
                organizer@example.com / password
              </Text>
            </View>
          </View>
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
    marginBottom: 32,
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
  form: {
    marginBottom: 24,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
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
  loginButton: {
    marginBottom: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  registerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  registerLink: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  demoAccountsContainer: {
    marginTop: 40,
  },
  demoAccountsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  demoAccount: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  demoAccountLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  demoAccountValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});