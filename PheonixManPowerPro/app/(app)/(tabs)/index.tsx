import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { Card, PressableCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import { useJobStore } from '@/store/jobStore';
import { formatCurrency } from '@/utils/formatters';
import { ArrowRight, Briefcase, Calendar, IndianRupee, MapPin, Star, Users } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const { user } = useAuthStore();
  const { jobs, fetchJobs } = useJobStore();
  
  const isWorker = user?.role === 'worker';
  
  useEffect(() => {
    fetchJobs();
  }, []);
  
  const recentJobs = jobs
    .filter(job => {
      if (isWorker) {
        // For workers, show open jobs they haven't applied to yet
        return job.status === 'open' && !job.applicants.some(app => app.id === user?.id);
      } else {
        // For organizers, show their own jobs
        return job.organizerId === user?.id;
      }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  const activeJobs = jobs.filter(job => {
    if (isWorker) {
      // For workers, show jobs they're selected for
      return job.workers.some(worker => worker.id === user?.id);
    } else {
      // For organizers, show their jobs that are in progress
      return job.organizerId === user?.id && job.status === 'in-progress';
    }
  });
  
  const handleViewJob = (jobId: string) => {
    router.push(`/job/${jobId}`);
  };
  
  const handleViewAllJobs = () => {
    router.push('/jobs');
  };
  
  const handlePostJob = () => {
    router.push('/job/post');
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Hello, {user?.name.split(' ')[0]}
          </Text>
          <Text style={[styles.subtitle, { color: colors.placeholder }]}>
            {isWorker ? 'Find your next gig' : 'Manage your events'}
          </Text>
        </View>
        
        <Avatar
          source={user?.profileImage ? { uri: user.profileImage } : null}
          name={user?.name}
          size={50}
        />
      </View>
      
      <Card style={[styles.walletCard, { backgroundColor: colors.primary }]}>
        <View style={styles.walletHeader}>
          <Text style={styles.walletTitle}>Wallet Balance</Text>
          <TouchableOpacity 
            style={[styles.topUpButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
            onPress={() => router.push('/wallet')}
          >
            <Text style={styles.topUpButtonText}>
              {isWorker ? 'Withdraw' : 'Top Up'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.walletBalance}>
          {formatCurrency(user?.walletBalance || 0)}
        </Text>
        
        <TouchableOpacity 
          style={styles.viewTransactionsButton}
          onPress={() => router.push('/wallet')}
        >
          <Text style={styles.viewTransactionsText}>View Transactions</Text>
          <ArrowRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </Card>
      
      {!isWorker && (
        <TouchableOpacity 
          style={[styles.postJobButton, { backgroundColor: colors.secondary }]}
          onPress={handlePostJob}
        >
          <Briefcase size={20} color="#FFFFFF" />
          <Text style={styles.postJobButtonText}>Post a New Job</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {isWorker ? 'Recommended Jobs' : 'Recent Jobs'}
        </Text>
        
        <TouchableOpacity onPress={handleViewAllJobs}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      
      {recentJobs.length > 0 ? (
        recentJobs.map(job => (
          <PressableCard 
            key={job.id}
            style={styles.jobCard}
            onPress={() => handleViewJob(job.id)}
          >
            <View style={styles.jobCardHeader}>
              <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={1}>
                {job.title}
              </Text>
              <Badge 
                label={formatCurrency(job.payPerWorker)}
                variant="primary"
              />
            </View>
            
            <View style={styles.jobDetails}>
              <View style={styles.jobDetailRow}>
                <MapPin size={16} color={colors.primary} />
                <Text style={[styles.jobDetailText, { color: colors.text }]} numberOfLines={1}>
                  {job.location}
                </Text>
              </View>
              
              <View style={styles.jobDetailRow}>
                <Calendar size={16} color={colors.primary} />
                <Text style={[styles.jobDetailText, { color: colors.text }]}>
                  {new Date(job.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              
              <View style={styles.jobDetailRow}>
                <Users size={16} color={colors.primary} />
                <Text style={[styles.jobDetailText, { color: colors.text }]}>
                  {job.workers.length}/{job.workersNeeded} Workers
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={() => handleViewJob(job.id)}
            >
              <Text style={styles.applyButtonText}>
                {isWorker ? 'View Details' : 'Manage Job'}
              </Text>
            </TouchableOpacity>
          </PressableCard>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={[styles.emptyText, { color: colors.placeholder }]}>
            {isWorker 
              ? 'No recommended jobs at the moment. Check back later!' 
              : 'You haven\'t posted any jobs yet. Create your first job!'}
          </Text>
        </Card>
      )}
      
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {isWorker ? 'Your Active Jobs' : 'Jobs In Progress'}
        </Text>
      </View>
      
      {activeJobs.length > 0 ? (
        activeJobs.map(job => (
          <PressableCard 
            key={job.id}
            style={styles.jobCard}
            onPress={() => handleViewJob(job.id)}
          >
            <View style={styles.jobCardHeader}>
              <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={1}>
                {job.title}
              </Text>
              <Badge 
                label="In Progress"
                variant="warning"
              />
            </View>
            
            <View style={styles.jobDetails}>
              <View style={styles.jobDetailRow}>
                <MapPin size={16} color={colors.primary} />
                <Text style={[styles.jobDetailText, { color: colors.text }]} numberOfLines={1}>
                  {job.location}
                </Text>
              </View>
              
              <View style={styles.jobDetailRow}>
                <Calendar size={16} color={colors.primary} />
                <Text style={[styles.jobDetailText, { color: colors.text }]}>
                  {new Date(job.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              
              <View style={styles.jobDetailRow}>
                <IndianRupee size={16} color={colors.primary} />
                <Text style={[styles.jobDetailText, { color: colors.text }]}>
                  {formatCurrency(job.payPerWorker)}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={() => handleViewJob(job.id)}
            >
              <Text style={styles.applyButtonText}>
                View Details
              </Text>
            </TouchableOpacity>
          </PressableCard>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={[styles.emptyText, { color: colors.placeholder }]}>
            {isWorker 
              ? 'You don\'t have any active jobs. Apply for jobs to get started!' 
              : 'No jobs in progress. Post a job to get started!'}
          </Text>
        </Card>
      )}
      
      {isWorker && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Top Skills in Demand
            </Text>
          </View>
          
          <View style={styles.skillsContainer}>
            {['Event Setup', 'Bartending', 'Security', 'Catering', 'Technical Support'].map((skill, index) => (
              <PressableCard 
                key={skill}
                style={[styles.skillCard, { backgroundColor: colors.card }]}
                onPress={handleViewAllJobs}
              >
                <Image
                  source={{ 
                    uri: [
                      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=200&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=200&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1517457210348-703079e57d4b?q=80&w=200&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=200&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=200&auto=format&fit=crop',
                    ][index]
                  }}
                  style={styles.skillImage}
                />
                <Text style={[styles.skillName, { color: colors.text }]}>
                  {skill}
                </Text>
                <View style={styles.skillRating}>
                  <Star size={12} color={colors.primary} fill={colors.primary} />
                  <Text style={[styles.skillRatingText, { color: colors.placeholder }]}>
                    High Demand
                  </Text>
                </View>
              </PressableCard>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  walletCard: {
    padding: 20,
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
    fontSize: 14,
    color: '#FFFFFF',
  },
  topUpButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  topUpButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  walletBalance: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  viewTransactionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewTransactionsText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  postJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  postJobButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  viewAllText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  jobCard: {
    marginBottom: 16,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  jobDetails: {
    marginBottom: 16,
    gap: 8,
  },
  jobDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobDetailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  applyButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  skillCard: {
    width: '48%',
    padding: 12,
    marginBottom: 12,
  },
  skillImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  skillName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  skillRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skillRatingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
});