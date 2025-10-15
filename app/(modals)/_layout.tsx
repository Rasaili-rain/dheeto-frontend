import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add-person"
        options={{
          title: "Add Person",
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="person-detail/[id]"
        options={{
          title: "Person Details",
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
