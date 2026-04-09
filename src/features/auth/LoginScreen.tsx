import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AuthInput from "./components/AuthInput";
import AuthButton from "./components/AuthButton";
import { colors } from "../../theme/colors";
import { useAuth } from "../../core/hooks/useAuth";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();

  // ✅ CLEAN ANDROID GOOGLE AUTH (PRODUCTION SAFE)
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "437335424413-g9rnct43ob03gm7fpvafktqlj2e8p7fv.apps.googleusercontent.com",
    scopes: ["openid", "profile", "email"],
  });

  // ✅ HANDLE GOOGLE RESPONSE
  useEffect(() => {
    if (response?.type === "success") {
      const token = response.authentication?.accessToken;

      if (token) {
        handleGoogleLogin(token);
      } else {
        Alert.alert("Google Login Failed", "No access token received");
      }
    }

    if (response?.type === "error") {
      Alert.alert("Google Auth Error", "Authentication failed");
    }
  }, [response]);

  const handleGoogleLogin = async (token: string) => {
    try {
      setLoading(true);
      await googleLogin(token);
    } catch (error) {
      Alert.alert("Error", "Google Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Log in to your account</Text>

          <View style={{ marginTop: 30 }}>
            <AuthInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
            />

            <AuthInput
              placeholder="Password"
              secure
              value={password}
              onChangeText={setPassword}
              icon="lock"
            />

            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginVertical: 15 }}
              />
            ) : (
              <AuthButton title="Log In" onPress={handleLogin} />
            )}
          </View>

          {/* OR Divider */}
          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          {/* GOOGLE LOGIN BUTTON */}
          <TouchableOpacity
            style={[styles.socialBtn, (!request || loading) && { opacity: 0.6 }]}
            disabled={!request || loading}
            onPress={() => promptAsync({ useProxy: false })}
          >
            <AntDesign name="google" size={20} color="#DB4437" />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={{ color: colors.textSecondary }}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.link}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    textAlign: "center",
  },
  forgot: {
    textAlign: "right",
    color: colors.primary,
    marginBottom: 20,
    marginTop: 10,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
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
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialText: {
    marginLeft: 10,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  link: {
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 5,
  },
});