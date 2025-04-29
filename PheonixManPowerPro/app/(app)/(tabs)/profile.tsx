import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatPhoneNumber } from '@/utils/formatters';
import { 
  ArrowRight, 
  Award, 
  Briefcase, 
  ChevronRight, 
  CreditCard, 
  FileCheck, 
  HelpCircle, 
  LogOut, 
  Mail, 
  Moon, 
  Phone, 
  Settings, 
  Shield, 
  Star, 
  Sun, 
  User 
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  
  const isWorker = user?.role === 'worker';
  
  const handleEditProfile = () => {
    router.push('/profile/edit');
  };
  
  const handleVerification = () => {
    router.push('/profile/verification');
  };
  
  const handleLogout = () => {
    logout();
    router.replace('/(auth)');
  };
  
  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };
  
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={20} color={colors.text} />;
      case 'dark':
        return <Moon size={20} color={colors.text} />;
      default:
        return colorScheme === 'dark' 
          ? <Moon size={20} color={colors.text} />
          : <Sun size={20} color={colors.text} />;
    }
  };
  
  const getThemeText = () => {
    switch (theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      default:
        return 'System Default';
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user?.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.profileInitials}>
                {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.card }]}
            onPress={handleEditProfile}
          >
            <Settings size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.name, { color: colors.text }]}>
          {user?.name}
        </Text>
        
        <Badge 
          label={isWorker ? 'Worker' : 'Organizer'} 
          variant="primary"
          size="medium"
        />
        
        {isWorker && user?.rating && (
          <View style={styles.ratingContainer}>
            <Star size={16} color={colors.primary} fill={colors.primary} />
            <Text style={[styles.rating, { color: colors.text }]}>
              {user.rating.toFixed(1)} • {user.totalJobs} jobs completed
            </Text>
          </View>
        )}
      </View>
      
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Mail size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {user?.email}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Phone size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {formatPhoneNumber(user?.phone || '')}
          </Text>
        </View>
        
        {isWorker && user?.skills && (
          <View style={styles.skillsContainer}>
            <Text style={[styles.skillsTitle, { color: colors.text }]}>
              Skills
            </Text>
            
            <View style={styles.skills}>
              {user.skills.map((skill, index) => (
                <Badge 
                  key={index}
                  label={skill}
                  variant="default"
                  size="small"
                  style={styles.skillBadge}
                />
              ))}
            </View>
          </View>
        )}
      </Card>
      
      <Card style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <Text style={[styles.walletTitle, { color: colors.text }]}>
            Wallet Balance
          </Text>
          
          <TouchableOpacity onPress={() => router.push('/wallet')}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.walletBalance, { color: colors.text }]}>
          {formatCurrency(user?.walletBalance || 0)}
        </Text>
        
        <Button
          title={isWorker ? "Withdraw Funds" : "Add Money"}
          onPress={() => router.push('/wallet/withdraw')}
          style={styles.walletButton}
          rightIcon={<ArrowRight size={16} color="#FFFFFF" />}
        />
      </Card>
      
      <View style={styles.sectionTitle}>
        <Text style={[styles.sectionTitleText, { color: colors.text }]}>
          Account
        </Text>
      </View>
      
      <Card style={styles.menuCard}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleEditProfile}
        >
          <User size={20} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>
            Edit Profile
          </Text>
          <ChevronRight size={20} color={colors.placeholder} />
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleVerification}
        >
          <FileCheck size={20} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>
            Verification Status
          </Text>
          <View style={styles.menuItemRight}>
            {user?.verified ? (
              <Badge label="Verified" variant="success" size="small" />
            ) : (
              <Badge label="Incomplete" variant="warning" size="small" />
            )}
            <ChevronRight size={20} color={colors.placeholder} />
          </View>
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {}}
        >
          <CreditCard size={20} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>
            Payment Methods
          </Text>
          <ChevronRight size={20} color={colors.placeholder} />
        </TouchableOpacity>
      </Card>
      
      <View style={styles.sectionTitle}>
        <Text style={[styles.sectionTitleText, { color: colors.text }]}>
          Preferences
        </Text>
      </View>
      
      <Card style={styles.menuCard}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={toggleTheme}
        >
          {getThemeIcon()}
          <Text style={[styles.menuItemText, { color: colors.text }]}>
            Theme
          </Text>
          <View style={styles.menuItemRight}>
            <Text style={[styles.themeText, { color: colors.placeholder }]}>
              {getThemeText()}
            </Text>
            <ChevronRight size={20} color={colors.placeholder} />
          </View>
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {}}
        >
          <Briefcase size={20} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>
            {isWorker ? 'Job Preferences' : 'Hiring Preferences'}
          </Text>
          <ChevronRight size={20} color={colors.placeholder} />
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {}}
        >
          <Shield size={20} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>
            Privacy & Security
          </Text>
          <ChevronRight size={20} color={colors.placeholder} />
        </TouchableOpacity>
      </Card>
      
      <View style={styles.sectionTitle}>
        <Text style={[styles.sectionTitleText, { color: colors.text }]}>
          Other
        </Text>
      </View>
      
      <Card style={styles.menuCard}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {}}
        >
          <HelpCircle size={20} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>
            Help & Support
          </Text>
          <ChevronRight size={20} color={colors.placeholder} />
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {}}
        >
          <Award size={20} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>
            About Us
          </Text>
          <ChevronRight size={20} color={colors.placeholder} />
        </TouchableOpacity>
      </Card>
      
      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        style={styles.logoutButton}
        leftIcon={<LogOut size={20} color={colors.error} />}
        textStyle={{ color: colors.error }}
      />
      
      <Text style={[styles.versionText, { color: colors.placeholder }]}>
        Version 1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    color: '#FFFFFF',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  rating: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  skillsContainer: {
    marginTop: 8,
  },
  skillsTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    marginRight: 0,
  },
  walletCard: {
    marginBottom: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  viewAll: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  walletBalance: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    marginBottom: 16,
  },
  walletButton: {
    width: '100%',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionTitleText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  menuCard: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  logoutButton: {
    marginBottom: 24,
  },
  versionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
});