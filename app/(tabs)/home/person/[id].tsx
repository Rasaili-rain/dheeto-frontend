// app/(tabs)/home/person/[id].tsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, RefreshControl, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchPersonById, deletePerson } from "@/lib/api/person";
import { getAllDheetos } from "@/lib/api/dheeto";
import { Person, Dheeto } from "@/lib/shared_types/db_types";
import { GetPersonResponse } from "@/lib/shared_types/person_types";
import Toast, { ToastType } from "@/lib/components/Toast";
import { User, Phone, FileText, Trash2, Plus, ChevronLeft, Package, TrendingUp, TrendingDown, ChevronRight, Clock, MoreVertical } from "lucide-react-native";
import { DheetoCard } from "@/lib/components/person-components";

export default function PersonDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const goToIndividualDheetoPage = (dheetoId: string) => router.push(`/home/person/dheeto/${dheetoId}`);
  const goToAddDheetoPage = (personId: string, personName: string) =>
    router.push(`/home/person/dheeto/add-dheeto?personId=${personId}&personName=${encodeURIComponent(personName)}`);

  const [person, setPerson] = useState<Person | null>(null);
  const [dheetos, setDheetos] = useState<Dheeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [filter, setFilter] = useState<"all" | "settled" | "unsettled">("all");
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: ToastType;
  }>({ show: false, message: "", type: "success" });

  const displayToast = (msg: string, type: ToastType = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 3000);
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    // setFilter(newFilter);
    // TODO
    // fetchDheetos(newFilter);
  };

  const fetchDheetos = async () => {
    if (!person) return;
    try {
      const response = await getAllDheetos({ personId: person._id });
      if (response.success && response.data) {
        setDheetos(response.data);
      }
    } catch (error) {
      console.error("Error fetching dheetos:", error);
      Alert.alert("Error", "Failed to load dheetos");
    } finally {
      setRefreshing(false);
    }
  };

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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDheetos();
  };

  const handleDeletePerson = () => {
    setShowMenu(false);
    if (!person) return;

    Alert.alert("Delete Person", `Are you sure you want to delete ${person.name}? This will also delete all associated dheetos and cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePerson(person._id);
            displayToast("Deleted", "success");
            router.back();
          } catch (e: any) {
            displayToast(e.message ?? "Delete failed", "error");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadPerson();
  }, [id]);

  useEffect(() => {
    if (person) {
      fetchDheetos();
    }
  }, [person?._id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!person) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500 mb-4">Person not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-indigo-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPositiveBalance = person.totalBalance >= 0;

  return (
    <>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 active:bg-gray-100 rounded-full" activeOpacity={0.7}>
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

          {/* Empty State */}
          {dheetos.length === 0 && (
            <View className="mx-4 bg-white rounded-2xl p-8 items-center border border-gray-100">
              <Package size={48} color="#9CA3AF" />
              <Text className="text-gray-900 font-semibold text-lg mt-3">No Dheetos Yet</Text>
              <Text className="text-gray-500 text-sm text-center mt-1">Start by adding your first dheeto for {person.name}</Text>
            </View>
          )}

          {/* dheeto filters */}
          {dheetos.length > 0 && (
            <View className="mx-4  mb-3">
              {/* Segmented Button: All / Settled / Unsettled */}
              <View className="flex-row mt-3 bg-gray-100 p-1 rounded-full">
                <TouchableOpacity className={`flex-1 py-2 rounded-full ${filter === "all" ? "bg-white shadow-sm" : ""}`} onPress={() => handleFilterChange("all")}>
                  <Text className={`text-center text-xs font-medium ${filter === "all" ? "text-blue-700" : "text-gray-600"}`}>All ({dheetos.length})</Text>
                </TouchableOpacity>

                <TouchableOpacity className={`flex-1 py-2 rounded-full ${filter === "settled" ? "bg-white shadow-sm" : ""}`} onPress={() => handleFilterChange("settled")}>
                  <Text className={`text-center text-xs font-medium ${filter === "settled" ? "text-green-700" : "text-gray-600"}`}>
                    Settled ({dheetos.length - person.unsettledDheetosCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity className={`flex-1 py-2 rounded-full ${filter === "unsettled" ? "bg-white shadow-sm" : ""}`} onPress={() => handleFilterChange("unsettled")}>
                  <Text className={`text-center text-xs font-medium ${filter === "unsettled" ? "text-orange-700" : "text-gray-600"}`}>
                    Unsettled ({person.unsettledDheetosCount})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Dheetos List */}
          {dheetos.length > 0 && (
            <View className="mx-4 space-y-3">
              {dheetos.map((dheeto) => (
                <DheetoCard key={dheeto._id} dheeto={dheeto} onPress={() => goToIndividualDheetoPage(dheeto._id)} />
              ))}
            </View>
          )}

          {/* Add Button */}
          <View className="mx-4 mt-4 mb-8">
            <TouchableOpacity
              onPress={() => goToAddDheetoPage(person._id, person.name)}
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
      {toast.show && <Toast toast={toast} />}
    </>
  );
}
