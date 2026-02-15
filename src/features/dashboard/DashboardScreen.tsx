import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function DashboardScreen() {
  const navigation = useNavigation<any>();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "600" }}>
        Dashboard 🚀
      </Text>

      <TouchableOpacity
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: "#2563EB",
          borderRadius: 8,
        }}
        onPress={() => navigation.navigate("Scan")}
      >
        <Text style={{ color: "#fff" }}>Scan Receipt</Text>
      </TouchableOpacity>
    </View>
  );
}
