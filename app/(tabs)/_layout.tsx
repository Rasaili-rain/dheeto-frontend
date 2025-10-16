// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { TabBarIcon } from "@/lib/components/tabbar-icon";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: "hsl(215.4 16.3% 46.9%)",
        tabBarStyle: {
          backgroundColor: "hsl(0 0% 100%)",
          borderTopColor: "hsl(214.3 31.8% 91.4%)",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
    </Tabs>
  );
}
