import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Phone, DollarSign, User } from "lucide-react-native";
import { Person } from "@/lib/shared_types/db_types";

interface PersonCardProps {
  person: Person;
  onPress: () => void;
}

const PersonCard = ({ person, onPress }: PersonCardProps) => {
  const isPositiveBalance = person.totalBalance >= 0;

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    return phone;
  };

  return (
    <TouchableOpacity onPress={onPress} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm active:scale-[0.98] mb-3" activeOpacity={0.7}>
      {/* Header - Icon, Name & Badge */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1 gap-3">
          <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center">
            <User size={20} color="#4F46E5" strokeWidth={2.5} />
          </View>
          <Text className="font-black text-gray-900 text-xl flex-1" numberOfLines={1}>
            {person.name}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {/* Phone Number  */}
          {person.phoneNo && (
            <View className="flex-row items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
              <Phone size={14} color="#2563EB" strokeWidth={2.5} />
              <Text className="text-xs font-bold text-blue-900" numberOfLines={1}>
                {formatPhoneNumber(person.phoneNo)}
              </Text>
            </View>
          )}

          {person.unsettledDheetosCount > 0 && (
            <View className="bg-orange-500 w-7 h-7 rounded-full items-center justify-center">
              <Text className="text-xs font-black text-white">{person.unsettledDheetosCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Description */}
      {person.desc && (
        <Text className="text-sm text-gray-600 leading-5 mb-3 ml-13" numberOfLines={2}>
          {person.desc}
        </Text>
      )}

      {/* Metrics - Equal 3-Column Grid */}
      <View className="flex-row gap-2">
        {/* Cash */}
        <View className={`flex-1 rounded-xl p-3 ${isPositiveBalance ? "bg-green-50 border-2 border-green-300" : "bg-red-50 border-2 border-red-300"}`}>
          <View className={`w-f h-7 rounded-full items-center justify-center mb-1.5 ${isPositiveBalance ? "bg-green-200" : "bg-red-200"}`}>
            <DollarSign size={15} color={isPositiveBalance ? "#15803d" : "#b91c1c"} strokeWidth={3} />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className={`text-base font-black leading-tight ${isPositiveBalance ? "text-green-700" : "text-red-700"}`}>
              {isPositiveBalance ? "+" : "-"}
              {Math.abs(person.totalBalance).toLocaleString("en-IN")}
            </Text>
            <Text className={`text-base font-black ${isPositiveBalance ? "text-green-700" : "text-red-700"} pl-1`}>₹</Text>
          </View>
        </View>

        {/* Gold */}
        <View className="flex-1 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-3">
          <View className="w-f h-7 rounded-full bg-yellow-400 items-center justify-center mb-1.5">
            <Text className="text-[10px] font-black text-yellow-900">Gold</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-black text-yellow-900 leading-tight">{person.totalGold.toFixed(3)}</Text>
            <Text className="text-base font-black text-yellow-900 pl-1">t</Text>
          </View>
        </View>

        {/* Silver */}
        <View className="flex-1 bg-slate-100 border-2 border-slate-400 rounded-xl p-3">
          <View className="w-f h-7 rounded-full bg-slate-400 items-center justify-center mb-1.5">
            <Text className="text-[10px] font-black text-black">Silver</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-black text-slate-700 leading-tight">{person.totalSilver.toFixed(3)}</Text>
            <Text className="text-base font-black text-slate-700 pl-1">t</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PersonCard;
