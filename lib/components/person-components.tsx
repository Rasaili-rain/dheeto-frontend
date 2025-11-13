  import { ChevronRight, Clock, TrendingUp, TrendingDown, Package } from "lucide-react-native";
  import { TouchableOpacity, View, Text } from "react-native";
  import { Dheeto } from "../shared_types/db_types";

  export const DheetoCard = ({ dheeto, onPress }: { dheeto: Dheeto; onPress: () => void }) => {
    const goldItems = dheeto.items.filter((item: { type: string }) => item.type === "gold").length;
    const silverItems = dheeto.items.filter((item: { type: string }) => item.type === "silver").length;

    const totalGave = dheeto.transactions.filter((t: { type: string }) => t.type === "gave").reduce((sum: any, t: { amount: any }) => sum + t.amount, 0);
    const totalReceived = dheeto.transactions.filter((t: { type: string }) => t.type === "received").reduce((sum: any, t: { amount: any }) => sum + t.amount, 0);
    const balance = totalReceived - totalGave;
    const isPositive = balance >= 0;

    return (
      <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md active:scale-[0.98] mb-3"
        activeOpacity={0.7}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Status Bar at Top */}
        <View className={`h-1 ${dheeto.isSettled ? "bg-green-500" : "bg-gradient-to-r from-orange-400 to-amber-500"}`} />

        <View className="p-4">
          {/* Header Section */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 pr-3">
              {dheeto.desc ? (
                <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
                  {dheeto.desc}
                </Text>
              ) : (
                <Text className="text-base font-semibold text-gray-400 mb-1">Untitled Dheeto</Text>
              )}

              {/* Date with better styling */}
              <View className="flex-row items-center gap-1.5">
                <Clock size={12} color="#9CA3AF" />
                <Text className="text-xs text-gray-500">
                  {new Date(dheeto.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View className={`px-3 py-1.5 rounded-full ${dheeto.isSettled ? "bg-green-100" : "bg-orange-100"}`}>
              <Text className={`text-xs font-bold ${dheeto.isSettled ? "text-green-700" : "text-orange-700"}`}>{dheeto.isSettled ? "✓ Settled" : "● Active"}</Text>
            </View>
          </View>

          {/* Balance Card - Prominent */}
          <View className={`rounded-xl p-4 mb-3 ${isPositive ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xs text-gray-600 font-medium mb-1">Balance</Text>
                <Text className={`text-2xl font-extrabold ${isPositive ? "text-green-700" : "text-red-700"}`}>
                  {isPositive ? "+" : "-"}₹{Math.abs(balance).toLocaleString()}
                </Text>
              </View>
              <View className={`p-3 rounded-full ${isPositive ? "bg-green-200" : "bg-red-200"}`}>
                {isPositive ? <TrendingUp size={24} color={isPositive ? "#15803d" : "#b91c1c"} /> : <TrendingDown size={24} color="#b91c1c" />}
              </View>
            </View>
          </View>

          {/* Items Section - Enhanced */}
          {(goldItems > 0 || silverItems > 0) && (
            <View className="bg-gradient-to-r from-amber-50 to-slate-50 rounded-xl p-3 mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Package size={16} color="#6B7280" />

                  {goldItems > 0 && (
                    <View className="flex-row items-center gap-1.5">
                      <View className="bg-yellow-300 w-16 h-6 rounded-full items-center justify-center shadow-sm">
                        <Text className="text-[8px] font-bold text-yellow-900">Gold</Text>
                      </View>
                      <Text className="text-sm font-bold text-gray-800">{goldItems}</Text>
                    </View>
                  )}

                  {silverItems > 0 && (
                    <View className="flex-row items-center gap-1.5">
                      <View className="bg-gradient-to-br from-gray-200 to-gray-400 w-16 h-6 rounded-full items-center justify-center shadow-sm">
                        <Text className="text-[8px] font-bold text-gray-700">Silver</Text>
                      </View>
                      <Text className="text-sm font-bold text-gray-800">{silverItems}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Transactions Section  */}
          {(totalGave > 0 || totalReceived > 0) && (
            <View className="border-t border-gray-100 pt-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1 mb-1">
                      <View className="w-2 h-2 rounded-full bg-green-500" />
                      <Text className="text-[10px] text-gray-500 uppercase font-semibold">Received</Text>
                    </View>
                    <Text className="text-sm font-bold text-green-700">₹{totalReceived.toLocaleString()}</Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-1 mb-1">
                      <View className="w-2 h-2 rounded-full bg-red-500" />
                      <Text className="text-[10px] text-gray-500 uppercase font-semibold">Gave</Text>
                    </View>
                    <Text className="text-sm font-bold text-red-700">₹{totalGave.toLocaleString()}</Text>
                  </View>
                </View>

                {/* Transaction count badge */}
                <View className="bg-blue-100 px-5 py-1 rounded-full ml-2">
                  <Text className="text-[10px] font-bold text-blue-700">{dheeto.transactions.length} txn</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
