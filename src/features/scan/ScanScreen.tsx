import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { processOCR } from '../../core/api/ocr.api';
import { createExpense } from '../../core/api/expense.api';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

interface ScannedBill {
  id: string;
  merchant: string;
  date: string;
  time: string;
  items: any[];
  grandTotal: number;
  imageUri?: string;
  scannedAt: string;
  isSaved: boolean;
}

export default function ScanScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Requirement: Maintain an array of scanned items
  const [allScannedBills, setAllScannedBills] = useState<ScannedBill[]>([]);
  
  const cameraRef = useRef<any>(null);

  // Load saved items on app reload
  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const saved = await AsyncStorage.getItem('scanned_bills_session');
      if (saved) {
        setAllScannedBills(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load bills', e);
    }
  };

  const saveBillsToStorage = async (bills: ScannedBill[]) => {
    try {
      await AsyncStorage.setItem('scanned_bills_session', JSON.stringify(bills));
    } catch (e) {
      console.error('Failed to save bills', e);
    }
  };

  // OCR Processing logic
  const handleImageSource = async (uri: string) => {
    setProcessing(true);
    try {
      const result = await processOCR(uri);
      
      // Requirement: On each new scan, push the new data into the array
      const newBill: ScannedBill = {
        id: Date.now().toString(),
        merchant: result.merchant || 'Unknown Merchant',
        date: result.date || new Date().toISOString().split('T')[0],
        time: result.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: result.items || [],
        grandTotal: result.total || 0,
        imageUri: uri,
        scannedAt: new Date().toISOString(),
        isSaved: false,
      };

      const updatedBills = [newBill, ...allScannedBills];
      setAllScannedBills(updatedBills);
      await saveBillsToStorage(updatedBills);

      Alert.alert(
        'Scan Complete',
        `Added bill from ${newBill.merchant}. Total: ₹${newBill.grandTotal.toFixed(2)}`
      );
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  // Capture Photo
  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setIsCameraActive(false);
        handleImageSource(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const deleteBill = async (id: string) => {
    const updated = allScannedBills.filter(b => b.id !== id);
    setAllScannedBills(updated);
    await saveBillsToStorage(updated);
  };

  // Final save functionality
  const saveAllToPermanent = async () => {
    if (allScannedBills.length === 0) return;

    setIsSaving(true);
    try {
      const existingPermanent = await AsyncStorage.getItem('bills');
      const permanentBills = existingPermanent ? JSON.parse(existingPermanent) : [];
      
      // Filter out bills already saved if we had that logic, 
      // but for now let's just push all new ones
      const unsavedBills = allScannedBills.filter(b => !b.isSaved);
      
      // 1. Sync with backend
      for (const bill of unsavedBills) {
        try {
          await createExpense({
            merchant: bill.merchant,
            amount: bill.grandTotal,
            date: bill.date,
            items: bill.items,
            category: 'Scanned Bill'
          });
        } catch (apiError) {
          console.warn(`API sync failed for bill ${bill.id}`);
        }
      }

      // 2. Update local permanent storage
      const newPermanent = [...unsavedBills, ...permanentBills];
      await AsyncStorage.setItem('bills', JSON.stringify(newPermanent));

      // 3. Update total spent
      const totalSpent = await AsyncStorage.getItem('totalSpent');
      const additional = unsavedBills.reduce((sum, b) => sum + b.grandTotal, 0);
      const newTotal = (parseFloat(totalSpent || '0') + additional).toString();
      await AsyncStorage.setItem('totalSpent', newTotal);

      // 4. Clear current session
      setAllScannedBills([]);
      await AsyncStorage.removeItem('scanned_bills_session');

      Alert.alert('Success', 'All bills saved to your expenses!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save bills permanently');
    } finally {
      setIsSaving(false);
    }
  };

  const renderBillItem = (bill: ScannedBill) => (
    <View key={bill.id} style={styles.billCard}>
      <View style={styles.billCardHeader}>
        {bill.imageUri ? (
          <Image source={{ uri: bill.imageUri }} style={styles.billPreview} />
        ) : (
          <View style={[styles.billPreview, styles.placeholderPreview]}>
            <Ionicons name="document-text" size={30} color={colors.textSecondary} />
          </View>
        )}
        <View style={styles.billInfo}>
          <Text style={styles.merchantText} numberOfLines={1}>{bill.merchant}</Text>
          <Text style={styles.dateTimeText}>{bill.date} • {bill.time}</Text>
          <Text style={styles.totalText}>₹{bill.grandTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity onPress={() => deleteBill(bill.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>
      
      {bill.items.length > 0 && (
        <View style={styles.itemsPreview}>
          <Text style={styles.itemsCountText}>{bill.items.length} items detected</Text>
          <View style={styles.itemTags}>
            {bill.items.slice(0, 3).map((item: any, idx: number) => (
              <View key={idx} style={styles.itemTag}>
                <Text style={styles.itemTagText} numberOfLines={1}>{item.name}</Text>
              </View>
            ))}
            {bill.items.length > 3 && (
              <Text style={styles.moreItemsText}>+{bill.items.length - 3} more</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.permissionText}>
          Camera permission is required to scan bills
        </Text>
        <TouchableOpacity 
          style={styles.grantBtn} 
          onPress={requestPermission}
        >
          <Text style={styles.grantBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Scanner</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Requirement: Render all items dynamically */}
        <View style={styles.listContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scanned Bills ({allScannedBills.length})</Text>
            {allScannedBills.length > 0 && (
              <TouchableOpacity onPress={() => {
                setAllScannedBills([]);
                AsyncStorage.removeItem('scanned_bills_session');
              }}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {allScannedBills.length > 0 ? (
            allScannedBills.map(renderBillItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="scan-outline" size={60} color="#E1E6EF" />
              <Text style={styles.emptyText}>No bills scanned yet in this session.</Text>
            </View>
          )}
        </View>

        <View style={styles.scannerActions}>
          {processing ? (
            <View style={styles.processingCard}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingText}>Analyzing bill with AI...</Text>
            </View>
          ) : !isCameraActive ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setIsCameraActive(true)}>
                <LinearGradient colors={['#4776E6', '#8E54E9']} style={styles.actionGradient}>
                  <Ionicons name="camera" size={28} color="#fff" />
                  <Text style={styles.actionBtnText}>Take Photo</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={async () => {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.8,
                  });
                  if (!result.canceled) {
                    handleImageSource(result.assets[0].uri);
                  }
                }}
              >
                <LinearGradient colors={['#11998E', '#38EF7D']} style={styles.actionGradient}>
                  <Ionicons name="images" size={28} color="#fff" />
                  <Text style={styles.actionBtnText}>Gallery</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
              />
              <View style={styles.cameraOverlay}>
                <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
                  <View style={styles.captureInner} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.closeCamera}
                  onPress={() => setIsCameraActive(false)}
                >
                  <Ionicons name="close-circle" size={44} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {allScannedBills.length > 0 && !isCameraActive && (
          <TouchableOpacity 
            style={[styles.saveAllBtn, isSaving && { opacity: 0.7 }]} 
            onPress={saveAllToPermanent}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveAllBtnText}>
                Save All Bills to Expenses
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  listContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  clearAllText: {
    color: colors.error,
    fontWeight: '600',
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  billCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billPreview: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  placeholderPreview: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  billInfo: {
    flex: 1,
    marginLeft: 15,
  },
  merchantText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  dateTimeText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 5,
  },
  itemsPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  itemsCountText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 8,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 100,
  },
  itemTagText: {
    fontSize: 10,
    color: '#475569',
  },
  moreItemsText: {
    fontSize: 10,
    color: '#94A3B8',
    paddingVertical: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 15,
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  scannerActions: {
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  actionBtn: {
    flex: 1,
  },
  actionGradient: {
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginTop: 8,
  },
  cameraContainer: {
    height: 450,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#fff',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  closeCamera: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  processingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 15,
    color: colors.primary,
    fontWeight: '700',
  },
  saveAllBtn: {
    backgroundColor: colors.primary,
    margin: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveAllBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  permissionText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
  grantBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  grantBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
