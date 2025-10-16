// app/add-person/index.tsx
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Phone, Plus, User, X } from "lucide-react-native";
import { createPerson } from "@/lib/api/person";
import Toast, { ToastType } from "@/lib/components/Toast";
import { CreatePersonBody } from "@/lib/shared_types/person_types";
import { useState } from "react";

export default function AddPersonModal() {
  const router = useRouter();

  const [formData, setFormData] = useState<CreatePersonBody>({ name: "", phoneNo: "", desc: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: "",
    type: "success",
  });

  const displayToast = (message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) return displayToast("Name required", "error");
    setLoading(true);
    try {
      await createPerson(formData);
      displayToast("Added successfully!", "success");
      router.back();
    } catch (err) {
      displayToast(err instanceof Error ? err.message : "Add failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-gray-900">Add New Person</Text>
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-200 rounded-xl">
          <X size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView className="space-y-4">
        {/* Name Input */}
        <View>
          <Text className="text-sm font-bold text-gray-800 mb-2">
            Name <Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row items-center border-2 border-gray-300 bg-white rounded-xl px-4 py-3">
            <User size={20} color="#6B7280" />
            <TextInput
              placeholder="Enter name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              className="flex-1 ml-3 text-gray-900 font-medium"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Phone Input */}
        <View>
          <Text className="text-sm font-bold text-gray-800 mb-2">Phone</Text>
          <View className="flex-row items-center border-2 border-gray-300 bg-white rounded-xl px-4 py-3">
            <Phone size={20} color="#6B7280" />
            <TextInput
              placeholder="Enter phone (optional)"
              value={formData.phoneNo}
              onChangeText={(text) => setFormData({ ...formData, phoneNo: text })}
              keyboardType="phone-pad"
              className="flex-1 ml-3 text-gray-900 font-medium"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Description Input */}
        <View>
          <Text className="text-sm font-bold text-gray-800 mb-2">Description</Text>
          <View className="border-2 border-gray-300 bg-white rounded-xl px-4 py-3">
            <TextInput
              placeholder="Enter description (optional)"
              value={formData.desc}
              onChangeText={(text) => setFormData({ ...formData, desc: text })}
              multiline
              numberOfLines={4}
              className="text-gray-900 font-medium min-h-[80px]"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleAdd}
          disabled={loading || !formData.name.trim()}
          className={`flex-row justify-center items-center py-4 rounded-xl mt-2 shadow-lg ${loading || !formData.name.trim() ? "bg-indigo-300" : "bg-indigo-600"}`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Plus size={22} color="#FFFFFF" />
              <Text className="text-white font-bold text-base ml-2">Add Person</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {toast && <Toast toast={toast} />}
    </View>
  );
}
