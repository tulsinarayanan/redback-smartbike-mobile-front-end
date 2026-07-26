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
import "@expo/metro-runtime";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/authContext";

const index = () => {
  const { signIn, signInWithOAuth } = useAuth();
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      const { error } = await signIn(loginData.email, loginData.password);

      if (error) {
        alert(error.message);
        return;
      }

      router.replace("/(tabs)/home");
    } catch (err) {
      alert("Something went wrong while signing in");
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      const { error } = await signInWithOAuth(provider);

      if (error) {
        Alert.alert("Sign in failed", error.message);
      }
    } catch (err) {
      Alert.alert("Sign in failed", "Something went wrong while signing in.");
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
              Redback Smart Bike
            </Text>
            <View className="gap-4 my-12">
              <TextInputWithLogo
                id={"email"}
                logo={<AntDesign name="mail" size={24} color="black" />}
                placeholder={"example@gmail.com"}
                data={loginData}
                setData={setLoginData}
              />
              <TextInputWithLogo
                id={"password"}
                secure
                logo={<AntDesign name="lock1" size={28} color="black" />}
                placeholder={"Enter your password"}
                data={loginData}
                setData={setLoginData}
              />
            </View>
            <TouchableOpacity
              onPress={handleLogin}
              className="bg-brand-purple w-2/3 self-center rounded-full px-6 py-4"
            >
              <Text className="text-white text-lg text-center">Sign in</Text>
            </TouchableOpacity>

            <Link className="self-center mt-6" href={"/forgot-password"}>
              <Text>Forgot password?</Text>
            </Link>
          </View>
          <View className="flex flex-grow justify-center gap-4">
            <View className="flex-row justify-between w-1/2 self-center">
              <LoginIcon
                image={require("@assets/apple-logo.png")}
                onPress={() => handleSocialLogin("apple")}
                accessibilityLabel="Sign in with Apple"
              />
              <LoginIcon
                image={require("@assets/facebook.png")}
                onPress={() => handleSocialLogin("facebook")}
                accessibilityLabel="Sign in with Facebook"
              />
              <LoginIcon
                image={require("@assets/google.png")}
                onPress={() => handleSocialLogin("google")}
                accessibilityLabel="Sign in with Google"
              />
            </View>
            <Text className="text-white text-center">
              Dont have an account?<Text> </Text>
              <Link href={"/signup"}>
                <Text className="text-brand-purple font-semibold">
                  Sign up here
                </Text>
              </Link>
            </Text>
            <TouchableOpacity onPress={() => router.replace("/dashboard")} className="self-center mt-2">
              <Text className="text-white text-sm underline opacity-70">
                View dashboard without signing in
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default index;
