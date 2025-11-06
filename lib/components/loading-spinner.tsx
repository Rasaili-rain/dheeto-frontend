import { View, ActivityIndicator } from "react-native";

export const LoadingSpinner = () => {
  return (
	<View className="absolute inset-0 bg-black/20 items-center justify-center">
	  <ActivityIndicator size="large" color="#2563EB" />
	</View>
  );
};
