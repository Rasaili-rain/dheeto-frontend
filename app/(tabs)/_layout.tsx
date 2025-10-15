import { TabBarIcon } from "@/lib/components/tabbar-icon";
import { Tabs } from "expo-router";

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
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} />,
        }}
      />
    </Tabs>
  );
}
