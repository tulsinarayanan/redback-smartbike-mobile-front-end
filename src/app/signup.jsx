import {
  View,
  Text,
  SafeAreaView,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import "../../global.css";
import AntDesign from "@expo/vector-icons/AntDesign";
import TextInputWithLogo from "@/components/TextInputWithLogo";
import LoginIcon from "@/components/LoginIcon";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/authContext";

const SignUp = () => {
  const { signUp, signInWithOAuth } = useAuth();

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSignup = async () => {
    if (!userData.username || !userData.email || !userData.password) {
      Alert.alert("Missing fields", "Please complete all fields");
      return;
    }

    try {
      const { data, error } = await signUp(
        userData.email,
        userData.password,
        userData.username
      );

      if (error) {
        Alert.alert("Signup failed", error.message);
        return;
      }

      const createdUser = data?.user;
      const createdSession = data?.session;

      if (!createdUser) {
        Alert.alert("Signup failed", "No user was returned from Supabase");
        return;
      }

      if (createdSession) {
        Alert.alert("Success", "Account created successfully");
        router.replace("/(tabs)/home");
      } else {
        Alert.alert(
          "Check your email",
          "Account created. Please verify your email before logging in."
        );
        router.replace("/");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err?.message || "Something went wrong while creating your account"
      );
    }
  };

  const handleSocialSignup = async (provider) => {
    try {
      const { error } = await signInWithOAuth(provider);

      if (error) {
        Alert.alert("Signup failed", error.message);
      }
    } catch (err) {
      Alert.alert(
        "Signup failed",
        "Something went wrong while creating your account."
      );
    }
  };

  return (
    <LinearGradient style={{ flex: 1 }} colors={["#340C4C", "#EB7363"]}>
      <StatusBar barStyle={"light-content"} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView>
          <View className="bg-white max-h-[78%] py-6 m-6 rounded-[48px] flex justify-center px-4">
            <Image
              source={require("@assets/redback-logo.png")}
              className="max-w-[130px] max-h-[130px] self-center mb-6"
              resizeMode="contain"
            />
            <Text className="text-brand-navy text-center text-3xl font-bold">
              Tell Us About Yourself
            </Text>
            <Text className="text-xl font-semibold text-center">
              Create an Account
            </Text>

            <View className="gap-4 my-12">
              <TextInputWithLogo
                data={userData}
                setData={setUserData}
                placeholder={"Name"}
                logo={<AntDesign name="user" size={24} color="black" />}
                id="username"
              />
              <TextInputWithLogo
                data={userData}
                setData={setUserData}
                logo={<AntDesign name="mail" size={24} color="black" />}
                placeholder={"example@gmail.com"}
                id={"email"}
              />
              <TextInputWithLogo
                data={userData}
                setData={setUserData}
                secure
                logo={<AntDesign name="lock1" size={28} color="black" />}
                placeholder={"Enter your password"}
                id={"password"}
              />
            </View>

            <TouchableOpacity
              onPress={handleSignup}
              className="bg-brand-purple w-2/3 self-center rounded-full px-6 py-4"
            >
              <Text className="text-white text-lg text-center">
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-grow justify-center gap-4">
            <View className="flex-row justify-between w-1/2 self-center">
              <LoginIcon
                image={require("@assets/apple-logo.png")}
                onPress={() => handleSocialSignup("apple")}
                accessibilityLabel="Sign up with Apple"
              />
              <LoginIcon
                image={require("@assets/facebook.png")}
                onPress={() => handleSocialSignup("facebook")}
                accessibilityLabel="Sign up with Facebook"
              />
              <LoginIcon
                image={require("@assets/google.png")}
                onPress={() => handleSocialSignup("google")}
                accessibilityLabel="Sign up with Google"
              />
            </View>
            <Text className="text-white text-center">
              Already have an account?{" "}
              <Link href={"/"}>
                <Text className="text-brand-purple font-semibold">
                  Sign in here
                </Text>
              </Link>
            </Text>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default SignUp;
