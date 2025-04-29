import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { JobCard } from '@/components/ui/JobCard';
import { TabBar } from '@/components/ui/TabBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useJobStore } from '@/store/jobStore';
import { Job } from '@/types/job';
import { Briefcase, Plus, Search } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';

export default function JobsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const { user } = useAuthStore();
  const { jobs, fetchJobs, isLoading } = useJobStore();
  
  const isWorker = user?.role === 'worker';
  
  const [activeTab, setActiveTab] = useState(isWorker ? 'available' : 'active');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchJobs();
  }, []);
  
  const workerTabs = [
    { id: 'available', label: 'Available' },
    { id: 'applied', label: 'Applied' },
    { id: 'selected', label: 'Selected' },
    { id: 'completed', label: 'Completed' },
  ];
  
  const organizerTabs = [
    { id: 'active', label: 'Active' },
    { id: 'draft', label: 'Drafts' },
    { id: 'completed', label: 'Completed' },
  ];
  
  const filteredJobs = jobs.filter(job => {
    // First filter by search query
    const matchesSearch = 
      searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Then filter by tab
    if (isWorker) {
      switch (activeTab) {
        case 'available':
          return job.status === 'open' && 
                 !job.applicants.some(app => app.id === user?.id);
        case 'applied':
          return job.applicants.some(app => app.id === user?.id && app.status === 'pending');
        case 'selected':
          return job.workers.some(worker => worker.id === user?.id && 
                 ['selected', 'arrived', 'working'].includes(worker.status));
        case 'completed':
          return job.workers.some(worker => worker.id === user?.id && worker.status === 'completed');
        default:
          return true;
      }
    } else {
      // Organizer tabs
      switch (activeTab) {
        case 'active':
          return job.organizerId === user?.id && 
                 ['open', 'in-progress'].includes(job.status);
        case 'draft':
          return job.organizerId === user?.id && job.status === 'draft';
        case 'completed':
          return job.organizerId === user?.id && job.status === 'completed';
        default:
          return job.organizerId === user?.id;
      }
    }
  });
  
  const handleJobPress = (job: Job) => {
    router.push(`/job/${job.id}`);
  };
  
  const handlePostJob = () => {
    router.push('/job/post');
  };
  
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    
    if (isWorker) {
      switch (activeTab) {
        case 'available':
          return (
            <EmptyState
              title="No Available Jobs"
              description="There are no jobs available at the moment. Check back later!"
              icon={<Briefcase size={32} color={colors.placeholder} />}
            />
          );
        case 'applied':
          return (
            <EmptyState
              title="No Applications"
              description="You haven't applied to any jobs yet. Browse available jobs to get started!"
              icon={<Briefcase size={32} color={colors.placeholder} />}
              actionLabel="Find Jobs"
              onAction={() => setActiveTab('available')}
            />
          );
        case 'selected':
          return (
            <EmptyState
              title="No Selected Jobs"
              description="You haven't been selected for any jobs yet. Keep applying!"
              icon={<Briefcase size={32} color={colors.placeholder} />}
              actionLabel="Find Jobs"
              onAction={() => setActiveTab('available')}
            />
          );
        case 'completed':
          return (
            <EmptyState
              title="No Completed Jobs"
              description="You haven't completed any jobs yet."
              icon={<Briefcase size={32} color={colors.placeholder} />}
            />
          );
      }
    } else {
      switch (activeTab) {
        case 'active':
          return (
            <EmptyState
              title="No Active Jobs"
              description="You don't have any active jobs. Post a new job to get started!"
              icon={<Briefcase size={32} color={colors.placeholder} />}
              actionLabel="Post a Job"
              onAction={handlePostJob}
            />
          );
        case 'draft':
          return (
            <EmptyState
              title="No Draft Jobs"
              description="You don't have any jobs in draft status."
              icon={<Briefcase size={32} color={colors.placeholder} />}
              actionLabel="Post a Job"
              onAction={handlePostJob}
            />
          );
        case 'completed':
          return (
            <EmptyState
              title="No Completed Jobs"
              description="You haven't completed any jobs yet."
              icon={<Briefcase size={32} color={colors.placeholder} />}
            />
          );
      }
    }
    
    return (
      <EmptyState
        title="No Jobs Found"
        description="No jobs match your search criteria."
        icon={<Briefcase size={32} color={colors.placeholder} />}
      />
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Input
          placeholder="Search jobs by title or location"
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={colors.placeholder} />}
          containerStyle={styles.searchContainer}
        />
        
        {!isWorker && (
          <TouchableOpacity 
            style={[styles.postButton, { backgroundColor: colors.primary }]}
            onPress={handlePostJob}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <TabBar
        tabs={isWorker ? workerTabs : organizerTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobCard job={item} onPress={handleJobPress} />
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    marginBottom: 0,
  },
  postButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});