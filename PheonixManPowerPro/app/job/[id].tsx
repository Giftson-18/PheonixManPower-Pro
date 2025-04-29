import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WorkerCard } from '@/components/ui/WorkerCard';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { useAuthStore } from '@/store/authStore';
import { useJobStore } from '@/store/jobStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { JobStatus } from '@/types/job';
import { 
  ArrowRight, 
  Bell,
  Briefcase, 
  Calendar, 
  CheckCircle, 
  Clock, 
  IndianRupee, 
  MapPin, 
  Play,
  Users 
} from 'lucide-react-native';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const { user } = useAuthStore();
  const { 
    getJobById, 
    applyToJob, 
    selectWorker, 
    updateWorkerStatus,
    updateJob,
    sendNotificationToWorkers,
    isLoading 
  } = useJobStore();
  
  const [job, setJob] = useState(getJobById(id));
  const [refreshKey, setRefreshKey] = useState(0);
  const [showApplications, setShowApplications] = useState(false);
  
  const isWorker = user?.role === 'worker';
  const isOrganizer = user?.role === 'organizer' && job?.organizerId === user.id;
  
  // Check if the current worker has applied to this job
  const hasApplied = job?.applicants.some(app => app.id === user?.id);
  
  // Check if the current worker is selected for this job
  const isSelected = job?.workers.some(worker => worker.id === user?.id);
  
  // Get the current worker's status if selected
  const workerStatus = isSelected 
    ? job?.workers.find(worker => worker.id === user?.id)?.status 
    : null;
  
  useEffect(() => {
    // Refresh job data when the component mounts or refreshKey changes
    setJob(getJobById(id));
  }, [id, refreshKey]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleApply = async () => {
    if (!user || !job) return;
    
    try {
      await applyToJob(job.id, user.id);
      Alert.alert(
        'Application Submitted',
        'Your application has been submitted successfully. The organizer will review it shortly.'
      );
      handleRefresh();
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to submit application. Please try again.'
      );
      console.error('Apply error:', error);
    }
  };
  
  const handleSelectWorker = async (workerId: string, selected: boolean) => {
    if (!job) return;
    
    try {
      await selectWorker(job.id, workerId, selected);
      
      if (selected) {
        // Send notification to worker when selected
        await sendNotificationToWorkers(job.id, [workerId], "You've been selected for a job!", 
          `You've been selected for the job: ${job.title}. Check your dashboard for details.`);
      }
      
      handleRefresh();
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to select worker. Please try again.'
      );
      console.error('Select worker error:', error);
    }
  };
  
  const handleUpdateWorkerStatus = async (status: string) => {
    if (!user || !job) return;
    
    try {
      await updateWorkerStatus(job.id, user.id, status);
      
      // If all workers have completed, update job status
      if (status === 'completed') {
        const updatedJob = getJobById(job.id);
        const allWorkersCompleted = updatedJob?.workers.every(w => w.status === 'completed');
        
        if (allWorkersCompleted) {
          await updateJob(job.id, { status: 'completed' as JobStatus });
        }
      }
      
      handleRefresh();
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update status. Please try again.'
      );
      console.error('Update status error:', error);
    }
  };
  
  const handleUpdateJobStatus = async (status: JobStatus) => {
    if (!job) return;
    
    try {
      await updateJob(job.id, { status });
      
      // Send notifications to workers when job status changes
      if (status === 'in-progress') {
        const workerIds = job.workers.map(worker => worker.id);
        await sendNotificationToWorkers(job.id, workerIds, "Work has started!", 
          `The organizer has started the job: ${job.title}. Please check in when you arrive.`);
      } else if (status === 'completed') {
        const workerIds = job.workers.map(worker => worker.id);
        await sendNotificationToWorkers(job.id, workerIds, "Work has been completed!", 
          `The organizer has marked the job: ${job.title} as completed. Your payment will be processed soon.`);
      }
      
      handleRefresh();
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update job status. Please try again.'
      );
      console.error('Update job status error:', error);
    }
  };
  
  const handlePayAdvance = () => {
    if (!job) return;
    router.push(`/payment/advance?jobId=${job.id}`);
  };
  
  const handlePayFinal = () => {
    if (!job) return;
    router.push(`/payment/final?jobId=${job.id}`);
  };
  
  const getJobStatusSteps = () => {
    return [
      { id: 'draft', label: 'Draft' },
      { id: 'open', label: 'Open' },
      { id: 'in-progress', label: 'In Progress' },
      { id: 'completed', label: 'Completed' },
    ];
  };
  
  const getWorkerStatusSteps = () => {
    return [
      { id: 'selected', label: 'Selected' },
      { id: 'arrived', label: 'Arrived' },
      { id: 'working', label: 'Working' },
      { id: 'completed', label: 'Completed' },
    ];
  };
  
  const getCompletedSteps = (currentStatus: string, steps: { id: string }[]) => {
    const currentIndex = steps.findIndex(step => step.id === currentStatus);
    return steps.slice(0, currentIndex).map(step => step.id);
  };
  
  if (!job) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.text }]}>
          Job not found
        </Text>
      </View>
    );
  }
  
  // Set the screen title
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: job.title,
          headerRight: () => isOrganizer ? (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowApplications(!showApplications)}
            >
              <Text style={{ color: colors.primary, marginRight: 8 }}>
                {showApplications ? "Job Details" : "Applications"}
              </Text>
            </TouchableOpacity>
          ) : null
        }} 
      />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!showApplications ? (
          // JOB DETAILS VIEW
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                {job.title}
              </Text>
              
              <Badge 
                label={job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                variant={
                  job.status === 'draft' ? 'info' :
                  job.status === 'open' ? 'primary' :
                  job.status === 'in-progress' ? 'warning' :
                  job.status === 'completed' ? 'success' :
                  'default'
                }
                size="medium"
              />
            </View>
            
            <Card style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <MapPin size={20} color={colors.primary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {job.location}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Calendar size={20} color={colors.primary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {formatDate(job.date)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Clock size={20} color={colors.primary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {job.startTime} - {job.endTime}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <IndianRupee size={20} color={colors.primary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {formatCurrency(job.payPerWorker)} per worker
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Users size={20} color={colors.primary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {job.workers.length}/{job.workersNeeded} Workers
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Briefcase size={20} color={colors.primary} />
                <View style={styles.skillsContainer}>
                  {job.skills.map((skill, index) => (
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
            </Card>
            
            <Card style={styles.descriptionCard}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Description
              </Text>
              <Text style={[styles.description, { color: colors.text }]}>
                {job.description}
              </Text>
            </Card>
            
            {isOrganizer && (
              <>
                <Card style={styles.progressCard}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Job Progress
                  </Text>
                  
                  <ProgressSteps
                    steps={getJobStatusSteps()}
                    currentStep={job.status}
                    completedSteps={getCompletedSteps(job.status, getJobStatusSteps())}
                  />
                  
                  <View style={styles.progressActions}>
                    {job.status === 'draft' && !job.advancePaid && (
                      <Button
                        title="Pay Advance & Publish"
                        onPress={handlePayAdvance}
                        isLoading={isLoading}
                        style={styles.actionButton}
                      />
                    )}
                    
                    {job.status === 'open' && job.workers.length > 0 && (
                      <Button
                        title="Start Work"
                        onPress={() => handleUpdateJobStatus('in-progress')}
                        isLoading={isLoading}
                        style={styles.actionButton}
                        leftIcon={<Play size={20} color="#FFFFFF" />}
                      />
                    )}
                    
                    {job.status === 'in-progress' && !job.finalPaid && (
                      <Button
                        title="Mark Work as Done & Pay Workers"
                        onPress={handlePayFinal}
                        isLoading={isLoading}
                        style={styles.actionButton}
                        leftIcon={<CheckCircle size={20} color="#FFFFFF" />}
                      />
                    )}
                  </View>
                </Card>
                
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Selected Workers ({job.workers.length})
                  </Text>
                </View>
                
                {job.workers.length > 0 ? (
                  job.workers.map(worker => (
                    <WorkerCard
                      key={worker.id}
                      worker={worker}
                      selected={true}
                      onSelect={(worker, selected) => handleSelectWorker(worker.id, selected)}
                      showActions={job.status === 'open'}
                      showRating={true}
                    />
                  ))
                ) : (
                  <Card style={styles.emptyCard}>
                    <Text style={[styles.emptyText, { color: colors.placeholder }]}>
                      No workers selected yet
                    </Text>
                  </Card>
                )}
                
                <TouchableOpacity 
                  style={[styles.viewApplicationsButton, { backgroundColor: colors.secondary }]}
                  onPress={() => setShowApplications(true)}
                >
                  <Text style={styles.viewApplicationsText}>
                    View All Applications ({job.applicants.length})
                  </Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            )}
            
            {isWorker && (
              <>
                {isSelected && (
                  <Card style={styles.progressCard}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Your Progress
                    </Text>
                    
                    <ProgressSteps
                      steps={getWorkerStatusSteps()}
                      currentStep={workerStatus || 'selected'}
                      completedSteps={getCompletedSteps(workerStatus || 'selected', getWorkerStatusSteps())}
                    />
                    
                    <View style={styles.progressActions}>
                      {workerStatus === 'selected' && job.status === 'in-progress' && (
                        <Button
                          title="Mark as Arrived"
                          onPress={() => handleUpdateWorkerStatus('arrived')}
                          isLoading={isLoading}
                          style={styles.actionButton}
                        />
                      )}
                      
                      {workerStatus === 'arrived' && (
                        <Button
                          title="Start Working"
                          onPress={() => handleUpdateWorkerStatus('working')}
                          isLoading={isLoading}
                          style={styles.actionButton}
                        />
                      )}
                      
                      {workerStatus === 'working' && (
                        <Button
                          title="Mark as Completed"
                          onPress={() => handleUpdateWorkerStatus('completed')}
                          isLoading={isLoading}
                          style={styles.actionButton}
                        />
                      )}
                      
                      {workerStatus === 'completed' && (
                        <View style={styles.completedContainer}>
                          <CheckCircle size={24} color={colors.success} />
                          <Text style={[styles.completedText, { color: colors.success }]}>
                            Work Completed
                          </Text>
                        </View>
                      )}
                    </View>
                  </Card>
                )}
                
                {!isSelected && !hasApplied && job.status === 'open' && (
                  <Button
                    title="Apply for this Job"
                    onPress={handleApply}
                    isLoading={isLoading}
                    style={styles.applyButton}
                    rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
                  />
                )}
                
                {!isSelected && hasApplied && (
                  <Card style={[styles.applicationCard, { backgroundColor: colors.card }]}>
                    <CheckCircle size={24} color={colors.primary} />
                    <Text style={[styles.applicationText, { color: colors.text }]}>
                      Application Submitted
                    </Text>
                    <Text style={[styles.applicationSubtext, { color: colors.placeholder }]}>
                      Your application has been submitted. The organizer will review it shortly.
                    </Text>
                  </Card>
                )}
              </>
            )}
          </>
        ) : (
          // APPLICATIONS VIEW (Only for organizers)
          <>
            <View style={styles.applicationsHeader}>
              <Text style={[styles.applicationsTitle, { color: colors.text }]}>
                Applications for {job.title}
              </Text>
              <Badge 
                label={`${job.applicants.length} Applicants`}
                variant="primary"
                size="medium"
              />
            </View>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : job.applicants.length > 0 ? (
              <>
                <Text style={[styles.applicationsSubtitle, { color: colors.placeholder }]}>
                  Review and select workers for your job
                </Text>
                
                {job.applicants.map(applicant => (
                  <WorkerCard
                    key={applicant.id}
                    worker={applicant}
                    selected={job.workers.some(w => w.id === applicant.id)}
                    onSelect={(worker, selected) => handleSelectWorker(worker.id, selected)}
                    showActions={job.status === 'open'}
                    showRating={true}
                  />
                ))}
                
                <TouchableOpacity 
                  style={[styles.viewDetailsButton, { backgroundColor: colors.secondary }]}
                  onPress={() => setShowApplications(false)}
                >
                  <Text style={styles.viewDetailsText}>
                    Back to Job Details
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: colors.placeholder }]}>
                  No applications yet
                </Text>
                <TouchableOpacity 
                  style={[styles.viewDetailsButton, { backgroundColor: colors.secondary, marginTop: 16 }]}
                  onPress={() => setShowApplications(false)}
                >
                  <Text style={styles.viewDetailsText}>
                    Back to Job Details
                  </Text>
                </TouchableOpacity>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    flex: 1,
    marginRight: 12,
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    marginRight: 0,
  },
  descriptionCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  progressCard: {
    marginBottom: 24,
  },
  progressActions: {
    marginTop: 16,
  },
  actionButton: {
    width: '100%',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  emptyCard: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  applyButton: {
    marginTop: 16,
  },
  applicationCard: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 24,
    marginTop: 16,
  },
  applicationText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginTop: 12,
    marginBottom: 8,
  },
  applicationSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  completedText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  notFoundText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
  viewApplicationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
    gap: 8,
  },
  viewApplicationsText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  applicationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicationsTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    flex: 1,
    marginRight: 12,
  },
  applicationsSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginBottom: 16,
  },
  viewDetailsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  viewDetailsText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    padding: 8,
  },
});