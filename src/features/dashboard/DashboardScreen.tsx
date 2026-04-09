import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const transactions = {
  Today: [
    {
      id: 1,
      name: 'AT&T',
      description: 'Unlimited Family Plan',
      amount: '- $34.99',
      icon: '📱',
      color: '#0057A8',
    },
    {
      id: 2,
      name: 'CC Subscription',
      description: 'CC All Apps',
      amount: '- $59.99',
      icon: '🎨',
      color: '#FF0000',
    },
  ],
  Yesterday: [
    {
      id: 3,
      name: 'Blizzard Entertainment',
      description: '6-Month Subscription',
      amount: '- $79.89',
      icon: '🎮',
      color: '#00AAFF',
    },
    {
      id: 4,
      name: 'Netflix',
      description: 'Basic Plan',
      amount: '- $7.99',
      icon: '🎬',
      color: '#E50914',
    },
  ],
};

const allBills = [
  { id: 1, merchant: 'Walmart', amount: 45.67, date: 'Today', category: 'Groceries', items: 12 },
  { id: 2, merchant: 'Starbucks', amount: 12.50, date: 'Yesterday', category: 'Food', items: 2 },
  { id: 3, merchant: 'Uber', amount: 24.30, date: 'Yesterday', category: 'Transport', items: 1 },
  { id: 4, merchant: 'Amazon', amount: 89.99, date: '2 days ago', category: 'Shopping', items: 3 },
  { id: 5, merchant: 'Target', amount: 67.80, date: '3 days ago', category: 'Shopping', items: 8 },
  { id: 6, merchant: 'McDonald\'s', amount: 15.20, date: '3 days ago', category: 'Food', items: 3 },
  { id: 7, merchant: 'Shell', amount: 45.00, date: '4 days ago', category: 'Transport', items: 1 },
  { id: 8, merchant: 'Costco', amount: 156.30, date: '5 days ago', category: 'Groceries', items: 15 },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Home');
  const [prompt, setPrompt] = useState('');
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeModal();
        } else {
          openModal();
        }
      },
    })
  ).current;

  const openModal = () => {
    setScanModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setScanModalVisible(false));
  };

  const handleScanPress = () => {
    navigation.navigate('Scan');
  };

  const openCamera = () => {
    closeModal();
    navigation.navigate('Scan');
  };

  const handleMCPPrompt = () => {
    if (prompt.trim()) {
      Alert.alert('MCP Assistant', `Processing: "${prompt}"`);
      setPrompt('');
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Card - Curved only at bottom */}
        <View style={styles.mainCard}>
          {/* Header inside card - FIXED SPACING */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AJ</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>Anthony Jones</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* Balance Section */}
          <View style={styles.balanceSection}>
            <Text style={styles.availableLabel}>Available on card</Text>
            <Text style={styles.balanceAmount}>$13,528.31</Text>

            <View style={styles.transferRow}>
              <Text style={styles.transferLabel}>Transfer Limit</Text>
              <Text style={styles.transferAmount}>$12,000</Text>
            </View>

            <View style={styles.dividerLine} />

            <Text style={styles.spentText}>Spent $1,244.65</Text>

            {/* Quick Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={handleScanPress}
              >
                <LinearGradient
                  colors={['#4776E6', '#8E54E9']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="scan-outline" size={26} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.actionBtnText}>Scan Bill</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => navigation.navigate('MCP')}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={26} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.actionBtnText}>MCP</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => navigation.navigate('Payment')}
              >
                <LinearGradient
                  colors={['#11998E', '#38EF7D']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="wallet-outline" size={26} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.actionBtnText}>Pay</Text>
              </TouchableOpacity>
            </View>

            {/* Deposit Button */}
            <TouchableOpacity style={styles.depositBtn}>
              <LinearGradient
                colors={['#F2994A', '#F2C94C']}
                style={styles.depositGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.depositBtnText}>Deposit Money</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Operations Section */}
          <View style={styles.operationsSection}>
            <View style={styles.operationsHeader}>
              <Text style={styles.operationsTitle}>Operations</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {Object.entries(transactions).map(([day, items]) => (
              <View key={day}>
                <Text style={styles.dayLabel}>{day}</Text>
                {items.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.transactionItem}>
                    <View style={[styles.transactionIcon, { backgroundColor: item.color + '20' }]}>
                      <Text style={styles.transactionIconText}>{item.icon}</Text>
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionName}>{item.name}</Text>
                      <Text style={styles.transactionDescription}>{item.description}</Text>
                    </View>
                    <Text style={styles.transactionAmount}>{item.amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            {/* Recent Scans Preview */}
            <View style={styles.recentScansHeader}>
              <Text style={styles.recentScansTitle}>Recent Scans</Text>
              <TouchableOpacity onPress={openModal}>
                <Text style={styles.viewAll}>View All Bills</Text>
              </TouchableOpacity>
            </View>

            {allBills.slice(0, 2).map((scan) => (
              <TouchableOpacity key={scan.id} style={styles.scanItem}>
                <View style={styles.scanIcon}>
                  <Ionicons name="document-text-outline" size={24} color="#4776E6" />
                </View>
                <View style={styles.scanInfo}>
                  <Text style={styles.scanMerchant}>{scan.merchant}</Text>
                  <Text style={styles.scanDate}>{scan.date} • {scan.category} • {scan.items} items</Text>
                </View>
                <Text style={styles.scanAmount}>${formatAmount(scan.amount)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom padding for scroll */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setSelectedTab('Home')}
        >
          <Ionicons 
            name={selectedTab === 'Home' ? 'home' : 'home-outline'} 
            size={24} 
            color={selectedTab === 'Home' ? '#4776E6' : '#8E8E93'} 
          />
          <Text style={[styles.navText, selectedTab === 'Home' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setSelectedTab('Insights')}
        >
          <Ionicons 
            name={selectedTab === 'Insights' ? 'bar-chart' : 'bar-chart-outline'} 
            size={24} 
            color={selectedTab === 'Insights' ? '#4776E6' : '#8E8E93'} 
          />
          <Text style={[styles.navText, selectedTab === 'Insights' && styles.navTextActive]}>Insights</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setSelectedTab('Wallet')}
        >
          <Ionicons 
            name={selectedTab === 'Wallet' ? 'wallet' : 'wallet-outline'} 
            size={24} 
            color={selectedTab === 'Wallet' ? '#4776E6' : '#8E8E93'} 
          />
          <Text style={[styles.navText, selectedTab === 'Wallet' && styles.navTextActive]}>Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setSelectedTab('More')}
        >
          <Ionicons 
            name={selectedTab === 'More' ? 'menu' : 'menu-outline'} 
            size={24} 
            color={selectedTab === 'More' ? '#4776E6' : '#8E8E93'} 
          />
          <Text style={[styles.navText, selectedTab === 'More' && styles.navTextActive]}>More</Text>
        </TouchableOpacity>
      </View>

      {/* Scan Modal - Bottom Sheet */}
      <Modal
        visible={scanModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan Bill Hub</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Camera Button */}
              <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
                <LinearGradient
                  colors={['#4776E6', '#8E54E9']}
                  style={styles.cameraButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="camera" size={32} color="#FFFFFF" />
                  <Text style={styles.cameraButtonText}>Open Scanner</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* MCP Section */}
              <View style={styles.mcpSection}>
                <Text style={styles.sectionTitle}>MCP Assistant</Text>
                <View style={styles.promptContainer}>
                  <TextInput
                    style={styles.promptInput}
                    placeholder="Ask MCP anything about your bills..."
                    placeholderTextColor="#8E8E93"
                    value={prompt}
                    onChangeText={setPrompt}
                    multiline
                  />
                  <TouchableOpacity 
                    style={styles.promptSendBtn}
                    onPress={handleMCPPrompt}
                  >
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* All Bills List */}
              <View style={styles.ocrSection}>
                <Text style={styles.sectionTitle}>All Bills</Text>
                {allBills.map((scan) => (
                  <TouchableOpacity key={scan.id} style={styles.scanCard}>
                    <View style={styles.scanCardHeader}>
                      <View style={styles.scanCardLeft}>
                        <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(scan.category) }]}>
                          <Ionicons name={getCategoryIcon(scan.category)} size={20} color="#FFFFFF" />
                        </View>
                        <View>
                          <Text style={styles.scanCardMerchant}>{scan.merchant}</Text>
                          <Text style={styles.scanCardCategory}>{scan.category} • {scan.items} items</Text>
                        </View>
                      </View>
                      <Text style={styles.scanCardAmount}>${formatAmount(scan.amount)}</Text>
                    </View>
                    <View style={styles.scanCardFooter}>
                      <Text style={styles.scanCardDate}>{scan.date}</Text>
                      <TouchableOpacity style={styles.viewDetailsBtn}>
                        <Text style={styles.viewDetailsText}>View Details</Text>
                        <Ionicons name="arrow-forward" size={16} color="#4776E6" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity style={styles.quickActionItem} onPress={openCamera}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#4776E620' }]}>
                      <Ionicons name="camera" size={24} color="#4776E6" />
                    </View>
                    <Text style={styles.quickActionText}>Scan New</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickActionItem}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#FF6B6B20' }]}>
                      <Ionicons name="stats-chart" size={24} color="#FF6B6B" />
                    </View>
                    <Text style={styles.quickActionText}>Analytics</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickActionItem}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#11998E20' }]}>
                      <Ionicons name="download" size={24} color="#11998E" />
                    </View>
                    <Text style={styles.quickActionText}>Export</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickActionItem}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#F2994A20' }]}>
                      <Ionicons name="share" size={24} color="#F2994A" />
                    </View>
                    <Text style={styles.quickActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper functions for category colors and icons
const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    Groceries: '#4CAF50',
    Food: '#FF9800',
    Transport: '#2196F3',
    Shopping: '#9C27B0',
  };
  return colors[category] || '#757575';
};

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    Groceries: 'cart',
    Food: 'restaurant',
    Transport: 'car',
    Shopping: 'bag',
  };
  return icons[category] || 'document';
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 80,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
    width: '100%',
    marginTop: 0, // Ensure no top margin
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16, // Fixed top spacing
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  balanceSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  availableLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  transferRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transferLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  transferAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  spentText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
  },
  actionGradient: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionBtnText: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  depositBtn: {
    marginTop: 8,
  },
  depositGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  depositBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  operationsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  operationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  operationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  viewAll: {
    fontSize: 14,
    color: '#4776E6',
    fontWeight: '600',
  },
  dayLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  transactionIconText: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  recentScansHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  recentScansTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  scanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scanIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4776E610',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scanInfo: {
    flex: 1,
  },
  scanMerchant: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  scanDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  scanAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  navTextActive: {
    color: '#4776E6',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cameraButton: {
    marginBottom: 24,
  },
  cameraButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraContainer: {
    height: SCREEN_HEIGHT * 0.6,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 150,
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
  },
  scanCornerTopRight: {
    left: undefined,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  scanCornerBottomLeft: {
    top: undefined,
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  scanCornerBottomRight: {
    top: undefined,
    left: undefined,
    right: 0,
    bottom: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  scanInstruction: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeCameraBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAgainBtn: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#4776E6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mcpSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  promptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  promptInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
    maxHeight: 100,
  },
  promptSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4776E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ocrSection: {
    marginBottom: 24,
  },
  scanCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  scanCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scanCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scanCardMerchant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  scanCardCategory: {
    fontSize: 12,
    color: '#8E8E93',
  },
  scanCardAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scanCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanCardDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#4776E6',
    fontWeight: '500',
    marginRight: 4,
  },
  quickActions: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '500',
  },
});