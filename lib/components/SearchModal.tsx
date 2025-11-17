import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from "react-native";
import { User, Phone, X, Search, Calendar } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SearchPersonQuery } from "../types";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  searchParams: Partial<SearchPersonQuery>;
  setSearchParams: React.Dispatch<React.SetStateAction<Partial<SearchPersonQuery>>>;
  onSearch: () => void;
}

const SearchModal = ({ visible, onClose, searchParams, setSearchParams, onSearch }: SearchModalProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateMode, setDateMode] = useState<"after" | "before" | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const openDatePicker = (mode: "after" | "before") => {
    setDateMode(mode);
    const dateKey = mode === "after" ? "createdAfter" : "createdBefore";
    const existing = searchParams[dateKey];
    if (existing) {
      const parsedDate = new Date(existing);
      if (!isNaN(parsedDate.getTime())) setTempDate(parsedDate);
      else setTempDate(new Date());
    } else setTempDate(new Date());
    setShowDatePicker(true);
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && dateMode) {
      const dateString = selectedDate.toISOString().split("T")[0];
      const dateKey = dateMode === "after" ? "createdAfter" : "createdBefore";
      setSearchParams((prev) => ({ ...prev, [dateKey]: dateString }));
    }
  };

  const clearDate = (mode: "after" | "before") => {
    const dateKey = mode === "after" ? "createdAfter" : "createdBefore";
    setSearchParams((prev) => ({ ...prev, [dateKey]: "" }));
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View className="flex-1 bg-black/60">
          <View className="flex-1 mt-20 bg-white rounded-t-3xl">
            <View className="p-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-3xl font-bold text-gray-900">Search Persons</Text>
                <TouchableOpacity onPress={onClose} className="p-2.5 bg-gray-200 rounded-xl">
                  <X size={24} color="#374151" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} className="mb-4" keyboardShouldPersistTaps="handled">
                <View className="space-y-4">
                  {/* Name Input - Indigo */}
                  <View>
                    <Text className="text-sm font-bold text-gray-800 mb-2">Name</Text>
                    <View className="flex-row items-center bg-indigo-50 border-2 border-indigo-200 rounded-xl px-4 py-3.5">
                      <User size={20} color="#4F46E5" />
                      <TextInput
                        placeholder="Search by name..."
                        value={searchParams.name}
                        onChangeText={(text) => setSearchParams((prev) => ({ ...prev, name: text }))}
                        className="flex-1 ml-3 text-gray-900 font-medium"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>

                  {/* Phone Input - Purple */}
                  <View>
                    <Text className="text-sm font-bold text-gray-800 mb-2">Phone</Text>
                    <View className="flex-row items-center bg-purple-50 border-2 border-purple-200 rounded-xl px-4 py-3.5">
                      <Phone size={20} color="#9333EA" />
                      <TextInput
                        placeholder="Search by phone..."
                        value={searchParams.phoneNo}
                        onChangeText={(text) => setSearchParams((prev) => ({ ...prev, phoneNo: text }))}
                        keyboardType="phone-pad"
                        className="flex-1 ml-3 text-gray-900 font-medium"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>

                  {/* Created After - Teal */}
                  <View>
                    <Text className="text-sm font-bold text-gray-800 mb-2">Created After</Text>
                    <TouchableOpacity onPress={() => openDatePicker("after")} className="flex-row items-center bg-teal-50 border-2 border-teal-200 rounded-xl px-4 py-3.5">
                      <Calendar size={20} color="#14B8A6" />
                      <Text className={`flex-1 ml-3 font-medium ${searchParams.createdAfter ? "text-gray-900" : "text-gray-400"}`}>
                        {searchParams.createdAfter?.toISOString() || "Select date..."}
                      </Text>
                      {searchParams.createdAfter && (
                        <TouchableOpacity onPress={() => clearDate("after")}>
                          <X size={18} color="#6B7280" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Created Before - Cyan */}
                  <View>
                    <Text className="text-sm font-bold text-gray-800 mb-2">Created Before</Text>
                    <TouchableOpacity onPress={() => openDatePicker("before")} className="flex-row items-center bg-cyan-50 border-2 border-cyan-200 rounded-xl px-4 py-3.5">
                      <Calendar size={20} color="#06B6D4" />
                      <Text className={`flex-1 ml-3 font-medium ${searchParams.createdBefore ? "text-gray-900" : "text-gray-400"}`}>
                        {searchParams.createdBefore?.toDateString() || "Select date..."}
                      </Text>
                      {searchParams.createdBefore && (
                        <TouchableOpacity onPress={() => clearDate("before")}>
                          <X size={18} color="#6B7280" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity onPress={onClose} className="flex-1 bg-gray-200 py-4 rounded-xl border-2 border-gray-300">
                  <Text className="text-gray-800 text-center font-bold text-base">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onSearch} className="flex-1 bg-indigo-600 py-4 rounded-xl flex-row items-center justify-center shadow-lg">
                  <Search size={22} color="#FFFFFF" />
                  <Text className="text-white font-bold ml-2 text-base">Search</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {showDatePicker && <DateTimePicker value={tempDate} mode="date" display="default" onChange={handleDateChange} maximumDate={new Date()} />}
    </>
  );
};

export default SearchModal;
