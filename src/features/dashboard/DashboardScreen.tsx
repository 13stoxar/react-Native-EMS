import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { 
  AntDesign, 
  Feather, 
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons
} from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from "../../theme/colors";
import { requestSmsPermission, fetchSmsTransactions, SMSTransaction } from "../../core/api/sms.api";

export default function HomeScreen({ navigation }: any) {
  const [monthlyBudget, setMonthlyBudget] = useState("5000");
  const [totalSpent, setTotalSpent] = useState("0");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      // Load stored data
      const storedBudget = await AsyncStorage.getItem('monthlyBudget');
      const storedBills = await AsyncStorage.getItem('bills');
      const parsedBills = storedBills ? JSON.parse(storedBills) : [];

      if (storedBudget) setMonthlyBudget(storedBudget);

      // Fetch SMS Transactions
      let smsTransactions: SMSTransaction[] = [];
      if (Platform.OS === 'android') {
        const hasPermission = await requestSmsPermission();
        if (hasPermission) {
          smsTransactions = await fetchSmsTransactions();
        }
      }

      // Combine Bills and SMS
      const combined = [
        ...parsedBills.map((b: any) => ({ ...b, type: 'bill', category: 'Bill Scan' })),
        ...smsTransactions.map((s) => ({
          id: s.id,
          name: s.merchant,
          amount: s.amount,
          date: new Date(s.date).toISOString().split('T')[0],
          type: 'sms',
          category: 'SMS',
          rawDate: s.date
        }))
      ];

      // Sort by date (newest first)
      combined.sort((a, b) => {
        const dateA = a.rawDate || new Date(a.date).getTime();
        const dateB = b.rawDate || new Date(b.date).getTime();
        return dateB - dateA;
      });

      setRecentActivity(combined);

      // Calculate Total Spent (Simple sum for now)
      const total = combined.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      setTotalSpent(total.toFixed(2));
      await AsyncStorage.setItem('totalSpent', total.toString());

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const spentPercentage = (parseFloat(totalSpent) / parseFloat(monthlyBudget)) * 100;
  const remainingBudget = parseFloat(monthlyBudget) - parseFloat(totalSpent);

  const handleSetBudget = () => {
    Alert.prompt(
      "Set Monthly Budget",
      "Enter your monthly expense limit",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Save", 
          onPress: async (budget) => {
            if (budget) {
              setMonthlyBudget(budget);
              await AsyncStorage.setItem('monthlyBudget', budget);
            }
          }
        }
      ],
      "plain-text",
      monthlyBudget
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* Header with Greeting - LoginScreen style gradient */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>John Doe</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
            <FontAwesome5 name="user-circle" size={45} color={colors.surface} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Track your expenses smartly</Text>
      </LinearGradient>

      {/* Budget Card - Clean white card like login screen */}
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetTitle}>Monthly Budget</Text>
          <TouchableOpacity onPress={handleSetBudget} style={styles.editBtn}>
            <Feather name="edit-2" size={18} color={colors.primary} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.budgetAmounts}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Total Budget</Text>
            <Text style={styles.budgetValue}>₹{monthlyBudget}</Text>
          </View>
          <View style={styles.budgetDivider} />
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[styles.budgetValue, { color: remainingBudget < 0 ? colors.error : colors.success }]}>
              ₹{remainingBudget.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(spentPercentage, 100)}%`,
                  backgroundColor: spentPercentage > 100 ? colors.error : colors.primary
                }
              ]} 
            />
          </View>
          <View style={styles.progressStats}>
            <Text style={styles.progressText}>Spent: ₹{totalSpent}</Text>
            <Text style={styles.progressText}>
              {spentPercentage.toFixed(1)}% Used
            </Text>
          </View>
        </View>
      </View>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        <TouchableOpacity 
          style={[styles.periodBtn, selectedPeriod === 'daily' && styles.periodActive]}
          onPress={() => setSelectedPeriod('daily')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'daily' && styles.periodTextActive]}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.periodBtn, selectedPeriod === 'weekly' && styles.periodActive]}
          onPress={() => setSelectedPeriod('weekly')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'weekly' && styles.periodTextActive]}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.periodBtn, selectedPeriod === 'monthly' && styles.periodActive]}
          onPress={() => setSelectedPeriod('monthly')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'monthly' && styles.periodTextActive]}>Monthly</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {/* DashboardScreen.tsx mein Scan button */}
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => navigation.navigate('Scan')} 
          >
  <LinearGradient
    colors={['#EEF2FF', '#E0E7FF']}
    style={styles.actionIcon}
  >
    <MaterialCommunityIcons name="line-scan" size={28} color={colors.primary} />
  </LinearGradient>
  <Text style={styles.actionText}>Scan Bill</Text>
</TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <LinearGradient
              colors={['#F0FDF4', '#DCFCE7']}
              style={styles.actionIcon}
            >
              <Feather name="pie-chart" size={28} color={colors.success} />
            </LinearGradient>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <LinearGradient
              colors={['#FFF3E0', '#FFE5CC']}
              style={styles.actionIcon}
            >
              <AntDesign name="wallet" size={28} color={colors.accent} />
            </LinearGradient>
            <Text style={styles.actionText}>MCP Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <LinearGradient
              colors={['#FCE7F3', '#FBCFE8']}
              style={styles.actionIcon}
            >
              <Feather name="users" size={28} color="#EC4899" />
            </LinearGradient>
            <Text style={styles.actionText}>Customers</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="receipt-outline" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{recentActivity.filter(i => i.type === 'bill').length}</Text>
          <Text style={styles.statLabel}>Total Bills</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="chatbox-ellipses-outline" size={24} color={colors.accent} />
          <Text style={styles.statNumber}>{recentActivity.filter(i => i.type === 'sms').length}</Text>
          <Text style={styles.statLabel}>SMS Syncs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color={colors.success} />
          <Text style={styles.statNumber}>₹{Math.round(parseFloat(totalSpent) / 30)}</Text>
          <Text style={styles.statLabel}>Daily Avg</Text>
        </View>
      </View>

      {/* MCP Feature Card */}
      <TouchableOpacity style={styles.mcpCard}>
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.mcpGradient}
        >
          <View style={styles.mcpContent}>
            <View>
              <Text style={styles.mcpTitle}>⚡ Metered Consumption</Text>
              <Text style={styles.mcpDesc}>
                Track usage & set limits for customers
              </Text>
            </View>
            <MaterialCommunityIcons name="lightning-bolt" size={40} color={colors.surface} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Recent Activity */}
      <View style={styles.recentBills}>
        <View style={styles.recentBillsHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {recentActivity.length > 0 ? (
          recentActivity.slice(0, 5).map((item, index) => (
            <TouchableOpacity key={index} style={styles.billItem}>
              <View style={[styles.billIconContainer, { backgroundColor: item.type === 'sms' ? '#FEF3C7' : '#EEF2FF' }]}>
                <MaterialCommunityIcons 
                  name={item.type === 'sms' ? 'message-processing-outline' : 'receipt'} 
                  size={24} 
                  color={item.type === 'sms' ? colors.accent : colors.primary} 
                />
              </View>
              <View style={styles.billInfo}>
                <Text style={styles.billName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.billDate}>{item.date} • {item.category}</Text>
              </View>
              <Text style={styles.billAmount}>₹{item.amount}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>
            No recent transactions found.
          </Text>
        )}
      </View>

      {/* Bottom Padding */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  greeting: {
    color: '#E0E7FF',
    fontSize: 14,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#E0E7FF',
    fontSize: 14,
    marginTop: 5,
  },
  profileBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editText: {
    marginLeft: 5,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  budgetItem: {
    flex: 1,
  },
  budgetDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 15,
  },
  budgetLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  budgetValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  periodContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 30,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 25,
  },
  periodActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.surface,
    fontWeight: '500',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '23%',
    alignItems: 'center',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  mcpCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mcpGradient: {
    padding: 20,
  },
  mcpContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mcpTitle: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  mcpDesc: {
    color: '#E0E7FF',
    fontSize: 13,
  },
  recentBills: {
    paddingHorizontal: 20,
  },
  recentBillsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAll: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  billIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  billDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});