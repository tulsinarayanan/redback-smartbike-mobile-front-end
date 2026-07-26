import { Image, TouchableOpacity } from "react-native";
import React from "react";

const LoginIcon = ({ image, onPress, accessibilityLabel }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="rounded-full bg-white w-14 h-14 aspect-square flex justify-center items-center"
    >
      <Image
        className="max-w-[70%] max-h-[70%]"
        resizeMode="contain"
        source={image}
      />
    </TouchableOpacity>
  );
};

export default LoginIcon;
