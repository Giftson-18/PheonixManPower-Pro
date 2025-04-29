import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TabBar } from '@/components/ui/TabBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDateTime, formatTransactionReference } from '@/utils/formatters';
import { ArrowDownLeft, ArrowUpRight, Clock, IndianRupee, Plus, Wallet, AlertCircle } from 'lucide-react-native';

export default function WalletScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const { user } = useAuthStore();
  const { transactions, fetchTransactions, isLoading } = useWalletStore();
  
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'deposits', label: 'Deposits' },
    { id: 'withdrawals', label: 'Withdrawals' },
    { id: 'payments', label: 'Payments' },
  ];
  
  const filteredTransactions = transactions
    .filter(transaction => {
      // Filter by user ID
      if (transaction.userId !== user?.id) return false;
      
      // Filter by tab
      switch (activeTab) {
        case 'deposits':
          return ['deposit', 'job-payment'].includes(transaction.type);
        case 'withdrawals':
          return transaction.type === 'withdrawal';
        case 'payments':
          return transaction.type === 'job-advance';
        default:
          return true;
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const pendingWithdrawals = filteredTransactions.filter(
    t => t.type === 'withdrawal' && t.status === 'pending'
  );
  
  const pendingPayments = filteredTransactions.filter(
    t => t.type === 'job-payment' && t.status === 'pending'
  );
  
  const handleWithdraw = () => {
    router.push('/wallet/withdraw');
  };
  
  const handleAddMoney = () => {
    Alert.alert(
      'Add Money',
      'This feature will be available soon. You will be able to add money to your wallet using various payment methods.',
      [{ text: 'OK' }]
    );
  };
  
  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
      case 'job-payment':
        return <ArrowDownLeft size={20} color={colors.success} />;
      case 'withdrawal':
        return <ArrowUpRight size={20} color={transaction.status === 'pending' ? colors.warning : colors.error} />;
      case 'job-advance':
        return <ArrowUpRight size={20} color={colors.error} />;
      default:
        return <IndianRupee size={20} color={colors.primary} />;
    }
  };
  
  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return 'Wallet Deposit';
      case 'withdrawal':
        return 'Withdrawal Request';
      case 'job-payment':
        return transaction.jobTitle ? `Payment for ${transaction.jobTitle}` : 'Job Payment';
      case 'job-advance':
        return transaction.jobTitle ? `Advance for ${transaction.jobTitle}` : 'Job Advance';
      default:
        return 'Transaction';
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge label="Completed" variant="success" />;
      case 'pending':
        return <Badge label="Pending" variant="warning" />;
      case 'failed':
        return <Badge label="Failed" variant="error" />;
      default:
        return <Badge label={status} />;
    }
  };
  
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    return (
      <Card style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionIconContainer}>
            {getTransactionIcon(item)}
          </View>
          
          <View style={styles.transactionInfo}>
            <Text style={[styles.transactionTitle, { color: colors.text }]} numberOfLines={1}>
              {getTransactionTitle(item)}
            </Text>
            
            <Text style={[styles.transactionDate, { color: colors.placeholder }]}>
              {formatDateTime(item.date)}
            </Text>
          </View>
          
          <View style={styles.transactionAmount}>
            <Text 
              style={[
                styles.amountText, 
                { 
                  color: ['deposit', 'job-payment'].includes(item.type) 
                    ? colors.success 
                    : colors.error 
                }
              ]}
            >
              {['deposit', 'job-payment'].includes(item.type) ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
            
            {getStatusBadge(item.status)}
          </View>
        </View>
        
        {item.reference && (
          <View style={[styles.referenceContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.referenceLabel, { color: colors.placeholder }]}>
              Reference:
            </Text>
            <Text style={[styles.referenceValue, { color: colors.text }]}>
              {formatTransactionReference(item.reference)}
            </Text>
          </View>
        )}
        
        {item.status === 'pending' && item.type === 'withdrawal' && (
          <View style={[styles.pendingInfoContainer, { backgroundColor: 'rgba(255, 184, 0, 0.1)' }]}>
            <AlertCircle size={16} color={colors.warning} />
            <Text style={[styles.pendingInfoText, { color: colors.text }]}>
              Your withdrawal request is being processed. Funds will be transferred to your bank account within 2-3 business days.
            </Text>
          </View>
        )}
        
        {item.status === 'pending' && item.type === 'job-payment' && (
          <View style={[styles.pendingInfoContainer, { backgroundColor: 'rgba(255, 184, 0, 0.1)' }]}>
            <AlertCircle size={16} color={colors.warning} />
            <Text style={[styles.pendingInfoText, { color: colors.text }]}>
              This payment is pending admin approval. Once approved, you can withdraw the funds to your bank account.
            </Text>
          </View>
        )}
      </Card>
    );
  };
  
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.placeholder }]}>
            Loading transactions...
          </Text>
        </View>
      );
    }
    
    switch (activeTab) {
      case 'deposits':
        return (
          <EmptyState
            title="No Deposits"
            description="You haven't received any deposits yet."
            icon={<ArrowDownLeft size={32} color={colors.placeholder} />}
          />
        );
      case 'withdrawals':
        return (
          <EmptyState
            title="No Withdrawals"
            description="You haven't made any withdrawal requests yet."
            icon={<ArrowUpRight size={32} color={colors.placeholder} />}
            actionLabel="Withdraw Funds"
            onAction={handleWithdraw}
          />
        );
      case 'payments':
        return (
          <EmptyState
            title="No Payments"
            description="You haven't made any payments yet."
            icon={<IndianRupee size={32} color={colors.placeholder} />}
          />
        );
      default:
        return (
          <EmptyState
            title="No Transactions"
            description="You don't have any transactions yet."
            icon={<Wallet size={32} color={colors.placeholder} />}
          />
        );
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(user?.walletBalance || 0)}</Text>
        
        <View style={styles.balanceActions}>
          <Button
            title="Withdraw"
            onPress={handleWithdraw}
            variant="outline"
            style={[styles.balanceButton, { borderColor: '#FFFFFF' }]}
            textStyle={{ color: '#FFFFFF' }}
            leftIcon={<ArrowUpRight size={16} color="#FFFFFF" />}
          />
          
          {user?.role === 'organizer' && (
            <Button
              title="Add Money"
              onPress={handleAddMoney}
              variant="outline"
              style={[styles.balanceButton, { borderColor: '#FFFFFF' }]}
              textStyle={{ color: '#FFFFFF' }}
              leftIcon={<Plus size={16} color="#FFFFFF" />}
            />
          )}
        </View>
      </Card>
      
      <View style={styles.pendingContainer}>
        {pendingWithdrawals.length > 0 && (
          <View style={[styles.pendingCard, { backgroundColor: colors.card }]}>
            <Clock size={20} color={colors.warning} />
            <Text style={[styles.pendingText, { color: colors.text }]}>
              You have {pendingWithdrawals.length} pending withdrawal {pendingWithdrawals.length === 1 ? 'request' : 'requests'}. Processing takes 2-3 business days.
            </Text>
          </View>
        )}
        
        {pendingPayments.length > 0 && (
          <View style={[styles.pendingCard, { backgroundColor: colors.card }]}>
            <Clock size={20} color={colors.warning} />
            <Text style={[styles.pendingText, { color: colors.text }]}>
              You have {pendingPayments.length} pending payment {pendingPayments.length === 1 ? 'receipt' : 'receipts'} awaiting admin approval.
            </Text>
          </View>
        )}
      </View>
      
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
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
  balanceCard: {
    margin: 16,
    padding: 20,
  },
  balanceLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  balanceAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  balanceButton: {
    flex: 1,
  },
  pendingContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  pendingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 2,
  },
  transactionDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    marginBottom: 4,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    marginTop: 12,
  },
  referenceLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginRight: 4,
  },
  referenceValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  pendingInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  pendingInfoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});