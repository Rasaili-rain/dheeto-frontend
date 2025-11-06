// lib/components/dheeto-components.tsx
import { updateItem, addItem, deleteItem } from "@/lib/api/item";
import { updateTransaction, addTransaction, deleteTransaction } from "@/lib/api/transaction";
import { settleItem } from "@/lib/api/item";
import { X, Trash2, CheckCircle, RotateCcw } from "lucide-react-native";
import { useState } from "react";
import { Modal, View, TouchableOpacity, Alert, ScrollView, TextInput, ActivityIndicator, Text } from "react-native";

const BaseModal = ({ title, onClose, children, showDelete = false, onDelete, showSettle = false, onSettle, showUnsettle = false, onUnsettle }: any) => (
  <Modal visible transparent animationType="slide">
    <View className="flex-1 bg-black/50 justify-center">
      <View className="bg-white mx-4 rounded-2xl p-5 max-h-[75%]">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-gray-900">{title}</Text>

          <View className="flex-row items-center gap-2">
            {showSettle && (
              <TouchableOpacity onPress={onSettle} className="p-2 bg-green-50 rounded-lg active:bg-green-100">
                <CheckCircle size={18} color="#16A34A" />
              </TouchableOpacity>
            )}
            {showUnsettle && (
              <TouchableOpacity onPress={onUnsettle} className="p-2 bg-orange-50 rounded-lg active:bg-orange-100">
                <RotateCcw size={18} color="#EA580C" />
              </TouchableOpacity>
            )}
            {showDelete && (
              <TouchableOpacity onPress={onDelete} className="p-2 bg-red-50 rounded-lg active:bg-red-100">
                <Trash2 size={18} color="#DC2626" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-lg active:bg-gray-200">
              <X size={18} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-grow">{children}</ScrollView>
      </View>
    </View>
  </Modal>
);

const TypeSelector = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: any) => void;
  options: Array<{
    value: string;
    label: string;
    activeStyle: string;
    textColor: string;
  }>;
}) => (
  <View className="flex-row gap-3 mb-4">
    {options.map((option) => (
      <TouchableOpacity
        key={option.value}
        onPress={() => onChange(option.value)}
        className={`flex-1 py-4 rounded-xl border-2 ${value === option.value ? option.activeStyle : "bg-gray-50 border-gray-200"}`}
      >
        <Text className={`text-center font-semibold text-base ${value === option.value ? option.textColor : "text-gray-600"}`}>{option.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export const EditItemModal = ({ item, dheetoId, onClose, onUpdate }: any) => {
  const [formData, setFormData] = useState({
    name: item.name,
    type: item.type,
    purity: item.purity.toString(),
    weightInTola: item.weightInTola.toString(),
    desc: item.desc || "",
  });
  const [saving, setSaving] = useState(false);
  const [settling, setSettling] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateItem(dheetoId, item._id, {
        ...formData,
        purity: parseFloat(formData.purity),
        weightInTola: parseFloat(formData.weightInTola),
      });
      if (response.success) {
        Alert.alert("Success", "Item updated successfully");
        onClose();
        onUpdate();
      }
    } catch {
      Alert.alert("Error", "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            const response = await deleteItem(dheetoId, item._id);
            if (response.success) {
              Alert.alert("Success", "Item deleted successfully");
              onClose();
              onUpdate();
            }
          } catch {
            Alert.alert("Error", "Failed to delete item");
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const handleSettle = () => {
    Alert.alert("Settle Item", "Mark this item as settled? A settlement date will be recorded.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Settle",
        onPress: async () => {
          try {
            setSettling(true);
            const response = await settleItem(dheetoId, item._id, {
              settledAt: new Date(),
            });
            if (response.success) {
              Alert.alert("Success", "Item settled successfully");
              onClose();
              onUpdate();
            }
          } catch {
            Alert.alert("Error", "Failed to settle item");
          } finally {
            setSettling(false);
          }
        },
      },
    ]);
  };

  const handleUnsettle = () => {
    Alert.alert("Unsettle Item", "Remove the settlement status? The recorded date will be cleared.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unsettle",
        style: "destructive",
        onPress: async () => {
          try {
            setSettling(true);
            const response = await settleItem(dheetoId, item._id, {
              settledAt: null,
            });
            if (response.success) {
              Alert.alert("Success", "Item unsettled successfully");
              onClose();
              onUpdate();
            }
          } catch {
            Alert.alert("Error", "Failed to unsettle item");
          } finally {
            setSettling(false);
          }
        },
      },
    ]);
  };

  return (
    <BaseModal
      title="Edit Item"
      onClose={onClose}
      showDelete
      onDelete={handleDelete}
      showSettle={!item.settledAt}
      onSettle={handleSettle}
      showUnsettle={!!item.settledAt}
      onUnsettle={handleUnsettle}
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <TextInput
          className="bg-gray-50 rounded-xl p-4 mb-4 text-gray-800 border border-gray-200 text-base"
          placeholder="Item name"
          value={formData.name}
          onChangeText={(t) => setFormData((p) => ({ ...p, name: t }))}
        />

        <TypeSelector
          value={formData.type}
          onChange={(type: "gold" | "silver") => setFormData((p) => ({ ...p, type }))}
          options={[
            {
              value: "gold",
              label: "Gold",
              activeStyle: "bg-yellow-50 border-yellow-400",
              textColor: "text-yellow-700",
            },
            {
              value: "silver",
              label: "Silver",
              activeStyle: "bg-gray-100 border-gray-400",
              textColor: "text-gray-700",
            },
          ]}
        />

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-2 ml-1">Purity (%)</Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-gray-800 border border-gray-200 text-base"
              placeholder="e.g., 22"
              keyboardType="decimal-pad"
              value={formData.purity}
              onChangeText={(t) => setFormData((p) => ({ ...p, purity: t }))}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-2 ml-1">Weight (tola)</Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-gray-800 border border-gray-200 text-base"
              placeholder="e.g., 2.5"
              keyboardType="decimal-pad"
              value={formData.weightInTola}
              onChangeText={(t) => setFormData((p) => ({ ...p, weightInTola: t }))}
            />
          </View>
        </View>

        <TextInput
          className="bg-gray-50 rounded-xl p-4 mb-6 text-gray-800 border border-gray-200 text-base"
          placeholder="Additional notes"
          value={formData.desc}
          onChangeText={(t) => setFormData((p) => ({ ...p, desc: t }))}
          multiline
        />

        {item.settledAt ? (
          <View className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <Text className="text-sm font-medium text-green-700">Settled on {new Date(item.settledAt).toLocaleDateString()}</Text>
          </View>
        ) : (
          <View className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Text className="text-sm font-medium text-amber-700">Not settled</Text>
          </View>
        )}

        <TouchableOpacity onPress={handleSave} className="bg-blue-600 py-4 rounded-xl active:bg-blue-700" disabled={saving || settling}>
          {saving || settling ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-center text-base">Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </BaseModal>
  );
};

export const EditTransactionModal = ({ transaction, dheetoId, onClose, onUpdate }: any) => {
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
        ...formData,
        amount: parseFloat(formData.amount),
      });
      if (response.success) {
        Alert.alert("Success", "Transaction updated successfully");
        onClose();
        onUpdate();
      }
    } catch {
      Alert.alert("Error", "Failed to update transaction");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            const response = await deleteTransaction(dheetoId, transaction._id);
            if (response.success) {
              Alert.alert("Success", "Transaction deleted successfully");
              onClose();
              onUpdate();
            }
          } catch {
            Alert.alert("Error", "Failed to delete transaction");
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  return (
    <BaseModal title="Edit Transaction" onClose={onClose} showDelete onDelete={handleDelete}>
      <View className="flex-1">
        <TypeSelector
          value={formData.type}
          onChange={(type: "gave" | "received") => setFormData((p) => ({ ...p, type }))}
          options={[
            {
              value: "gave",
              label: "Gave",
              activeStyle: "bg-red-50 border-red-400",
              textColor: "text-red-700",
            },
            {
              value: "received",
              label: "Received",
              activeStyle: "bg-green-50 border-green-400",
              textColor: "text-green-700",
            },
          ]}
        />

        <TextInput
          className="bg-gray-50 rounded-xl p-4 mb-4 text-gray-800 border border-gray-200 text-base"
          placeholder="Amount (INR)"
          keyboardType="numeric"
          value={formData.amount}
          onChangeText={(t) => setFormData((p) => ({ ...p, amount: t }))}
        />

        <TextInput
          className="bg-gray-50 rounded-xl p-4 mb-6 text-gray-800 border border-gray-200 text-base"
          placeholder="Description"
          value={formData.desc}
          onChangeText={(t) => setFormData((p) => ({ ...p, desc: t }))}
          multiline
        />

        <TouchableOpacity onPress={handleSave} className="bg-blue-600 py-4 rounded-xl active:bg-blue-700" disabled={saving}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-center text-base">Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};

export const AddItemModal = ({ dheetoId, onClose, onUpdate }: any) => {
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
        ...formData,
        purity: parseFloat(formData.purity) || 0,
        weightInTola: parseFloat(formData.weightInTola),
      });
      if (response.success) {
        Alert.alert("Success", "Item added successfully");
        onClose();
        onUpdate();
      }
    } catch {
      Alert.alert("Error", "Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal title="Add Item" onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <TextInput
          className="bg-gray-50 rounded-xl p-4 mb-4 text-gray-800 border border-gray-200 text-base"
          placeholder="Item name (e.g., Gold Ring)"
          value={formData.name}
          onChangeText={(t) => setFormData((p) => ({ ...p, name: t }))}
        />

        <TypeSelector
          value={formData.type}
          onChange={(type: "gold" | "silver") => setFormData((p) => ({ ...p, type }))}
          options={[
            {
              value: "gold",
              label: "Gold",
              activeStyle: "bg-yellow-50 border-yellow-400",
              textColor: "text-yellow-700",
            },
            {
              value: "silver",
              label: "Silver",
              activeStyle: "bg-gray-100 border-gray-400",
              textColor: "text-gray-700",
            },
          ]}
        />

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-2 ml-1">Purity (%)</Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-gray-800 border border-gray-200 text-base"
              placeholder="e.g., 22"
              keyboardType="decimal-pad"
              value={formData.purity}
              onChangeText={(t) => setFormData((p) => ({ ...p, purity: t }))}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-2 ml-1">Weight (tola)</Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-gray-800 border border-gray-200 text-base"
              placeholder="e.g., 2.5"
              keyboardType="decimal-pad"
              value={formData.weightInTola}
              onChangeText={(t) => setFormData((p) => ({ ...p, weightInTola: t }))}
            />
          </View>
        </View>

        <TextInput
          className="bg-gray-50 rounded-xl p-4 mb-6 text-gray-800 border border-gray-200 text-base"
          placeholder="Additional notes"
          value={formData.desc}
          onChangeText={(t) => setFormData((p) => ({ ...p, desc: t }))}
          multiline
        />

        <TouchableOpacity onPress={handleSave} className="bg-amber-600 py-4 rounded-xl active:bg-amber-700" disabled={saving}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-center text-base">Add Item</Text>}
        </TouchableOpacity>
      </ScrollView>
    </BaseModal>
  );
};

export const AddTransactionModal = ({ dheetoId, onClose, onUpdate }: any) => {
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
        ...formData,
        amount: parseFloat(formData.amount),
      });
      if (response.success) {
        Alert.alert("Success", "Transaction added successfully");
        onClose();
        onUpdate();
      }
    } catch {
      Alert.alert("Error", "Failed to add transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal title="Add Transaction" onClose={onClose}>
      <View className="flex-1">
        <TypeSelector
          value={formData.type}
          onChange={(type: "gave" | "received") => setFormData((p) => ({ ...p, type }))}
          options={[
            {
              value: "gave",
              label: "Gave",
              activeStyle: "bg-red-50 border-red-400",
              textColor: "text-red-700",
            },
            {
              value: "received",
              label: "Received",
              activeStyle: "bg-green-50 border-green-400",
              textColor: "text-green-700",
            },
          ]}
        />

        <TextInput
          className="bg-gray-50 rounded-xl p-4 mb-4 text-gray-800 border border-gray-200 text-base"
          placeholder="Amount (INR)"
          keyboardType="numeric"
          value={formData.amount}
          onChangeText={(t) => setFormData((p) => ({ ...p, amount: t }))}
        />

        <TextInput
          className="bg-gray-50 rounded-xl p-4 mb-6 text-gray-800 border border-gray-200 text-base"
          placeholder="Description (optional)"
          value={formData.desc}
          onChangeText={(t) => setFormData((p) => ({ ...p, desc: t }))}
          multiline
        />

        <TouchableOpacity onPress={handleSave} className="bg-blue-600 py-4 rounded-xl active:bg-blue-700" disabled={saving}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-center text-base">Add Transaction</Text>}
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};
