import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { Button } from '@/components/ui/Button';

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const handleLogin = () => {
    router.push('/login');
  };
  
  const handleRegister = () => {
    router.push('/register');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <LinearGradient
        colors={['transparent', colorScheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=300&auto=format&fit=crop' }}
              style={styles.logoImage}
            />
            <Text style={[styles.appName, { color: colors.primary }]}>
              Phoenix Man Power Pro
            </Text>
          </View>
          
          <View style={styles.taglineContainer}>
            <Text style={[styles.tagline, { color: colors.text }]}>
              Rise. Work. Earn.
            </Text>
            <Text style={[styles.subtitle, { color: colors.placeholder }]}>
              Connect with the best event jobs and workers in your area
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Login"
              onPress={handleLogin}
              style={styles.button}
            />
            
            <Button
              title="Register"
              onPress={handleRegister}
              variant="outline"
              style={styles.button}
            />
          </View>
          
          <TouchableOpacity style={styles.termsContainer}>
            <Text style={[styles.termsText, { color: colors.placeholder }]}>
              By continuing, you agree to our{' '}
              <Text style={{ color: colors.primary }}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  appName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    textAlign: 'center',
  },
  taglineContainer: {
    marginBottom: 40,
  },
  tagline: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
});