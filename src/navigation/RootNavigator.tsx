import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../features/dashboard/DashboardScreen";
import ScanScreen from "../features/scan/ScanScreen";
import LoginScreen from "../features/auth/LoginScreen";
import SignupScreen from "../features/auth/SignupScreen";
import { useAuth } from "../core/hooks/useAuth";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { userToken } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator id="root-navigator" screenOptions={{ headerShown: false }}>
        {userToken ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Scan" component={ScanScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
