import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { PaginationMeta } from "../types";

interface PaginationControlsProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({ pagination, onPageChange }: PaginationControlsProps) => {
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

export default PaginationControls;
