// src/components/toast.tsx
import { View, Text } from "react-native";

export type ToastType = "success" | "error" | "info";

const Toast = ({
  toast,
}: {
  toast: { show: boolean; message: string; type: ToastType };
}) => {
  if (!toast.show) return null;
  let bgColor;
  if (toast.type === "success") bgColor = "bg-green-500";
  else if (toast.type === "error") bgColor = "bg-red-500";
  else bgColor = "bg-blue-500";

  return (
    <View className="absolute top-12 left-4 right-4 z-50">
      <View className={`${bgColor} px-4 py-3 rounded-lg shadow-lg`}>
        <Text className="text-white font-semibold text-center">
          {toast.message}
        </Text>
      </View>
    </View>
  );
};

export default Toast;
