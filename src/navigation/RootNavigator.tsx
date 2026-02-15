import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../features/dashboard/DashboardScreen";
import ScanReceiptScreen from "../features/scan/ScanReceiptScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Scan" component={ScanReceiptScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
