import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";

interface AuthInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secure?: boolean;
  icon?: keyof typeof Feather.glyphMap;
}

export default function AuthInput({
  placeholder,
  value,
  onChangeText,
  secure = false,
  icon,
}: AuthInputProps) {
  const [isHidden, setIsHidden] = useState(secure);

  return (
    <View style={styles.container}>
      {/* Left Icon */}
      {icon && (
        <Feather
          name={icon}
          size={18}
          color="#9CA3AF"
          style={styles.leftIcon}
        />
      )}

      {/* Input Field */}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isHidden}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      {/* Password Toggle */}
      {secure && (
        <TouchableOpacity onPress={() => setIsHidden(!isHidden)}>
          <Feather
            name={isHidden ? "eye-off" : "eye"}
            size={18}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
