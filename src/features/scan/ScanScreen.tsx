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
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { processOCR } from '../../core/api/ocr.api';
import { colors } from '../../theme/colors';

export default function ScanScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [merchant, setMerchant] = useState('');
  const [currentItem, setCurrentItem] = useState({ name: '', price: '' });
  const cameraRef = useRef<any>(null);

  // Camera start karo
  const startCamera = async () => {
    const { status } = await requestPermission();
    if (status === 'granted') {
      setIsCameraActive(true);
    }
  };

  // OCR Processing logic
  const handleImageSource = async (uri: string) => {
    setProcessing(true);
    try {
      const result = await processOCR(uri);
      if (result.items.length > 0) {
        setItems((prev) => [...prev, ...result.items]);
        if (result.merchant && !merchant) {
          setMerchant(result.merchant);
        }
        Alert.alert('Success', `Detected ${result.items.length} items${result.merchant ? ' from ' + result.merchant : ''}`);
      } else {
        Alert.alert('Info', 'No items detected. Try another photo or add manually.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  // Capture Photo
  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setIsCameraActive(false);
        handleImageSource(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  // Item add karo
  const addItem = () => {
    if (currentItem.name && currentItem.price) {
      setItems([...items, { 
        ...currentItem, 
        id: Date.now().toString(),
        price: parseFloat(currentItem.price) 
      }]);
      setCurrentItem({ name: '', price: '' });
    } else {
      Alert.alert('Error', 'Please enter item name and price');
    }
  };

  // Item delete karo
  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Total calculate karo
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  // Bill save karo
  const saveBill = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Add at least one item');
      return;
    }

    const billData = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      merchant: merchant || 'Unknown Merchant',
      items: items,
      grandTotal: calculateTotal(),
      scannedAt: new Date().toISOString(),
    };

    try {
      // Save to AsyncStorage
      const existingBills = await AsyncStorage.getItem('bills');
      const bills = existingBills ? JSON.parse(existingBills) : [];
      bills.push(billData);
      await AsyncStorage.setItem('bills', JSON.stringify(bills));

      // Update total expense
      const totalSpent = await AsyncStorage.getItem('totalSpent');
      const newTotal = (parseFloat(totalSpent || '0') + billData.grandTotal).toString();
      await AsyncStorage.setItem('totalSpent', newTotal);

      Alert.alert('Success', 'Bill saved successfully!');
      setItems([]);
      setMerchant('');
      navigation.goBack();
      
    } catch (error) {
      Alert.alert('Error', 'Failed to save bill');
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
        <Text style={{ fontSize: 18, color: colors.textPrimary, textAlign: 'center', marginTop: 20 }}>
          Camera permission is required to scan bills
        </Text>
        <TouchableOpacity 
          style={[styles.saveAllBtn, { marginTop: 30, width: '100%' }]} 
          onPress={requestPermission}
        >
          <Text style={styles.saveAllText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ marginTop: 20 }} 
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Bill</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Manual Item Entry Section */}
        <View style={styles.manualSection}>
          <Text style={styles.sectionTitle}>Add Items Manually</Text>
          
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 2 }]}
              placeholder="Item name (e.g., Milk)"
              value={currentItem.name}
              onChangeText={(text) => setCurrentItem({ ...currentItem, name: text })}
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Price"
              value={currentItem.price}
              onChangeText={(text) => setCurrentItem({ ...currentItem, price: text })}
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addItem}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Items List */}
          {items.length > 0 ? (
            <>
              {items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                  <TouchableOpacity onPress={() => deleteItem(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>₹{calculateTotal().toFixed(2)}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No items added yet</Text>
          )}
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        {/* Camera Section */}
        <View style={styles.cameraSection}>
          <Text style={styles.sectionTitle}>Scan with Camera</Text>
          
          {processing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingText}>Extracting items...</Text>
            </View>
          ) : !isCameraActive ? (
            <TouchableOpacity style={styles.startCameraBtn} onPress={startCamera}>
              <Ionicons name="camera" size={40} color={colors.primary} />
              <Text style={styles.startCameraText}>Start Camera</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
              />
              <View style={styles.cameraOverlay}>
                <TouchableOpacity 
                  style={styles.captureButton}
                  onPress={takePhoto}
                >
                  <View style={styles.captureInner} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.closeCamera}
                  onPress={() => setIsCameraActive(false)}
                >
                  <Ionicons name="close-circle" size={32} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.galleryBtn}
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
              });
              if (!result.canceled) {
                handleImageSource(result.assets[0].uri);
              }
            }}
          >
            <Ionicons name="images-outline" size={24} color={colors.primary} />
            <Text style={styles.galleryText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        {items.length > 0 && (
          <TouchableOpacity style={styles.saveAllBtn} onPress={saveBill}>
            <Text style={styles.saveAllText}>
              Save Bill (₹{calculateTotal().toFixed(2)})
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  manualSection: {
    backgroundColor: colors.surface,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  addBtn: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  itemName: {
    flex: 2,
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemPrice: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    marginHorizontal: 10,
    color: colors.textSecondary,
  },
  cameraSection: {
    backgroundColor: colors.surface,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  startCameraBtn: {
    alignItems: 'center',
    padding: 30,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  startCameraText: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 10,
  },
  cameraContainer: {
    height: 350,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  captureButton: {
    position: 'absolute',
    bottom: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
  },
  closeCamera: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  processingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  galleryText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 10,
  },
  saveAllBtn: {
    backgroundColor: colors.primary,
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  saveAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});