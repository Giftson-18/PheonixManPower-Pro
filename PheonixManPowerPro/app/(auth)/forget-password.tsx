import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, ArrowLeft } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleResetPassword = async () => {
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSubmitted(true);
      } catch (error) {
        Alert.alert(
          'Error',
          'Failed to send reset password email. Please try again later.'
        );
        console.error('Reset password error:', error);
      } finally {
        setIsLoading(false);
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
            <Text style={[styles.title, { color: colors.text }]}>Forgot Password</Text>
            <Text style={[styles.subtitle, { color: colors.placeholder }]}>
              {isSubmitted 
                ? "We've sent you an email with instructions to reset your password."
                : "Enter your email and we'll send you instructions to reset your password."}
            </Text>
          </View>
          
          {!isSubmitted ? (
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
              
              <Button
                title="Reset Password"
                onPress={handleResetPassword}
                isLoading={isLoading}
                style={styles.resetButton}
              />
            </View>
          ) : (
            <View style={styles.successContainer}>
              <View style={[styles.successIcon, { backgroundColor: colors.success }]}>
                <Mail size={32} color="#FFFFFF" />
              </View>
              
              <Text style={[styles.successText, { color: colors.text }]}>
                Check your inbox
              </Text>
              
              <Text style={[styles.successSubtext, { color: colors.placeholder }]}>
                We've sent an email to {email} with instructions to reset your password.
              </Text>
              
              <Button
                title="Back to Login"
                onPress={handleLogin}
                style={styles.backToLoginButton}
              />
            </View>
          )}
          
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.placeholder }]}>
              Remember your password?
            </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                Login
              </Text>
            </TouchableOpacity>
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
  resetButton: {
    marginTop: 16,
  },
  successContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginBottom: 8,
  },
  successSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  backToLoginButton: {
    minWidth: 200,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 16,
  },
  loginText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  loginLink: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
});