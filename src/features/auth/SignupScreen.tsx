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
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import AuthInput from "./components/AuthInput";
import AuthButton from "./components/AuthButton";
import { colors } from "../../theme/colors";
import { registerUser } from "../../core/api/auth.api";
import { useAuth } from "../../core/hooks/useAuth";

WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();

  // Create a reliable redirect URI
  const redirectUri = makeRedirectUri({
    scheme: 'ems-app',
    path: 'google-auth'
  });

  // Google Auth Hook
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "437335424413-g9rnct43ob03gm7fpvafktqlj2e8p7fv.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    webClientId: "437335424413-g9rnct43ob03gm7fpvafktqlj2e8p7fv.apps.googleusercontent.com",
  }, {
    projectNameForProxy: "@your-expo-username/react-native-ems",
  });

  useEffect(() => {
    // Helpful log to fix "Request is invalid"
    console.log("Your Redirect URI is:", redirectUri);

    if (response?.type === "success") {
      const { authentication } = response;
      console.log("Google Signup Success, Token:", authentication?.accessToken);
      handleGoogleLogin(authentication?.accessToken || "");
    } else if (response?.type === "error") {
      console.error("Google Signup Error:", response.error);
    }
  }, [response]);

  const handleGoogleLogin = async (token: string) => {
    setLoading(true);
    try {
      await googleLogin(token);
    } catch (error) {
      Alert.alert("Error", "Google Signup Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
    }
    
    setLoading(true);
    try {
      await registerUser(name, email, password);
      Alert.alert("Success", "Account created successfully! Logging you in...");
      await login(email, password);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Signup Failed", error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Create a new account</Text>

      {/* Form */}
      <View style={{ marginTop: 40 }}>
        <AuthInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          icon="user"
        />

        <AuthInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          icon="mail"
        />

        <AuthInput
          placeholder="Password"
          secure
          value={password}
          onChangeText={setPassword}
          icon="lock"
        />

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 10 }} />
        ) : (
          <AuthButton title="Sign Up" onPress={handleSignup} />
        )}
      </View>

      {/* OR Divider */}
      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      {/* Social Login Buttons */}
      <TouchableOpacity 
        style={[styles.socialBtn, (!request || loading) && { opacity: 0.6 }]} 
        disabled={!request || loading}
        onPress={() => promptAsync()}
      >
        <AntDesign name="google" size={20} color="#DB4437" />
        <Text style={styles.socialText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={{ color: colors.textSecondary }}>
          Already have an account?
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}> Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    color: colors.textSecondary,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
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
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialText: {
    marginLeft: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  link: {
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 5,
  },
});
