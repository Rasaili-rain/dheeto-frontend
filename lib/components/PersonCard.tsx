import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { User, Phone } from "lucide-react-native";
import { Person } from "@/lib/shared_types/db_types";

interface PersonCardProps {
  person: Person;
  onPress: () => void;
}

const PersonCard = ({ person, onPress }: PersonCardProps) => {
  const isPositiveBalance = person.totalBalance >= 0;

  return (
    <TouchableOpacity onPress={onPress} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md active:scale-[0.98]" activeOpacity={0.7}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Name Section - Indigo */}
          <View className="flex-row items-center gap-2.5 mb-3">
            <View className="bg-indigo-100 p-2.5 rounded-xl">
              <User size={18} color="#4F46E5" />
            </View>
            <Text className="font-bold text-gray-900 text-lg flex-1" numberOfLines={1}>
              {person.name}
            </Text>
          </View>

          {/* Phone Number */}
          {person.phoneNo && (
            <View className="flex-row items-center gap-2 mb-3 ml-1">
              <Phone size={13} color="#9CA3AF" />
              <Text className="text-sm text-gray-600">{person.phoneNo}</Text>
            </View>
          )}

          {/* Description */}
          {person.desc && (
            <Text className="text-sm text-gray-500 leading-5 mb-3 ml-1" numberOfLines={2}>
              {person.desc}
            </Text>
          )}

          {/* Balance - Emerald/Rose with Borders */}
          <View className={`mt-1 p-3.5 rounded-xl ${isPositiveBalance ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"}`}>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Balance</Text>
              <Text className={`text-xl font-bold ${isPositiveBalance ? "text-emerald-700" : "text-rose-700"}`}>
                {isPositiveBalance ? "+" : "-"}₹{Math.abs(person.totalBalance)}
              </Text>
            </View>
          </View>

          {/* Unsettled Dheetos Badge - Amber */}
          {person.unsettledDheetosCount > 0 && (
            <View className="mt-3 flex-row items-center">
              <View className="bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-full">
                <Text className="text-xs text-amber-800 font-bold">
                  {person.unsettledDheetosCount} unsettled dheeto{person.unsettledDheetosCount > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PersonCard;
