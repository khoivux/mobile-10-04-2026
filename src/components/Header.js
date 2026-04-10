import { useNavigation } from "@react-navigation/native";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { logoutAction, useApp } from "../context/AppContext";
import AuthController from "../features/auth/controllers/AuthController";

export default function Header({ title, subtitle, showBack = false }) {
  const navigation = useNavigation();
  const { state, dispatch } = useApp();
  const { user, isLoggedIn } = state;

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn muốn đăng xuất khỏi app?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý",
        style: "destructive",
        onPress: async () => {
          await AuthController.logout();
          dispatch(logoutAction());
        },
      },
    ]);
  };

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backCircle}>
            <Text style={styles.backIcon}></Text>
          </View>
          <Text style={styles.backText}>Trở lại</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.titleWrap}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate("Main", { screen: "Tickets" })}
        >
          <Text style={styles.cartIcon}>Vé</Text>
        </TouchableOpacity>

        {/* Avatar / Login */}
        {isLoggedIn ? (
          <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0) || "🎀"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginIcon}>Đăng nhập</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#0F1014',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: '#1F2833',
    paddingBottom: 15,
    marginBottom: 0,
  },
  titleWrap: { flex: 1, paddingRight: 10 },
  title: { fontSize: FONTS.sizes.xl, fontWeight: "900", color: COLORS.primary },
  subtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
    fontWeight: "500",
  },
  backBtn: { flexDirection: "row", alignItems: "center", flex: 1 },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  backIcon: { fontSize: 16, color: '#fff' },
  backText: {
    fontSize: FONTS.sizes.md,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  rightSection: { flexDirection: "row", alignItems: "center" },
  cartBtn: {
    marginRight: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  cartIcon: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarText: {
    color: '#000',
    fontWeight: "900",
    fontSize: FONTS.sizes.lg,
  },
  loginBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  loginIcon: { fontSize: 13, fontWeight: '900', color: '#000' },
});
