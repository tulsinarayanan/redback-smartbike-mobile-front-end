import {
  View,
  Text,
  SafeAreaView,
  Image,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import React, { useState, useContext } from "react";
import "../../global.css";
import AntDesign from "@expo/vector-icons/AntDesign";
import TextInputWithLogo from "@/components/TextInputWithLogo";
import LoginIcon from "@/components/LoginIcon";
import { Link, router, useNavigation } from "expo-router";
import "@expo/metro-runtime";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "@/context/authContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const LOGIN_URL = `${API_BASE_URL}/login/`;

const index = () => {
  const { setUser } = useContext(AuthContext);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    /*/ production code

    const formData = new FormData();
    formData.append("email", loginData.email);
    formData.append("password", loginData.password);

    const response = await fetch(`${LOGIN_URL}`, {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: formData,
    });

    switch (response.status) {
      case 404:
        alert("Invalid credentials: email doesn't exist");
        break;
      case 401:
        alert("Invalid credentials: incorrect password");
        break;
      case 200:
        const data = await response.json();
        setUser({
          id: data.id,
          username: data.account_details[0].username,
          email: data.account_details[0].email,
        });
        router.replace("/home");
        break;
    }
    // dev code
    /*/router.replace("/home");
  };

  //const navigation = useNavigation();
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <LinearGradient style={{ flex: 1 }} colors={["#340C4C", "#EB7363"]}>
        <StatusBar barStyle={"light-content"} />
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
              <LoginIcon image={require("@assets/apple-logo.png")} />
              <LoginIcon image={require("@assets/facebook.png")} />
              <LoginIcon image={require("@assets/google.png")} />
            </View>
            <Text className="text-white text-center">
              Dont have an account?<Text> </Text>
              <Link href={"/signup"}>
                <Text className="text-brand-purple font-semibold">
                  Sign up here
                </Text>
              </Link>
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

export default index;
