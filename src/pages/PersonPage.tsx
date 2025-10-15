import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { User, Phone, X, Plus, Search, Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react-native";
import { createPerson, fetchAllPersons, fetchPersonById, deletePerson, searchPersons } from "../api/person";

import { Person } from "../shared_types/db_types";
import Toast, { ToastType } from "../components/toast";
import { CreatePersonBody, SearchPersonQuery, GetAllPersonsResponse, SearchPersonResponse, GetPersonResponse } from "../shared_types/person_types";
import { PaginationMeta } from "../shared_types/types";
import PersonDetailPage from "./PersonDetailPage";

type ViewType = "list" | "add" | "detail";

interface PersonState {
  persons: Person[];
  setPersons: (persons: Person[]) => void;
  selectedPerson: Person | null;
  setSelectedPerson: (person: Person | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
  view: ViewType;
  setView: (view: ViewType) => void;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  dateMode: "after" | "before" | null;
  setDateMode: (mode: "after" | "before" | null) => void;
  formData: CreatePersonBody;
  setFormData: (formData: CreatePersonBody) => void;
  searchParams: SearchPersonQuery;
  setSearchParams: (params: SearchPersonQuery | ((prev: SearchPersonQuery) => SearchPersonQuery)) => void;
  tempDate: Date;
  setTempDate: (date: Date) => void;
  isSearchActive: boolean;
  setIsSearchActive: (isActive: boolean) => void;
  pagination: PaginationMeta;
  setPagination: (pagination: PaginationMeta) => void;
  toast: { show: boolean; message: string; type: ToastType } | null;
  displayToast: (message: string, type: ToastType) => void;
}
const usePersonState = (): PersonState => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<ViewType>("list");
  const [showSearch, setShowSearch] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateMode, setDateMode] = useState<"after" | "before" | null>(null);
  const [formData, setFormData] = useState<CreatePersonBody>({ name: "", phoneNo: "", desc: "" });
  const [searchParams, setSearchParams] = useState<SearchPersonQuery>({ name: "", phoneNo: "", createdAfter: "", createdBefore: "" });
  const [tempDate, setTempDate] = useState(new Date());
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({ currentPage: 1, totalPages: 1, totalRecords: 0, limit: 50, hasNext: false, hasPrev: false });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({ show: false, message: "", type: "success" });

  const displayToast = (message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  return {
    persons,
    setPersons,
    selectedPerson,
    setSelectedPerson,
    loading,
    setLoading,
    refreshing,
    setRefreshing,
    view,
    setView,
    showSearch,
    setShowSearch,
    showDatePicker,
    setShowDatePicker,
    dateMode,
    setDateMode,
    formData,
    setFormData,
    searchParams,
    setSearchParams,
    tempDate,
    setTempDate,
    isSearchActive,
    setIsSearchActive,
    pagination,
    setPagination,
    toast,
    displayToast,
  };
};

// Search Modal
const SearchModal = ({
  visible,
  onClose,
  searchParams,
  setSearchParams,
  onSearch,
  onOpenDatePicker,
  onClearDate,
}: {
  visible: boolean;
  onClose: () => void;
  searchParams: Partial<SearchPersonQuery>;
  setSearchParams: React.Dispatch<React.SetStateAction<Partial<SearchPersonQuery>>>;
  onSearch: () => void;
  onOpenDatePicker: (mode: "after" | "before") => void;
  onClearDate: (mode: "after" | "before") => void;
}) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <View className="flex-1 bg-black/50">
      <View className="flex-1 mt-20 bg-white rounded-t-3xl">
        <View className="p-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-800">Search Persons</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} className="mb-4" keyboardShouldPersistTaps="handled">
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Name</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3">
                  <User size={20} color="#6B7280" />
                  <TextInput
                    placeholder="Search by name..."
                    value={searchParams.name}
                    onChangeText={(text) => setSearchParams((prev) => ({ ...prev, name: text }))}
                    className="flex-1 ml-3 text-gray-800"
                  />
                </View>
              </View>
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Phone</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3">
                  <Phone size={20} color="#6B7280" />
                  <TextInput
                    placeholder="Search by phone..."
                    value={searchParams.phoneNo}
                    onChangeText={(text) => setSearchParams((prev) => ({ ...prev, phoneNo: text }))}
                    keyboardType="phone-pad"
                    className="flex-1 ml-3 text-gray-800"
                  />
                </View>
              </View>
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Created After</Text>
                <TouchableOpacity onPress={() => onOpenDatePicker("after")} className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3">
                  <Calendar size={20} color="#6B7280" />
                  <Text className={`flex-1 ml-3 ${searchParams.createdAfter ? "text-gray-800" : "text-gray-400"}`}>{searchParams.createdAfter || "Select date..."}</Text>
                  {searchParams.createdAfter && (
                    <TouchableOpacity onPress={() => onClearDate("after")}>
                      <X size={16} color="#6B7280" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Created Before</Text>
                <TouchableOpacity onPress={() => onOpenDatePicker("before")} className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3">
                  <Calendar size={20} color="#6B7280" />
                  <Text className={`flex-1 ml-3 ${searchParams.createdBefore ? "text-gray-800" : "text-gray-400"}`}>{searchParams.createdBefore || "Select date..."}</Text>
                  {searchParams.createdBefore && (
                    <TouchableOpacity onPress={() => onClearDate("before")}>
                      <X size={16} color="#6B7280" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-gray-200 py-4 rounded-xl">
              <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSearch} className="flex-1 bg-blue-600 py-4 rounded-xl flex-row items-center justify-center">
              <Search size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  </Modal>
);
const PersonCard = ({ person, onPress }: { person: Person; onPress: () => void }) => {
  const isPositiveBalance = person.totalBalance >= 0;
  return (
    <TouchableOpacity onPress={onPress} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm active:scale-[0.98]" activeOpacity={0.7}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Name Section */}
          <View className="flex-row items-center gap-2.5 mb-3">
            <View className="bg-blue-50 p-2 rounded-full">
              <User size={16} color="#2563EB" />
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

          {/* Balance - More Prominent */}
          <View className={`mt-1 p-3 rounded-xl ${isPositiveBalance ? "bg-green-50" : "bg-red-50"}`}>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-600 font-medium">Balance</Text>
              <Text className={`text-lg font-bold ${isPositiveBalance ? "text-green-700" : "text-red-700"}`}>
                {isPositiveBalance ? "+" : "-"}₹{Math.abs(person.totalBalance)}
              </Text>
            </View>
          </View>

          {/* Unsettled Dheetos Badge */}
          {person.unsettledDheetosCount > 0 && (
            <View className="mt-3 flex-row items-center">
              <View className="bg-orange-100 px-3 py-1.5 rounded-full">
                <Text className="text-xs text-orange-700 font-semibold">
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

const PaginationControls = ({ pagination, onPageChange }: { pagination: PaginationMeta; onPageChange: (page: number) => void }) => {
  if (pagination.totalPages <= 1) return null;
  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-4 mt-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrev}
          className={`flex-row items-center px-4 py-2 bg-gray-100 rounded-lg ${!pagination.hasPrev && "opacity-40"}`}
        >
          <ChevronLeft size={16} color="#374151" />
          <Text className="text-gray-700 font-medium ml-1">Prev</Text>
        </TouchableOpacity>
        <Text className="text-sm text-gray-600 font-medium">
          {pagination.currentPage} / {pagination.totalPages}
        </Text>
        <TouchableOpacity
          onPress={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNext}
          className={`flex-row items-center px-4 py-2 bg-gray-100 rounded-lg ${!pagination.hasNext && "opacity-40"}`}
        >
          <Text className="text-gray-700 font-medium mr-1">Next</Text>
          <ChevronRight size={16} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ListView = ({
  state,
  onRefresh,
  onPersonClick,
  onAdd,
  onSearch,
  onClear,
  onPageChange,
}: {
  state: ReturnType<typeof usePersonState>;
  onRefresh: () => void;
  onPersonClick: (person: Person) => void;
  onAdd: () => void;
  onSearch: () => void;
  onClear: () => void;
  onPageChange: (page: number) => void;
}) => (
  <View className="flex-1 bg-gray-50">
    <View className="p-4">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-2xl font-bold text-gray-800">{state.isSearchActive ? "Search Results" : "All Persons"}</Text>
          <Text className="text-sm text-gray-500 mt-1">{state.pagination.totalRecords} total</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={onSearch} className="p-3 bg-white border border-gray-300 rounded-xl shadow-sm">
            <Filter size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onAdd} className="flex-row items-center gap-2 bg-blue-600 px-4 py-3 rounded-xl shadow-sm">
            <Plus size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold">Add</Text>
          </TouchableOpacity>
        </View>
      </View>
      {state.isSearchActive && (
        <View className="bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg mb-3 flex-row items-center justify-between">
          <Text className="text-blue-800 font-medium text-sm">Search Active</Text>
          <TouchableOpacity onPress={onClear}>
            <Text className="text-blue-600 font-semibold text-sm">Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    {state.loading && !state.refreshing ? (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-500 mt-4">Loading...</Text>
      </View>
    ) : (
      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={state.refreshing} onRefresh={onRefresh} />}>
        <View className="px-4 pb-4">
          {state.persons.length === 0 ? (
            <View className="items-center py-12">
              <User size={64} color="#D1D5DB" />
              <Text className="text-gray-500 mt-4 text-center px-8">{state.isSearchActive ? "No matches" : "No persons. Add one!"}</Text>
            </View>
          ) : (
            <View className="space-y-3">
              {state.persons.map((person) => (
                <PersonCard key={person._id} person={person} onPress={() => onPersonClick(person)} />
              ))}
            </View>
          )}
          <PaginationControls pagination={state.pagination} onPageChange={onPageChange} />
        </View>
      </ScrollView>
    )}
  </View>
);

const AddView = ({ state, onSubmit, onClose }: { state: PersonState; onSubmit: () => void; onClose: () => void }) => (
  <View className="flex-1 bg-gray-50 p-4">
    <View className="flex-row justify-between mb-4">
      <Text className="text-xl font-bold text-gray-800">Add Person</Text>
      <TouchableOpacity onPress={onClose} className="p-2">
        <X size={24} color="#374151" />
      </TouchableOpacity>
    </View>
    <ScrollView className="space-y-4">
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-1">
          Name <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
          <User size={20} color="#6B7280" />
          <TextInput
            placeholder="Enter name"
            value={state.formData.name}
            onChangeText={(text) => state.setFormData({ ...state.formData, name: text })}
            className="flex-1 ml-2 text-gray-800"
          />
        </View>
      </View>
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-1">Phone</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
          <Phone size={20} color="#6B7280" />
          <TextInput
            placeholder="Enter phone (optional)"
            value={state.formData.phoneNo}
            onChangeText={(text) => state.setFormData({ ...state.formData, phoneNo: text })}
            keyboardType="phone-pad"
            className="flex-1 ml-2 text-gray-800"
          />
        </View>
      </View>
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-1">Description</Text>
        <View className="border border-gray-300 rounded-lg px-3 py-2">
          <TextInput
            placeholder="Enter description (optional)"
            value={state.formData.desc}
            onChangeText={(text) => state.setFormData({ ...state.formData, desc: text })}
            multiline
            numberOfLines={4}
            className="text-gray-800 min-h-[80px]"
          />
        </View>
      </View>
      <TouchableOpacity
        onPress={onSubmit}
        disabled={state.loading || !state.formData.name.trim()}
        className={`flex-row justify-center items-center py-3 rounded-lg ${state.loading || !state.formData.name.trim() ? "bg-blue-300" : "bg-blue-600"}`}
      >
        {state.loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Plus size={20} color="#FFFFFF" />
            <Text className="text-white font-medium ml-2">Add Person</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  </View>
);

// Main Component
export default function PersonPage() {
  const state = usePersonState();

  const loadPersons = async (page = 1) => {
    state.setLoading(true);
    try {
      const response = (await fetchAllPersons({ page: page.toString(), limit: "50" })) as GetAllPersonsResponse;
      if (!response.success) throw new Error(response.message || "Failed to load persons");
      state.setPersons(response.data);
      state.setPagination(response.pagination);
    } catch (err) {
      state.displayToast(err instanceof Error ? err.message : "Failed to load", "error");
    } finally {
      state.setLoading(false);
    }
  };

  const handleSearch = async () => {
    const hasParams = Object.values(state.searchParams).some((v) => v);
    if (!hasParams) return state.displayToast("Enter a search parameter", "error");
    state.setLoading(true);
    state.setShowSearch(false);
    try {
      const response = (await searchPersons(state.searchParams)) as SearchPersonResponse;
      if (!response.success) {
        throw new Error(response.message || "Search failed");
      }
      state.setPersons(response.data);
      state.setPagination(response.pagination);
      state.setIsSearchActive(true);
    } catch (err) {
      state.displayToast(err instanceof Error ? err.message : "Search failed", "error");
    } finally {
      state.setLoading(false);
    }
  };

  const clearSearch = () => {
    state.setSearchParams({
      name: "",
      phoneNo: "",
      createdAfter: "",
      createdBefore: "",
    });
    state.setIsSearchActive(false);
    loadPersons();
  };

  const handleAdd = async () => {
    if (!state.formData.name.trim()) return state.displayToast("Name required", "error");
    state.setLoading(true);
    try {
      await createPerson(state.formData);
      state.displayToast("Added successfully!", "success");
      state.setFormData({ name: "", phoneNo: "", desc: "" });
      loadPersons();
      state.setView("list");
    } catch (err) {
      state.displayToast(err instanceof Error ? err.message : "Add failed", "error");
    } finally {
      state.setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete?", "This can't be undone.", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          state.setLoading(true);
          try {
            await deletePerson(id);
            state.displayToast("Deleted!", "success");
            loadPersons(state.pagination.currentPage);
            if (state.selectedPerson?._id === id) {
              state.setSelectedPerson(null);
              state.setView("list");
            }
          } catch (err) {
            state.displayToast(err instanceof Error ? err.message : "Delete failed", "error");
          } finally {
            state.setLoading(false);
          }
        },
      },
    ]);
  };

  const handlePersonClick = async (person: Person) => {
    state.setLoading(true);
    try {
      const response = (await fetchPersonById(person._id)) as GetPersonResponse;
      if (!response.success) throw new Error(response.message || "Failed to fetch person details");
      state.setSelectedPerson(response.data);
      state.setView("detail");
    } catch (err) {
      state.displayToast(err instanceof Error ? err.message : "Failed to fetch details", "error");
    } finally {
      state.setLoading(false);
    }
  };

  const openDatePicker = (mode: "after" | "before") => {
    state.setDateMode(mode);
    const dateKey = mode === "after" ? "createdAfter" : "createdBefore";
    const existing = state.searchParams[dateKey];
    if (existing) {
      const parsedDate = new Date(existing);
      if (!isNaN(parsedDate.getTime())) state.setTempDate(parsedDate);
      else {
        state.displayToast("Invalid date in search parameters", "error");
        state.setTempDate(new Date());
      }
    } else state.setTempDate(new Date());
    state.setShowDatePicker(true);
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    state.setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      const dateKey = state.dateMode === "after" ? "createdAfter" : "createdBefore";
      state.setSearchParams((prev: SearchPersonQuery) => ({ ...prev, [dateKey]: dateString }));
    }
  };

  const clearDate = (mode: "after" | "before") => {
    const dateKey = mode === "after" ? "createdAfter" : "createdBefore";
    state.setSearchParams((prev) => ({ ...prev, [dateKey]: "" }));
  };

  const onRefresh = async () => {
    state.setRefreshing(true);
    if (state.isSearchActive) await handleSearch();
    else await loadPersons(state.pagination.currentPage);
    state.setRefreshing(false);
  };

  useEffect(() => {
    loadPersons();
  }, []);

  return (
    <View className="flex-1">
      {state.view === "list" && (
        <ListView
          state={state}
          onRefresh={onRefresh}
          onPersonClick={handlePersonClick}
          onAdd={() => state.setView("add")}
          onSearch={() => state.setShowSearch(true)}
          onClear={clearSearch}
          onPageChange={loadPersons}
        />
      )}
      {state.view === "add" && <AddView state={state} onSubmit={handleAdd} onClose={() => state.setView("list")} />}
      {state.view === "detail" && state.selectedPerson && (
        <PersonDetailPage
          person={state.selectedPerson}
          onBack={() => {
            state.setView("list");
            state.setSelectedPerson(null);
          }}
          onDelete={() => {
            if (state.selectedPerson) {
              Alert.alert("Delete Person", `Are you sure you want to delete ${state.selectedPerson.name}?`, [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    await handleDelete(state.selectedPerson!._id);
                    state.setView("list");
                    state.setSelectedPerson(null);
                  },
                },
              ]);
            }
          }}
        />
      )}
      <SearchModal
        visible={state.showSearch}
        onClose={() => state.setShowSearch(false)}
        searchParams={state.searchParams}
        setSearchParams={state.setSearchParams}
        onSearch={handleSearch}
        onOpenDatePicker={openDatePicker}
        onClearDate={clearDate}
      />
      {state.toast && <Toast toast={state.toast} />}
      {state.showDatePicker && <DateTimePicker value={state.tempDate} mode="date" display="default" onChange={handleDateChange} maximumDate={new Date()} />}
    </View>
  );
}
