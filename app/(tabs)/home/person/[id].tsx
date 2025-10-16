// app/(tabs)/home/_/person-detail/[id].tsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, RefreshControl, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchPersonById, deletePerson } from "@/lib/api/person";
import { getAllDheetos } from "@/lib/api/dheeto";
import { Person } from "@/lib/shared_types/db_types";
import { Dheeto } from "@/lib/shared_types/db_types";
import { GetPersonResponse } from "@/lib/shared_types/person_types";
import Toast, { ToastType } from "@/lib/components/Toast";
import { User, Phone, FileText, Trash2, Plus, ChevronLeft, Package, TrendingUp, TrendingDown, ChevronRight, Clock, MoreVertical } from "lucide-react-native";
import AddDheetoPage from "../dheeto/add-dheeto";
import DheetoDetailPage from "../dheeto/dheeto-details";

const DheetoCard = ({ dheeto, onPress }: { dheeto: Dheeto; onPress: () => void }) => {
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

// Main PersonDetailPage
const PersonDetailPage = ({ person, onBack, onDelete }: { person: Person; onBack: () => void; onDelete: () => void }) => {
  const [showAddDheeto, setShowAddDheeto] = useState(false);
  const [selectedDheeto, setSelectedDheeto] = useState<Dheeto | null>(null);
  const [dheetos, setDheetos] = useState<Dheeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isPositiveBalance = person.totalBalance >= 0;

  const fetchDheetos = async () => {
    try {
      setLoading(true);
      const response = await getAllDheetos({ personId: person._id });
      if (response.success && response.data) {
        setDheetos(response.data);
      }
    } catch (error) {
      console.error("Error fetching dheetos:", error);
      Alert.alert("Error", "Failed to load dheetos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDheetos();
  }, [person._id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDheetos();
  };

  const handleDheetoSaved = () => {
    setShowAddDheeto(false);
    fetchDheetos();
  };

  const handleDeletePerson = () => {
    setShowMenu(false);
    Alert.alert("Delete Person", `Are you sure you want to delete ${person.name}? This will also delete all associated dheetos and cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: onDelete,
      },
    ]);
  };

  if (showAddDheeto) return <AddDheetoPage personId={person._id} personName={person.name} onBack={() => setShowAddDheeto(false)} onSave={handleDheetoSaved} />;

  if (selectedDheeto) return <DheetoDetailPage dheeto={selectedDheeto} onBack={() => setSelectedDheeto(null)} onUpdate={fetchDheetos} />;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={onBack} className="p-2 -ml-2 active:bg-gray-100 rounded-full" activeOpacity={0.7}>
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">Details</Text>
          <TouchableOpacity onPress={() => setShowMenu(true)} className="p-2 -mr-2 active:bg-gray-100 rounded-full" activeOpacity={0.7}>
            <MoreVertical size={22} color="#374151" />
          </TouchableOpacity>
        </View>

        <View className="items-center py-4">
          <View className="bg-blue-100 p-4 rounded-full mb-3">
            <User size={32} color="#2563EB" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-1">{person.name}</Text>
          {person.phoneNo && (
            <View className="flex-row items-center gap-1.5">
              <Phone size={14} color="#6B7280" />
              <Text className="text-sm text-gray-600">{person.phoneNo}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        {/* Balance Card */}
        <View className="mx-4 mt-4">
          <View className={`rounded-2xl p-6 ${isPositiveBalance ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"}`}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-600 font-medium mb-1">Total Balance</Text>
                <Text className={`text-4xl font-bold ${isPositiveBalance ? "text-green-700" : "text-red-700"}`}>
                  {isPositiveBalance ? "+" : "-"}₹{Math.abs(person.totalBalance).toLocaleString()}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {person.unsettledDheetosCount} unsettled • {dheetos.length - person.unsettledDheetosCount} settled
                </Text>
              </View>
              <View className={`p-4 rounded-full ${isPositiveBalance ? "bg-green-200" : "bg-red-200"}`}>
                {isPositiveBalance ? <TrendingUp size={28} color="#15803d" /> : <TrendingDown size={28} color="#b91c1c" />}
              </View>
            </View>
          </View>
        </View>

        {/* About Section */}
        {person.desc && (
          <View className="mx-4 mt-4">
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-start gap-2">
                <FileText size={16} color="#6B7280" className="mt-1" />
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 uppercase font-medium mb-1">About</Text>
                  <Text className="text-sm text-gray-700 leading-5">{person.desc}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Dheetos Header */}
        <View className="mx-4 mt-6 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Package size={20} color="#2563EB" />
              <Text className="text-xl font-bold text-gray-900">Dheetos</Text>
            </View>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 font-semibold text-sm">{dheetos.length}</Text>
            </View>
          </View>
        </View>

        {/* Loading State */}
        {loading && (
          <View className="mx-4 py-12 items-center">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-gray-500 mt-3">Loading dheetos...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && dheetos.length === 0 && (
          <View className="mx-4 bg-white rounded-2xl p-8 items-center border border-gray-100">
            <Package size={48} color="#9CA3AF" />
            <Text className="text-gray-900 font-semibold text-lg mt-3">No Dheetos Yet</Text>
            <Text className="text-gray-500 text-sm text-center mt-1">Start by adding your first dheeto for {person.name}</Text>
          </View>
        )}

        {/* Dheetos List */}
        {!loading && dheetos.length > 0 && (
          <View className="mx-4 space-y-3">
            {dheetos.map((dheeto) => (
              <DheetoCard key={dheeto._id} dheeto={dheeto} onPress={() => setSelectedDheeto(dheeto)} />
            ))}
          </View>
        )}

        {/* Add Button */}
        <View className="mx-4 mt-4 mb-8">
          <TouchableOpacity
            onPress={() => setShowAddDheeto(true)}
            className="bg-blue-600 rounded-2xl p-5 flex-row items-center justify-center shadow-sm active:bg-blue-700"
            activeOpacity={0.8}
          >
            <Plus size={22} color="#FFFFFF" />
            <Text className="text-white font-bold text-lg ml-2">Add New Dheeto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Menu Modal */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity className="flex-1 bg-black/50 justify-end" activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View className="bg-white rounded-t-3xl p-6">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />

            <Text className="text-lg font-bold text-gray-900 mb-4">Person Options</Text>

            {/* Delete Option */}
            <TouchableOpacity onPress={handleDeletePerson} className="flex-row items-center p-4 bg-red-50 rounded-xl border border-red-200 active:bg-red-100" activeOpacity={0.7}>
              <View className="bg-red-100 p-2 rounded-lg mr-3">
                <Trash2 size={20} color="#DC2626" />
              </View>
              <View className="flex-1">
                <Text className="text-red-700 font-bold text-base">Delete Person</Text>
                <Text className="text-red-600 text-xs mt-0.5">This action cannot be undone</Text>
              </View>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity onPress={() => setShowMenu(false)} className="mt-3 p-4 bg-gray-100 rounded-xl active:bg-gray-200" activeOpacity={0.7}>
              <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Export the route wrapper
export default function PersonDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: ToastType;
  }>({ show: false, message: "", type: "success" });

  // toast helper
  const displayToast = (msg: string, type: ToastType = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 3000);
  };

  // load person
  const loadPerson = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = (await fetchPersonById(id)) as GetPersonResponse;
      if (!res.success) throw new Error(res.message);
      setPerson(res.data);
    } catch (e: any) {
      displayToast(e.message ?? "Failed", "error");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // delete handler
  const handleDelete = async () => {
    if (!person) return;
    Alert.alert("Delete Person", `Delete ${person.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deletePerson(person._id);
            displayToast("Deleted", "success");
            router.back(); // go back to list (still inside tab)
          } catch (e: any) {
            displayToast(e.message ?? "Delete failed", "error");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadPerson();
  }, [id]);

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!person) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <Text className="text-gray-500 mb-4">Person not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-indigo-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <PersonDetailPage person={person} onBack={() => router.back()} onDelete={handleDelete} />
      {toast.show && <Toast toast={toast} />}
    </>
  );
}
