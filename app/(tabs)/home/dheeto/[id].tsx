// app/(tabs)/home/dheeto/[id].tsx
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Modal } from "react-native";
import { X, Trash2, Plus, ChevronLeft, Package, TrendingUp, Clock, CheckCircle, AlertCircle, Edit2 } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";

import { deleteItem, updateItem, addItem } from "@/lib/api/item";
import { deleteTransaction, updateTransaction, addTransaction } from "@/lib/api/transaction";
import { getDheetoById } from "@/lib/api/dheeto";
import { Dheeto } from "@/lib/shared_types/db_types";

export default function DheetoDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [dheeto, setDheeto] = useState<Dheeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const loadDheeto = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await getDheetoById(id);
      if (response.success && response.data) {
        setDheeto(response.data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load dheeto");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDheeto();
  }, [id]);

  const handleUpdate = () => loadDheeto();

  const handleDeleteItem = async (itemId: string) => {
    if (!dheeto) return;
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const response = await deleteItem(dheeto._id, itemId);
            if (response.success) {
              Alert.alert("Success", "Item deleted successfully");
              handleUpdate();
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete item");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!dheeto) return;
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const response = await deleteTransaction(dheeto._id, transactionId);
            if (response.success) {
              Alert.alert("Success", "Transaction deleted successfully");
              handleUpdate();
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete transaction");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (loading || !dheeto) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const totalWeight = dheeto.items.reduce((sum, item) => sum + item.weightInTola, 0);
  const totalGave = dheeto.transactions.filter((t) => t.type === "gave").reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = dheeto.transactions.filter((t) => t.type === "received").reduce((sum, t) => sum + t.amount, 0);
  const balance = totalReceived - totalGave;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 active:bg-gray-100 rounded-full" activeOpacity={0.7}>
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">Dheeto Details</Text>
          <View className="w-10" />
        </View>
        {dheeto.desc && <Text className="text-sm text-gray-600 text-center mt-1">{dheeto.desc}</Text>}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mx-4 mt-4">
          <View className={`rounded-2xl p-6 ${dheeto.isSettled ? "bg-green-50 border-2 border-green-200" : "bg-orange-50 border-2 border-orange-200"}`}>
            <View className="flex-row items-center justify-between mb-4">
              <View className={`px-3 py-1.5 rounded-full ${dheeto.isSettled ? "bg-green-100" : "bg-orange-100"}`}>
                <View className="flex-row items-center gap-1.5">
                  {dheeto.isSettled ? <CheckCircle size={14} color="#16a34a" /> : <AlertCircle size={14} color="#ea580c" />}
                  <Text className={`text-sm font-bold ${dheeto.isSettled ? "text-green-700" : "text-orange-700"}`}>{dheeto.isSettled ? "Settled" : "Unsettled"}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1">
                <Clock size={14} color="#6B7280" />
                <Text className="text-sm text-gray-600">{new Date(dheeto.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-600 font-medium mb-1">Balance</Text>
                <Text className={`text-3xl font-bold ${balance >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {balance >= 0 ? "+" : ""}₹{Math.abs(balance).toLocaleString()}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-gray-600 mb-1">Total Weight</Text>
                <Text className="text-xl font-bold text-gray-900">{totalWeight.toFixed(1)} tola</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mx-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <View className="bg-amber-500 p-2 rounded-lg">
                <Package size={18} color="#FFFFFF" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Items</Text>
              <View className="bg-amber-100 px-2.5 py-1 rounded-full">
                <Text className="text-amber-700 font-bold text-xs">{dheeto.items.length}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowAddItem(true)} className="bg-amber-600 px-3 py-2 rounded-lg active:bg-amber-700" activeOpacity={0.8}>
              <View className="flex-row items-center gap-1">
                <Plus size={16} color="#FFFFFF" />
                <Text className="text-white font-semibold text-sm">Add</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border-2 border-amber-200">
            {dheeto.items.length === 0 ? (
              <View className="py-8 items-center">
                <Package size={40} color="#D97706" />
                <Text className="text-amber-700 font-semibold mt-2">No items yet</Text>
              </View>
            ) : (
              dheeto.items.map((item, index) => (
                <View key={item._id} className={`bg-white rounded-xl p-3 ${index < dheeto.items.length - 1 ? "mb-2" : ""}`}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-sm text-gray-600 ml-2">{new Date(item.createdAt).toLocaleDateString()}</Text>
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-xl">{item.type === "gold" ? "🟡" : "⚪"}</Text>
                        <Text className="font-bold text-gray-900 text-base">{item.name}</Text>
                      </View>
                      <View className="ml-7">
                        <Text className="text-sm text-gray-600">
                          {item.purity} carat • {item.weightInTola} tola
                        </Text>
                        {item.desc && <Text className="text-xs text-gray-500 mt-1">{item.desc}</Text>}
                      </View>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <TouchableOpacity onPress={() => setEditingItem(item)} className="p-1.5 active:bg-blue-100 rounded" activeOpacity={0.7}>
                        <Edit2 size={14} color="#2563EB" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteItem(item._id)} className="p-1.5 active:bg-red-100 rounded" activeOpacity={0.7}>
                        <Trash2 size={14} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View className="mx-4 mt-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <View className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp size={18} color="#FFFFFF" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Transactions</Text>
              <View className="bg-blue-100 px-2.5 py-1 rounded-full">
                <Text className="text-blue-700 font-bold text-xs">{dheeto.transactions.length}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowAddTransaction(true)} className="bg-blue-600 px-3 py-2 rounded-lg active:bg-blue-700" activeOpacity={0.8}>
              <View className="flex-row items-center gap-1">
                <Plus size={16} color="#FFFFFF" />
                <Text className="text-white font-semibold text-sm">Add</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200">
            {dheeto.transactions.length === 0 ? (
              <View className="py-8 items-center">
                <TrendingUp size={40} color="#2563EB" />
                <Text className="text-blue-700 font-semibold mt-2">No transactions yet</Text>
              </View>
            ) : (
              <>
                {dheeto.transactions.map((transaction, index) => (
                  <View key={transaction._id} className={`bg-white rounded-xl p-3 ${index < dheeto.transactions.length - 1 ? "mb-2" : ""}`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-sm text-gray-600 ml-2">{new Date(transaction.createdAt).toLocaleDateString()}</Text>
                        <View className="flex-row items-center gap-2 mb-1">
                          <View className={`px-2 py-1 rounded-full ${transaction.type === "gave" ? "bg-red-100" : "bg-green-100"}`}>
                            <Text className={`text-xs font-bold ${transaction.type === "gave" ? "text-red-700" : "text-green-700"}`}>
                              {transaction.type === "gave" ? "↓ GAVE" : "↑ RECEIVED"}
                            </Text>
                          </View>
                          <Text className="font-bold text-gray-900 text-base">₹{transaction.amount.toLocaleString()}</Text>
                        </View>
                        {transaction.desc && <Text className="text-sm text-gray-600 ml-2">{transaction.desc}</Text>}
                      </View>
                      <View className="flex-row items-center gap-1">
                        <TouchableOpacity onPress={() => setEditingTransaction(transaction)} className="p-1.5 active:bg-blue-100 rounded" activeOpacity={0.7}>
                          <Edit2 size={14} color="#2563EB" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteTransaction(transaction._id)} className="p-1.5 active:bg-red-100 rounded" activeOpacity={0.7}>
                          <Trash2 size={14} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}

                <View className="bg-white rounded-xl p-3 mt-2 border border-blue-200">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-xs text-gray-600 mb-1">Total Gave</Text>
                      <Text className="text-red-600 font-bold text-sm">₹{totalGave.toLocaleString()}</Text>
                    </View>
                    <View>
                      <Text className="text-xs text-gray-600 mb-1">Total Received</Text>
                      <Text className="text-green-600 font-bold text-sm">₹{totalReceived.toLocaleString()}</Text>
                    </View>
                    <View>
                      <Text className="text-xs text-gray-600 mb-1">Net Balance</Text>
                      <Text className={`font-bold text-sm ${balance >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {balance >= 0 ? "+" : ""}₹{Math.abs(balance).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {editingItem && <EditItemModal item={editingItem} dheetoId={dheeto._id} onClose={() => setEditingItem(null)} onUpdate={handleUpdate} />}
      {editingTransaction && <EditTransactionModal transaction={editingTransaction} dheetoId={dheeto._id} onClose={() => setEditingTransaction(null)} onUpdate={handleUpdate} />}
      {showAddItem && <AddItemModal dheetoId={dheeto._id} onClose={() => setShowAddItem(false)} onUpdate={handleUpdate} />}
      {showAddTransaction && <AddTransactionModal dheetoId={dheeto._id} onClose={() => setShowAddTransaction(false)} onUpdate={handleUpdate} />}

      {loading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      )}
    </View>
  );
}

const EditItemModal = ({ item, dheetoId, onClose, onUpdate }: any) => {
  const [formData, setFormData] = useState({
    name: item.name,
    type: item.type,
    purity: item.purity.toString(),
    weightInTola: item.weightInTola.toString(),
    desc: item.desc || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateItem(dheetoId, item._id, {
        name: formData.name,
        type: formData.type,
        purity: parseFloat(formData.purity),
        weightInTola: parseFloat(formData.weightInTola),
        desc: formData.desc,
      });
      if (response.success) {
        Alert.alert("Success", "Item updated successfully");
        onClose();
        onUpdate();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Edit Item</Text>
            <TouchableOpacity onPress={onClose} className="p-2 active:bg-gray-100 rounded-full">
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              className="bg-gray-50 rounded-xl p-3 mb-3 text-gray-800 border border-gray-200"
              placeholder="Item name"
              value={formData.name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
            />

            <View className="flex-row gap-2 mb-3">
              <TouchableOpacity
                onPress={() => setFormData((prev) => ({ ...prev, type: "gold" }))}
                className={`flex-1 p-4 rounded-xl border-2 ${formData.type === "gold" ? "bg-yellow-50 border-yellow-400" : "bg-gray-50 border-gray-200"}`}
              >
                <Text className={`text-center font-semibold ${formData.type === "gold" ? "text-yellow-700" : "text-gray-600"}`}>🟡 Gold</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFormData((prev) => ({ ...prev, type: "silver" }))}
                className={`flex-1 p-4 rounded-xl border-2 ${formData.type === "silver" ? "bg-gray-100 border-gray-400" : "bg-gray-50 border-gray-200"}`}
              >
                <Text className={`text-center font-semibold ${formData.type === "silver" ? "text-gray-700" : "text-gray-600"}`}>⚪ Silver</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1 ml-1">Purity (%)</Text>
                <TextInput
                  className="bg-gray-50 rounded-xl p-3 text-gray-800 border border-gray-200"
                  placeholder="e.g., 22"
                  keyboardType="decimal-pad"
                  value={formData.purity}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, purity: text }))}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1 ml-1">Weight (tola)</Text>
                <TextInput
                  className="bg-gray-50 rounded-xl p-3 text-gray-800 border border-gray-200"
                  placeholder="e.g., 2.5"
                  keyboardType="decimal-pad"
                  value={formData.weightInTola}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, weightInTola: text }))}
                />
              </View>
            </View>

            <TextInput
              className="bg-gray-50 rounded-xl p-3 mb-4 text-gray-800 border border-gray-200"
              placeholder="Additional notes"
              value={formData.desc}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, desc: text }))}
            />

            <TouchableOpacity onPress={handleSave} className="bg-blue-600 p-4 rounded-xl active:bg-blue-700" disabled={saving}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-center">Save Changes</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const EditTransactionModal = ({ transaction, dheetoId, onClose, onUpdate }: any) => {
  const [formData, setFormData] = useState({
    type: transaction.type,
    amount: transaction.amount.toString(),
    desc: transaction.desc || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateTransaction(dheetoId, transaction._id, {
        type: formData.type,
        amount: parseFloat(formData.amount),
        desc: formData.desc,
      });
      if (response.success) {
        Alert.alert("Success", "Transaction updated successfully");
        onClose();
        onUpdate();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Edit Transaction</Text>
            <TouchableOpacity onPress={onClose} className="p-2 active:bg-gray-100 rounded-full">
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-2 mb-3">
            <TouchableOpacity
              onPress={() => setFormData((prev) => ({ ...prev, type: "gave" }))}
              className={`flex-1 p-4 rounded-xl border-2 ${formData.type === "gave" ? "bg-red-50 border-red-400" : "bg-gray-50 border-gray-200"}`}
            >
              <Text className={`text-center font-semibold ${formData.type === "gave" ? "text-red-700" : "text-gray-600"}`}>↓ Gave</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFormData((prev) => ({ ...prev, type: "received" }))}
              className={`flex-1 p-4 rounded-xl border-2 ${formData.type === "received" ? "bg-green-50 border-green-400" : "bg-gray-50 border-gray-200"}`}
            >
              <Text className={`text-center font-semibold ${formData.type === "received" ? "text-green-700" : "text-gray-600"}`}>↑ Received</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            className="bg-gray-50 rounded-xl p-3 mb-3 text-gray-800 border border-gray-200"
            placeholder="Amount (₹)"
            keyboardType="numeric"
            value={formData.amount}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, amount: text }))}
          />

          <TextInput
            className="bg-gray-50 rounded-xl p-3 mb-4 text-gray-800 border border-gray-200"
            placeholder="Description"
            value={formData.desc}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, desc: text }))}
          />

          <TouchableOpacity onPress={handleSave} className="bg-blue-600 p-4 rounded-xl active:bg-blue-700" disabled={saving}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-center">Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const AddItemModal = ({ dheetoId, onClose, onUpdate }: any) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "gold" as "gold" | "silver",
    purity: "",
    weightInTola: "",
    desc: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.name || !formData.weightInTola) {
      Alert.alert("Missing Fields", "Please fill in item name and weight");
      return;
    }

    try {
      setSaving(true);
      const response = await addItem(dheetoId, {
        name: formData.name,
        type: formData.type,
        purity: parseFloat(formData.purity) || 0,
        weightInTola: parseFloat(formData.weightInTola),
        desc: formData.desc,
      });
      if (response.success) {
        Alert.alert("Success", "Item added successfully");
        onClose();
        onUpdate();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Add Item</Text>
            <TouchableOpacity onPress={onClose} className="p-2 active:bg-gray-100 rounded-full">
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              className="bg-gray-50 rounded-xl p-3 mb-3 text-gray-800 border border-gray-200"
              placeholder="Item name (e.g., Gold Ring)"
              value={formData.name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
            />

            <View className="flex-row gap-2 mb-3">
              <TouchableOpacity
                onPress={() => setFormData((prev) => ({ ...prev, type: "gold" }))}
                className={`flex-1 p-4 rounded-xl border-2 ${formData.type === "gold" ? "bg-yellow-50 border-yellow-400" : "bg-gray-50 border-gray-200"}`}
              >
                <Text className={`text-center font-semibold ${formData.type === "gold" ? "text-yellow-700" : "text-gray-600"}`}>🟡 Gold</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFormData((prev) => ({ ...prev, type: "silver" }))}
                className={`flex-1 p-4 rounded-xl border-2 ${formData.type === "silver" ? "bg-gray-100 border-gray-400" : "bg-gray-50 border-gray-200"}`}
              >
                <Text className={`text-center font-semibold ${formData.type === "silver" ? "text-gray-700" : "text-gray-600"}`}>⚪ Silver</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1 ml-1">Purity (%)</Text>
                <TextInput
                  className="bg-gray-50 rounded-xl p-3 text-gray-800 border border-gray-200"
                  placeholder="e.g., 22"
                  keyboardType="decimal-pad"
                  value={formData.purity}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, purity: text }))}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1 ml-1">Weight (tola)</Text>
                <TextInput
                  className="bg-gray-50 rounded-xl p-3 text-gray-800 border border-gray-200"
                  placeholder="e.g., 2.5"
                  keyboardType="decimal-pad"
                  value={formData.weightInTola}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, weightInTola: text }))}
                />
              </View>
            </View>

            <TextInput
              className="bg-gray-50 rounded-xl p-3 mb-4 text-gray-800 border border-gray-200"
              placeholder="Additional notes"
              value={formData.desc}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, desc: text }))}
            />

            <TouchableOpacity onPress={handleSave} className="bg-amber-600 p-4 rounded-xl active:bg-amber-700" disabled={saving}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-center">Add Item</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const AddTransactionModal = ({ dheetoId, onClose, onUpdate }: any) => {
  const [formData, setFormData] = useState({
    type: "gave" as "gave" | "received",
    amount: "",
    desc: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.amount) {
      Alert.alert("Missing Amount", "Please enter transaction amount");
      return;
    }

    try {
      setSaving(true);
      const response = await addTransaction(dheetoId, {
        type: formData.type,
        amount: parseFloat(formData.amount),
        desc: formData.desc,
      });
      if (response.success) {
        Alert.alert("Success", "Transaction added successfully");
        onClose();
        onUpdate();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Add Transaction</Text>
            <TouchableOpacity onPress={onClose} className="p-2 active:bg-gray-100 rounded-full">
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-2 mb-3">
            <TouchableOpacity
              onPress={() => setFormData((prev) => ({ ...prev, type: "gave" }))}
              className={`flex-1 p-4 rounded-xl border-2 ${formData.type === "gave" ? "bg-red-50 border-red-400" : "bg-gray-50 border-gray-200"}`}
            >
              <Text className={`text-center font-semibold ${formData.type === "gave" ? "text-red-700" : "text-gray-600"}`}>↓ Gave</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFormData((prev) => ({ ...prev, type: "received" }))}
              className={`flex-1 p-4 rounded-xl border-2 ${formData.type === "received" ? "bg-green-50 border-green-400" : "bg-gray-50 border-gray-200"}`}
            >
              <Text className={`text-center font-semibold ${formData.type === "received" ? "text-green-700" : "text-gray-600"}`}>↑ Received</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            className="bg-gray-50 rounded-xl p-3 mb-3 text-gray-800 border border-gray-200"
            placeholder="Amount (₹)"
            keyboardType="numeric"
            value={formData.amount}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, amount: text }))}
          />

          <TextInput
            className="bg-gray-50 rounded-xl p-3 mb-4 text-gray-800 border border-gray-200"
            placeholder="Description (optional)"
            value={formData.desc}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, desc: text }))}
          />

          <TouchableOpacity onPress={handleSave} className="bg-blue-600 p-4 rounded-xl active:bg-blue-700" disabled={saving}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-center">Add Transaction</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
