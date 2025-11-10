import { ChevronRight, Clock } from "lucide-react-native";
import { TouchableOpacity, View ,Text} from "react-native";
import { Dheeto } from "../shared_types/db_types";

export const DheetoCard = ({ dheeto, onPress }: { dheeto: Dheeto; onPress: () => void }) => {
  const totalWeight = dheeto.items.reduce((sum: any, item: { weightInTola: any }) => sum + item.weightInTola, 0);
  const goldItems = dheeto.items.filter((item: { type: string }) => item.type === "gold").length;
  const silverItems = dheeto.items.filter((item: { type: string }) => item.type === "silver").length;

  const totalGave = dheeto.transactions.filter((t: { type: string }) => t.type === "gave").reduce((sum: any, t: { amount: any }) => sum + t.amount, 0);
  const totalReceived = dheeto.transactions.filter((t: { type: string }) => t.type === "received").reduce((sum: any, t: { amount: any }) => sum + t.amount, 0);
  const balance = totalReceived - totalGave;

  return (
    <TouchableOpacity onPress={onPress} className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-sm active:scale-[0.98]" activeOpacity={0.7}>
      {/* Header Row - Compact */}
      <View className="flex-row items-center justify-between mb-2.5">
        <View className="flex-1 flex-row items-center gap-2">
          {dheeto.desc ? (
            <Text className="text-sm font-bold text-gray-900 flex-1" numberOfLines={1}>
              {dheeto.desc}
            </Text>
          ) : (
            <Text className="text-sm font-semibold text-gray-400 flex-1">Untitled Dheeto</Text>
          )}
          <View className={`px-2 py-0.5 rounded-md ${dheeto.isSettled ? "bg-green-100" : "bg-orange-100"}`}>
            <Text className={`text-[10px] font-bold ${dheeto.isSettled ? "text-green-700" : "text-orange-700"}`}>{dheeto.isSettled ? "✓ Settled" : "⏱ Active"}</Text>
          </View>
        </View>
        <ChevronRight size={18} color="#9CA3AF" className="ml-2" />
      </View>

      {/* Date */}
      <View className="flex-row items-center gap-1 mb-3">
        <Clock size={10} color="#9CA3AF" />
        <Text className="text-[10px] text-gray-500">{new Date(dheeto.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Text>
      </View>

      {/* Items & Balance Row - Compact */}
      <View className="flex-row items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-2.5 mb-2.5">
        {/* Items */}
        <View className="flex-row items-center gap-2.5">
          {goldItems > 0 && (
            <View className="flex-row items-center gap-1">
              <View className="bg-yellow-400 w-4 h-4 rounded-full items-center justify-center">
                <Text className="text-[8px]">GOLD</Text>
              </View>
              <Text className="text-xs font-semibold text-gray-700">{goldItems}</Text>
            </View>
          )}
          {silverItems > 0 && (
            <View className="flex-row items-center gap-1">
              <View className="bg-gray-300 w-4 h-4 rounded-full items-center justify-center">
                <Text className="text-[8px]">SILVER</Text>
              </View>
              <Text className="text-xs font-semibold text-gray-700">{silverItems}</Text>
            </View>
          )}
          {(goldItems > 0 || silverItems > 0) && <View className="h-3 w-px bg-gray-300" />}
          <Text className="text-xs text-gray-600">
            <Text className="font-bold text-gray-800">{totalWeight.toFixed(1)}</Text>
            <Text className="text-[10px]"> tola</Text>
          </Text>
        </View>

        {/* Balance - Prominent */}
        <View className="items-end">
          <Text className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">Balance</Text>
          <Text className={`text-base font-extrabold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {balance >= 0 ? "+" : "-"}₹{Math.abs(balance).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Transactions Footer - Minimal */}
      {(totalGave > 0 || totalReceived > 0) && (
        <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
          <View className="flex-row items-center gap-3">
            {totalGave > 0 && (
              <View className="flex-row items-center gap-1">
                <View className="bg-red-100 px-1.5 py-0.5 rounded">
                  <Text className="text-[9px] font-bold text-red-700">DOWN</Text>
                </View>
                <Text className="text-xs text-gray-600">₹{totalGave.toLocaleString()}</Text>
              </View>
            )}
            {totalReceived > 0 && (
              <View className="flex-row items-center gap-1">
                <View className="bg-green-100 px-1.5 py-0.5 rounded">
                  <Text className="text-[9px] font-bold text-green-700">UP</Text>
                </View>
                <Text className="text-xs text-gray-600">₹{totalReceived.toLocaleString()}</Text>
              </View>
            )}
          </View>
          <Text className="text-[10px] text-gray-400">{dheeto.transactions.length} txn</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};