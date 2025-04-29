import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      try {
        if (!user?.aadhaarVerified || !user?.bankDetailsVerified) {
          // User needs to complete verification
          router.replace('/onboarding');
        } else {
          // User is fully verified, go to main app
          router.replace('/(app)/(tabs)');
        }
      } catch (error) {
        console.error('Navigation error in auth layout:', error);
      }
    }
  }, [isAuthenticated, user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}