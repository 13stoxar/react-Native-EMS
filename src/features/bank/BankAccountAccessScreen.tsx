import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function BankAccountAccessScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [consentStatus, setConsentStatus] = useState<'NONE' | 'PENDING' | 'ACTIVE' | 'REVOKED'>('NONE');
  const [transactions, setTransactions] = useState<any[]>([]);

  const initiateConsent = async () => {
    setLoading(true);
    // TODO: Integrate with AA Backend
    setTimeout(() => {
      setConsentStatus('PENDING');
      setLoading(false);
      // Simulate redirection to AA Provider
      alert('Redirecting to RBI-approved Account Aggregator...');
    }, 1500);
  };

  const checkStatus = async () => {
    setLoading(true);
    // TODO: Poll backend for consent status
    setTimeout(() => {
      setConsentStatus('ACTIVE');
      setTransactions([
        { id: '1', merchant: 'Zomato', amount: '450.00', date: '2024-03-20', type: 'DEBIT' },
        { id: '2', merchant: 'Amazon', amount: '1200.00', date: '2024-03-19', type: 'DEBIT' },
        { id: '3', merchant: 'Salary', amount: '75000.00', date: '2024-03-01', type: 'CREDIT' },
      ]);
      setLoading(false);
    }, 1000);
  };

  const revokeConsent = () => {
    setConsentStatus('REVOKED');
    setTransactions([]);
    alert('Consent revoked successfully.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Account Access</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="shield-check" size={40} color={colors.primary} />
          </View>
          <Text style={styles.infoTitle}>Secure & RBI Compliant</Text>
          <Text style={styles.infoDesc}>
            We use the RBI Account Aggregator (AA) framework to securely access your financial data. 
            This is consent-based, encrypted, and you have full control.
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={18} color={colors.success} />
              <Text style={styles.featureText}>No passwords or OTPs shared with us</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={18} color={colors.success} />
              <Text style={styles.featureText}>Encryption ensures data privacy</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={18} color={colors.success} />
              <Text style={styles.featureText}>Revoke access anytime</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Consent Status</Text>
          <View style={[styles.statusBadge, 
            consentStatus === 'ACTIVE' ? styles.statusActive : 
            consentStatus === 'PENDING' ? styles.statusPending : 
            consentStatus === 'REVOKED' ? styles.statusRevoked : styles.statusNone
          ]}>
            <Text style={styles.statusText}>{consentStatus}</Text>
          </View>
        </View>

        {consentStatus === 'NONE' || consentStatus === 'REVOKED' ? (
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={initiateConsent}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.primaryBtnText}>Connect via Account Aggregator</Text>
                <Feather name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        ) : consentStatus === 'PENDING' ? (
          <TouchableOpacity 
            style={styles.secondaryBtn} 
            onPress={checkStatus}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={colors.primary} /> : (
              <Text style={styles.secondaryBtnText}>Check Approval Status</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.map(item => (
              <View key={item.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.merchantName}>{item.merchant}</Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <Text style={[styles.amountText, item.type === 'CREDIT' ? styles.credit : styles.debit]}>
                  {item.type === 'CREDIT' ? '+' : '-'}₹{item.amount}
                </Text>
              </View>
            ))}
            
            <TouchableOpacity style={styles.revokeBtn} onPress={revokeConsent}>
              <Text style={styles.revokeBtnText}>Revoke Data Access</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  backBtn: {
    padding: 5,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 25,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  infoDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  featureList: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: 10,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  statusRevoked: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  statusNone: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  credit: {
    color: colors.success,
  },
  debit: {
    color: colors.error,
  },
  revokeBtn: {
    marginTop: 30,
    alignItems: 'center',
    padding: 10,
  },
  revokeBtnText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
