import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { User, Plus, Filter } from "lucide-react-native";
import { useRouter } from "expo-router";
import { fetchAllPersons, searchPersons } from "@/lib/api/person";
import { Person } from "@/lib/shared_types/db_types";
import { GetAllPersonsResponse, SearchPersonResponse, SearchPersonQuery } from "@/lib/shared_types/person_types";
import { PaginationMeta } from "@/lib/shared_types/types";
import PersonCard from "@/lib/components/PersonCard";
import PaginationControls from "@/lib/components/PaginationControls";
import SearchModal from "@/lib/components/SearchModal";
import Toast, { ToastType } from "@/lib/components/Toast";

export default function PersonListPage() {
  const router = useRouter();
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
    createdAfter: "",
    createdBefore: "",
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
      const response = (await fetchAllPersons({ page: page.toString(), limit: "50" })) as GetAllPersonsResponse;
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
      createdAfter: "",
      createdBefore: "",
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
            <TouchableOpacity onPress={() => router.push("/add-person")} className="flex-row items-center gap-2 bg-indigo-600 px-5 py-3 rounded-xl shadow-lg">
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
                  <PersonCard key={person._id} person={person} onPress={() => router.push(`/person-detail/${person._id}`)} />
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
