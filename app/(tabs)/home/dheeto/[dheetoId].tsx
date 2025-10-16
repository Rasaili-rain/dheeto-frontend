import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import DheetoDetailPage from "./dheeto-details";
import { Dheeto } from "@/lib/shared_types/db_types";
import { getDheetoById } from "@/lib/api/dheeto";

export default function DheetoDetail() {
  const { dheetoId } = useLocalSearchParams<{ dheetoId: string }>();
  const [dheeto, setDheeto] = useState<Dheeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDheeto = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDheetoById(dheetoId);
      if (response.success && response.data) {
        setDheeto(response.data);
      } else {
        setError("Failed to load dheeto");
      }
    } catch (err) {
      setError("An error occurred while loading dheeto");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dheetoId) {
      fetchDheeto();
    }
  }, [dheetoId]);

  const handleBack = () => {
    router.back();
  };

  const handleUpdate = () => {
    fetchDheeto(); // Refetch the dheeto data
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4">Loading dheeto details...</Text>
      </View>
    );
  }

  if (error || !dheeto) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-4">
        <Text className="text-red-600 text-lg font-semibold mb-2">Error</Text>
        <Text className="text-gray-600 text-center">{error || "Dheeto not found"}</Text>
      </View>
    );
  }

  return <DheetoDetailPage dheeto={dheeto} onBack={handleBack} onUpdate={handleUpdate} />;
}
