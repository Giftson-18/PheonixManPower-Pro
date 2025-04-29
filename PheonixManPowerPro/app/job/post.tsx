import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { useJobStore } from '@/store/jobStore';
import { 
  Calendar, 
  Clock, 
  IndianRupee, 
  MapPin, 
  Users, 
  Briefcase, 
  CheckCircle 
} from 'lucide-react-native';

export default function PostJobScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const { user } = useAuthStore();
  const { createJob, isLoading } = useJobStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [payPerWorker, setPayPerWorker] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [payError, setPayError] = useState('');
  const [workersError, setWorkersError] = useState('');
  const [skillsError, setSkillsError] = useState('');
  
  const availableSkills = [
    'Event Setup',
    'Catering',
    'Security',
    'Bartending',
    'Serving',
    'Cleaning',
    'Technical Support',
    'Registration',
    'Ushering',
    'Photography',
    'Videography',
    'Decoration',
  ];
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setTitleError('');
    setDescriptionError('');
    setDateError('');
    setTimeError('');
    setLocationError('');
    setPayError('');
    setWorkersError('');
    setSkillsError('');
    
    // Validate title
    if (!title.trim()) {
      setTitleError('Job title is required');
      isValid = false;
    }
    
    // Validate description
    if (!description.trim()) {
      setDescriptionError('Job description is required');
      isValid = false;
    }
    
    // Validate date
    if (!date.trim()) {
      setDateError('Date is required');
      isValid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setDateError('Date must be in YYYY-MM-DD format');
      isValid = false;
    }
    
    // Validate time
    if (!startTime.trim() || !endTime.trim()) {
      setTimeError('Start and end time are required');
      isValid = false;
    } else if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      setTimeError('Time must be in HH:MM format');
      isValid = false;
    }
    
    // Validate location
    if (!location.trim()) {
      setLocationError('Location is required');
      isValid = false;
    }
    
    // Validate pay
    if (!payPerWorker.trim()) {
      setPayError('Pay per worker is required');
      isValid = false;
    } else if (isNaN(Number(payPerWorker)) || Number(payPerWorker) <= 0) {
      setPayError('Pay must be a positive number');
      isValid = false;
    }
    
    // Validate workers needed
    if (!workersNeeded.trim()) {
      setWorkersError('Number of workers is required');
      isValid = false;
    } else if (isNaN(Number(workersNeeded)) || Number(workersNeeded) <= 0 || !Number.isInteger(Number(workersNeeded))) {
      setWorkersError('Number of workers must be a positive integer');
      isValid = false;
    }
    
    // Validate skills
    if (selectedSkills.length === 0) {
      setSkillsError('At least one skill is required');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleCreateJob = async () => {
    if (!validateForm() || !user) return;
    
    try {
      const newJob = await createJob({
        title,
        description,
        date,
        startTime,
        endTime,
        location,
        payPerWorker: Number(payPerWorker),
        workersNeeded: Number(workersNeeded),
        skills: selectedSkills,
        organizerId: user.id,
      });
      
      Alert.alert(
        'Job Created',
        'Your job has been created successfully. You need to pay the advance to publish it.',
        [
          {
            text: 'Pay Advance',
            onPress: () => router.push(`/payment/advance?jobId=${newJob.id}`),
          },
          {
            text: 'Later',
            onPress: () => router.back(),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create job. Please try again.'
      );
      console.error('Create job error:', error);
    }
  };
  
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Post a New Job
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.placeholder }]}>
        Fill in the details to create a new job posting
      </Text>
      
      <View style={styles.form}>
        <Input
          label="Job Title"
          placeholder="Enter job title"
          value={title}
          onChangeText={setTitle}
          error={titleError}
          leftIcon={<Briefcase size={20} color={colors.placeholder} />}
        />
        
        <Input
          label="Description"
          placeholder="Enter job description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top' }}
          error={descriptionError}
        />
        
        <Input
          label="Date (YYYY-MM-DD)"
          placeholder="e.g. 2023-12-31"
          value={date}
          onChangeText={setDate}
          error={dateError}
          leftIcon={<Calendar size={20} color={colors.placeholder} />}
        />
        
        <View style={styles.timeContainer}>
          <Input
            label="Start Time (HH:MM)"
            placeholder="e.g. 09:00"
            value={startTime}
            onChangeText={setStartTime}
            containerStyle={styles.timeInput}
            leftIcon={<Clock size={20} color={colors.placeholder} />}
          />
          
          <Input
            label="End Time (HH:MM)"
            placeholder="e.g. 17:00"
            value={endTime}
            onChangeText={setEndTime}
            containerStyle={styles.timeInput}
            leftIcon={<Clock size={20} color={colors.placeholder} />}
          />
        </View>
        
        {timeError ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {timeError}
          </Text>
        ) : null}
        
        <Input
          label="Location"
          placeholder="Enter job location"
          value={location}
          onChangeText={setLocation}
          error={locationError}
          leftIcon={<MapPin size={20} color={colors.placeholder} />}
        />
        
        <Input
          label="Pay Per Worker (₹)"
          placeholder="Enter amount in rupees"
          value={payPerWorker}
          onChangeText={setPayPerWorker}
          keyboardType="numeric"
          error={payError}
          leftIcon={<IndianRupee size={20} color={colors.placeholder} />}
        />
        
        <Input
          label="Number of Workers Needed"
          placeholder="Enter number of workers"
          value={workersNeeded}
          onChangeText={setWorkersNeeded}
          keyboardType="numeric"
          error={workersError}
          leftIcon={<Users size={20} color={colors.placeholder} />}
        />
        
        <Text style={[styles.skillsLabel, { color: colors.text }]}>
          Required Skills
        </Text>
        
        <View style={styles.skillsContainer}>
          {availableSkills.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[
                styles.skillChip,
                selectedSkills.includes(skill) 
                  ? { backgroundColor: colors.primary } 
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
              ]}
              onPress={() => toggleSkill(skill)}
            >
              <Text 
                style={[
                  styles.skillChipText,
                  { color: selectedSkills.includes(skill) ? '#FFFFFF' : colors.text }
                ]}
              >
                {skill}
              </Text>
              {selectedSkills.includes(skill) && (
                <CheckCircle size={14} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {skillsError ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {skillsError}
          </Text>
        ) : null}
        
        <View style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Important Information
          </Text>
          <Text style={[styles.infoText, { color: colors.placeholder }]}>
            You will need to pay 25% of the total job cost as an advance to publish this job. The remaining 75% will be paid after job completion.
          </Text>
          <Text style={[styles.infoText, { color: colors.placeholder }]}>
            Total Cost: ₹{payPerWorker && workersNeeded ? Number(payPerWorker) * Number(workersNeeded) : 0}
          </Text>
          <Text style={[styles.infoText, { color: colors.placeholder }]}>
            Advance (25%): ₹{payPerWorker && workersNeeded ? Number(payPerWorker) * Number(workersNeeded) * 0.25 : 0}
          </Text>
        </View>
        
        <Button
          title="Create Job"
          onPress={handleCreateJob}
          isLoading={isLoading}
          style={styles.createButton}
        />
      </View>
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
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginBottom: 24,
  },
  form: {
    gap: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  skillsLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    gap: 6,
  },
  skillChipText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    marginVertical: 16,
  },
  infoTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  createButton: {
    marginTop: 8,
  },
});