import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function BillsListScreen({ navigation }: any) {
  const [bills, setBills] = useState<any[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const billsData = await AsyncStorage.getItem('bills');
      const totalData = await AsyncStorage.getItem('totalSpent');
      
      if (billsData) setBills(JSON.parse(billsData));
      if (totalData) setTotalExpense(parseFloat(totalData));
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const deleteBill = async (id: string) => {
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this bill?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedBills = bills.filter(bill => bill.id !== id);
            await AsyncStorage.setItem('bills', JSON.stringify(updatedBills));
            setBills(updatedBills);
            
            // Recalculate total
            const newTotal = updatedBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
            await AsyncStorage.setItem('totalSpent', newTotal.toString());
            setTotalExpense(newTotal);
          }
        }
      ]
    );
  };

  const getMonthTotal = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return bills
      .filter(bill => {
        const billDate = new Date(bill.date);
        return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
      })
      .reduce((sum, bill) => sum + bill.grandTotal, 0);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bills</Text>
        <TouchableOpacity onPress={loadBills}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹{totalExpense}</Text>
          <Text style={styles.statLabel}>Total Expenses</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹{getMonthTotal()}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{bills.length}</Text>
          <Text style={styles.statLabel}>Total Bills</Text>
        </View>
      </View>

      <ScrollView style={styles.billsList}>
        {bills.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyText}>No bills scanned yet</Text>
            <TouchableOpacity 
              style={styles.scanBtn}
              onPress={() => navigation.navigate('Scan')}
            >
              <Text style={styles.scanBtnText}>Scan First Bill</Text>
            </TouchableOpacity>
          </View>
        ) : (
          bills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(bill => (
              <View key={bill.id} style={styles.billCard}>
                <View style={styles.billHeader}>
                  <View>
                    <Text style={styles.merchant}>{bill.merchant}</Text>
                    <Text style={styles.date}>{bill.date}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteBill(bill.id)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.billDetails}>
                  <Text style={styles.itemsCount}>
                    {bill.items?.length || 0} items
                  </Text>
                  <Text style={styles.total}>₹{bill.grandTotal || bill.total || 0}</Text>
                </View>
              </View>
            ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  billsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  billDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  itemsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 10,
    marginBottom: 20,
  },
  scanBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});