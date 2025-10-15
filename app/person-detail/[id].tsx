import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchPersonById, deletePerson } from "@/lib/api/person";
import { Person } from "@/lib/shared_types/db_types";
import { GetPersonResponse } from "@/lib/shared_types/person_types";
import Toast, { ToastType } from "@/lib/components/Toast";
import PersonDetailPage from "@/lib/pages/PersonDetailPage";

export default function PersonDetailRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: "",
    type: "success",
  });

  const displayToast = (message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const loadPerson = async () => {
    if (!id || typeof id !== "string") return;
    setLoading(true);
    try {
      const response = (await fetchPersonById(id)) as GetPersonResponse;
      if (!response.success) throw new Error(response.message || "Failed to fetch person details");
      setPerson(response.data);
    } catch (err) {
      displayToast(err instanceof Error ? err.message : "Failed to fetch details", "error");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!person) return;

    Alert.alert("Delete Person", `Are you sure you want to delete ${person.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deletePerson(person._id);
            displayToast("Deleted successfully!", "success");
            router.back();
          } catch (err) {
            displayToast(err instanceof Error ? err.message : "Delete failed", "error");
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-gray-500 mt-4">Loading...</Text>
      </View>
    );
  }

  if (!person) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <Text className="text-gray-500">Person not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-indigo-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <PersonDetailPage person={person} onBack={() => router.back()} onDelete={handleDelete} />
      {toast && <Toast toast={toast} />}
    </>
  );
}
