// @shared navigation/AppNavigator.js — Main Route Registry
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { COLORS } from "../constants/colors";

// Screens
import LoginScreen from "../features/auth/screens/LoginScreen";
import HomeScreen from "../features/movie/screens/HomeScreen";
import MovieDetailScreen from "../features/movie/screens/MovieDetailScreen";
import MovieListScreen from "../features/movie/screens/MovieListScreen";
import ShowtimeListScreen from "../features/movie/screens/ShowtimeListScreen";
import TheaterListScreen from "../features/movie/screens/TheaterListScreen";
import SeatBookingScreen from "../features/ticket/screens/SeatBookingScreen";
import TicketDetailScreen from "../features/ticket/screens/TicketDetailScreen";
import TicketListScreen from "../features/ticket/screens/TicketListScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E1E26',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
          borderRadius: 0,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.light,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "bold" },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Movies")
            iconName = focused ? "film" : "film-outline";
          else if (route.name === "Theaters")
            iconName = focused ? "business" : "business-outline";
          else if (route.name === "Showtimes")
            iconName = focused ? "time" : "time-outline";
          else if (route.name === "Tickets")
            iconName = focused ? "ticket" : "ticket-outline";
          return <Ionicons name={iconName} size={size + 2} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Trang chủ" }}
      />
      <Tab.Screen
        name="Movies"
        component={MovieListScreen}
        options={{ title: "Phim" }}
      />
      <Tab.Screen
        name="Theaters"
        component={TheaterListScreen}
        options={{ title: "Rạp" }}
      />
      <Tab.Screen
        name="Showtimes"
        component={ShowtimeListScreen}
        options={{ title: "Lịch chiếu" }}
      />
      <Tab.Screen
        name="Tickets"
        component={TicketListScreen}
        options={{ title: "Vé" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
        <Stack.Screen name="SeatBooking" component={SeatBookingScreen} />
        <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
