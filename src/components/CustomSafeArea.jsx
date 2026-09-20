import { View, Text } from "react-native";
import React from "react";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Platform } from "react-native";

const CustomSafeArea = ({
  children,
  bgColour = "white",
  applyTopInset = true,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = applyTopInset ? insets.top : 0;
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ paddingTop: topPadding, backgroundColor: bgColour }}
        className={`flex-1 `}
      >
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default CustomSafeArea;
