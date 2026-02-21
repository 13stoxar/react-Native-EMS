import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

export default function AnalyticsScreen() {
  const screenWidth = Dimensions.get('window').width;

  const spendingData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: [1200, 1900, 1500, 2340],
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const categoryData = [
    {
      name: 'Utilities',
      amount: 1869,
      color: '#6366F1',
      legendFontColor: '#7F7F7F',
    },
    {
      name: 'Groceries',
      amount: 1270,
      color: '#F97316',
      legendFontColor: '#7F7F7F',
    },
    {
      name: 'Transport',
      amount: 500,
      color: '#10B981',
      legendFontColor: '#7F7F7F',
    },
    {
      name: 'Others',
      amount: 350,
      color: '#EC4899',
      legendFontColor: '#7F7F7F',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Your spending overview</Text>
      </LinearGradient>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Spending</Text>
        <LineChart
          data={spendingData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#6366F1',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>Average</Text>
          <Text style={styles.statCardValue}>₹1,735</Text>
          <Text style={styles.statCardChange}>+12% vs last month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>Highest</Text>
          <Text style={styles.statCardValue}>₹2,340</Text>
          <Text style={styles.statCardChange}>Week 4</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Spending by Category</Text>
        <PieChart
          data={categoryData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>
            💡 You spent 40% more on utilities this month
          </Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>
            📊 Your highest spending day is Monday
          </Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>
            🎯 You're 15% under budget this month
          </Text>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 5,
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 5,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  statCardChange: {
    fontSize: 11,
    color: '#10B981',
  },
  insightsContainer: {
    margin: 20,
    marginTop: 0,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightText: {
    fontSize: 14,
    color: '#4B5563',
  },
});