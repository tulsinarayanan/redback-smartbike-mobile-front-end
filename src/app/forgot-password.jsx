import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useAuth } from "@/context/authContext";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      alert("Please enter your registered email.");
      return;
    }

    try {
      const { error } = await resetPassword(email);

      if (error) {
        alert(error.message);
        return;
      }

      alert(`Password reset link sent to ${email}`);
    } catch (err) {
      alert("Something went wrong while sending the reset link.");
    }
  };

  return (
    <LinearGradient style={{ flex: 1 }} colors={["#340C4C", "#EB7363"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView className="flex-1 justify-center px-6">
          <View className="bg-white rounded-[32px] p-8">
            <Text className="text-3xl font-bold text-center text-brand-purple mb-4">
              Forgot Password
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Enter your registered email below and we will send you instructions
              to reset your password.
            </Text>

            <TextInput
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              className="border border-gray-300 rounded-xl px-4 py-3 mb-6"
            />

            <TouchableOpacity
              onPress={handleResetPassword}
              className="bg-brand-purple rounded-full py-4"
            >
              <Text className="text-white text-center font-semibold">
                Send Reset Link
              </Text>
            </TouchableOpacity>

            <Link href="/" asChild>
              <TouchableOpacity className="mt-6">
                <Text className="text-brand-purple text-center">
                  Back to Login
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default ForgotPassword;
