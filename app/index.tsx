// app/(tabs)/home/index.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { User, Plus, Filter, DollarSign, Phone } from "lucide-react-native";
import { useRouter } from "expo-router";
import PaginationControls from "@/lib/components/PaginationControls";
import SearchModal from "@/lib/components/SearchModal";
import Toast, { ToastType } from "@/lib/components/Toast";
import { fetchAllPersons, searchPersons } from "@/lib/api/api_providers";
import { Person, PaginationMeta, SearchPersonQuery, GetAllPersonsResponse, SearchPersonResponse } from "@/lib/types";

export default function PersonListPage() {
  const router = useRouter();
  const goToAddPersonPage = () => router.push("/person/add-person");
  const goToPersonDetailsPage = (person: Person) =>
    router.push({
      pathname: "/person/[id]",
      params: { id: person.id, person: JSON.stringify(person) },
    });

  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 50,
    hasNext: false,
    hasPrev: false,
  });
  const [searchParams, setSearchParams] = useState<SearchPersonQuery>({
    name: "",
    phoneNo: "",
  });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: "",
    type: "success",
  });

  const displayToast = (message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const loadPersons = async (page = 1) => {
    setLoading(true);
    try {
      const response = (await fetchAllPersons({ page: page, limit: 50 })) as GetAllPersonsResponse;
      if (!response.success) throw new Error(response.message || "Failed to load persons");
      setPersons(response.data);
      setPagination(response.pagination);
    } catch (err) {
      displayToast(err instanceof Error ? err.message : "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const hasParams = Object.values(searchParams).some((v) => v);
    if (!hasParams) return displayToast("Enter a search parameter", "error");
    setLoading(true);
    setShowSearch(false);
    try {
      const response = (await searchPersons(searchParams)) as SearchPersonResponse;
      if (!response.success) {
        throw new Error(response.message || "Search failed");
      }
      setPersons(response.data);
      setPagination(response.pagination);
      setIsSearchActive(true);
    } catch (err) {
      displayToast(err instanceof Error ? err.message : "Search failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchParams({
      name: "",
      phoneNo: "",
    });
    setIsSearchActive(false);
    loadPersons();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (isSearchActive) await handleSearch();
    else await loadPersons(pagination.currentPage);
    setRefreshing(false);
  };

  useEffect(() => {
    loadPersons();
  }, []);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-gray-900">{isSearchActive ? "Search Results" : "All Persons"}</Text>
            <Text className="text-sm text-gray-500 mt-1 font-medium">{pagination.totalRecords} total</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => setShowSearch(true)} className="p-3 bg-white border border-gray-300 rounded-xl shadow-md">
              <Filter size={22} color="#6366F1" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goToAddPersonPage()} className="flex-row items-center gap-2 bg-indigo-600 px-5 py-3 rounded-xl shadow-lg">
              <Plus size={22} color="#FFFFFF" />
              <Text className="text-white font-bold text-base">Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Active Banner */}
        {isSearchActive && (
          <View className="bg-indigo-100 border-2 border-indigo-300 px-4 py-3 rounded-xl mb-3 flex-row items-center justify-between">
            <Text className="text-indigo-900 font-bold text-sm">🔍 Search Active</Text>
            <TouchableOpacity onPress={clearSearch}>
              <Text className="text-indigo-700 font-bold text-sm underline">Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-gray-500 mt-4">Loading...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View className="px-4 pb-4">
            {persons.length === 0 ? (
              <View className="items-center py-12">
                <User size={64} color="#D1D5DB" />
                <Text className="text-gray-500 mt-4 text-center px-8">{isSearchActive ? "No matches found" : "No persons yet. Add one!"}</Text>
              </View>
            ) : (
              <View className="space-y-3">
                {persons.map((person) => (
                  <PersonCard key={person.id} person={person} onPress={() => goToPersonDetailsPage(person)} />
                ))}
              </View>
            )}
            <PaginationControls pagination={pagination} onPageChange={loadPersons} />
          </View>
        </ScrollView>
      )}

      {/* Modals */}
      <SearchModal visible={showSearch} onClose={() => setShowSearch(false)} searchParams={searchParams} setSearchParams={setSearchParams} onSearch={handleSearch} />

      {toast && <Toast toast={toast} />}
    </View>
  );

}




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

