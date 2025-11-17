// lib/components/dheeto-components.tsx

import { Trash2, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, View, TouchableOpacity, ScrollView, Alert, TextInput, Switch, ActivityIndicator , Text} from "react-native";
import { updateItem, deleteItem, updateTransaction, deleteTransaction, addItem, addTransaction, updateDheeto } from "../api/api_providers";
import { Dheeto } from "../types";


const BaseModal = ({ title, onClose, children, showDelete = false, onDelete}: any) => (
  <Modal visible transparent animationType="slide">
    <View className="flex-1 bg-black/50 justify-center">
      <View className="bg-white mx-4 rounded-2xl p-5 max-h-[75%]">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-gray-900">{title}</Text>

          <View className="flex-row items-center gap-2">
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
    isSettled: item.isSettled,
    settledAt: item.settledAt,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const settlementChanged = formData.isSettled !== item.isSettled;

    const performSave = async () => {
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

    if (settlementChanged) {
      Alert.alert(
        formData.isSettled ? "Settle Item" : "Unsettle Item",
        formData.isSettled
          ? "This will mark the item as settled."
          : "This will mark the item as unsettled.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Confirm", onPress: performSave },
        ]
      );
    } else {
      performSave();
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

  return (
    <BaseModal title="Edit Item" onClose={onClose} showDelete onDelete={handleDelete}>
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

        {/* Settle Toggle */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base font-semibold text-gray-700">Settled</Text>
          <Switch
            value={formData.isSettled}
            onValueChange={(v) =>
              setFormData((p) => ({
                ...p,
                isSettled: v,
                settledAt: v ? new Date() : null,
              }))
            }
          />
        </View>

        {formData.isSettled && (
          <View className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <Text className="text-sm font-medium text-green-700">
              Settled on {new Date(formData.settledAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        <TouchableOpacity onPress={handleSave} className="bg-blue-600 py-4 rounded-xl active:bg-blue-700" disabled={saving}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-center text-base">Save Changes</Text>}
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
    purity: "24",
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


interface EditDheetoModalProps {
  dheeto: Dheeto;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditDheetoModal({ dheeto, onClose, onUpdate }: EditDheetoModalProps) {
  const [formData, setFormData] = useState({
    desc: dheeto.desc || "",
    isSettled: dheeto.isSettled || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateDheeto(dheeto.id, formData);
      
      if (response.success) {
        Alert.alert("Success", "Dheeto updated successfully");
        onUpdate();
        onClose();
      } else {
        Alert.alert("Error", response.message || "Failed to update dheeto");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update dheeto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal title="Edit Dheeto" onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <TextInput
          className="bg-gray-50 rounded-xl p-4 mb-6 text-gray-800 border border-gray-200 text-base"
          placeholder="Description (optional)"
          value={formData.desc}
          onChangeText={(t) => setFormData((p) => ({ ...p, desc: t }))}
          multiline
          numberOfLines={3}
        />

        {/* Settle Toggle */}
        <View className="flex-row items-center justify-between mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <View className="flex-1 pr-4">
            <Text className="text-base font-semibold text-gray-900 mb-1">Mark as Settled</Text>
            <Text className="text-xs text-gray-600">Once settled, this dheeto will be marked as complete</Text>
          </View>
          <Switch
            value={formData.isSettled}
            onValueChange={(v) => setFormData((p) => ({ ...p, isSettled: v }))}
          />
        </View>

        {formData.isSettled && (
          <View className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <Text className="text-sm font-medium text-green-700 text-center">
              ✓ This dheeto will be marked as settled
            </Text>
          </View>
        )}

        <TouchableOpacity 
          onPress={handleSave} 
          className="bg-blue-600 py-4 rounded-xl active:bg-blue-700 mb-2" 
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-center text-base">Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </BaseModal>
  );
}