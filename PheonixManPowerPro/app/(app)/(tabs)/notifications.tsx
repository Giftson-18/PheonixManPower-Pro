import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useJobStore } from '@/store/jobStore';
import { Bell, BellOff, Calendar, CheckCircle, Clock } from 'lucide-react-native';

interface Notification {
  id: string;
  userId: string;
  jobId?: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const { user } = useAuthStore();
  const { getNotificationsForUser, markNotificationAsRead } = useJobStore();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    if (user) {
      const userNotifications = getNotificationsForUser(user.id);
      setNotifications(userNotifications);
    }
  }, [user]);
  
  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    markNotificationAsRead(notification.id);
    
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    // Navigate to job if jobId exists
    if (notification.jobId) {
      router.push(`/job/${notification.jobId}`);
    }
  };
  
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    return (
      <TouchableOpacity onPress={() => handleNotificationPress(item)}>
        <Card 
          style={[
            styles.notificationCard, 
            !item.read && { borderLeftColor: colors.primary, borderLeftWidth: 4 }
          ]}
        >
          <View style={styles.notificationHeader}>
            <View style={[styles.notificationIcon, { backgroundColor: item.read ? colors.card : colors.primary }]}>
              {item.title.includes('selected') ? (
                <CheckCircle size={20} color={item.read ? colors.text : '#FFFFFF'} />
              ) : item.title.includes('started') ? (
                <Clock size={20} color={item.read ? colors.text : '#FFFFFF'} />
              ) : item.title.includes('completed') || item.title.includes('Payment') ? (
                <Calendar size={20} color={item.read ? colors.text : '#FFFFFF'} />
              ) : (
                <Bell size={20} color={item.read ? colors.text : '#FFFFFF'} />
              )}
            </View>
            
            <View style={styles.notificationContent}>
              <Text 
                style={[
                  styles.notificationTitle, 
                  { color: colors.text },
                  !item.read && styles.unreadText
                ]}
              >
                {item.title}
              </Text>
              
              <Text style={[styles.notificationMessage, { color: colors.placeholder }]}>
                {item.message}
              </Text>
              
              <Text style={[styles.notificationDate, { color: colors.placeholder }]}>
                {formatNotificationDate(item.date)}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };
  
  const renderEmptyState = () => {
    return (
      <EmptyState
        title="No Notifications"
        description="You don't have any notifications yet."
        icon={<BellOff size={32} color={colors.placeholder} />}
      />
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  notificationCard: {
    marginBottom: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  unreadText: {
    fontFamily: 'Poppins-SemiBold',
  },
  notificationMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  notificationDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
});