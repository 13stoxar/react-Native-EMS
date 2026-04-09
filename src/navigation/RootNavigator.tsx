import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../core/hooks/useAuth';

// Import Screens
import LoginScreen from '../features/auth/LoginScreen';
import SignupScreen from '../features/auth/SignupScreen';
import DashboardScreen from '../features/dashboard/DashboardScreen';
import ScanScreen from '../features/scan/ScanScreen';
import ChatBotScreen from '../features/chatbot/ChatBotScreen';
import AnalyticsScreen from '../features/analytics/AnalyticsScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import BillsListScreen from '../features/bills/BillsListScreen';
import BankAccountAccessScreen from '../features/bank/BankAccountAccessScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { userToken } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {userToken == null ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        // App Stack
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Scan" component={ScanScreen} />
          <Stack.Screen name="MCP" component={ChatBotScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Bills" component={BillsListScreen} />
          <Stack.Screen name="BankAccess" component={BankAccountAccessScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
