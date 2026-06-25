import { useState } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { MaxContentWidth } from "@/constants/theme";
import {
  AuthButton,
  AuthColors,
  AuthTextField,
} from "@/features/auth/components/auth-ui";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";

type AuthMode = "login" | "signup";
const heroGradient = require("@/assets/images/login-hero-gradient.png");
const meetsWordmark = require("@/assets/images/meets-wordmark.svg");

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isLogin = mode === "login";

  function handleSubmit() {
    router.replace("/main");
  }

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.screen}>
        <View style={styles.heroFormStack}>
          <Image
            contentFit="cover"
            contentPosition={{ left: "58%", top: "54%" }}
            source={heroGradient}
            style={styles.heroBackdrop}
          />

          <View style={styles.hero}>
            <View style={styles.heroVignette} />

            <View style={styles.heroLogoWrap}>
              <Image
                contentFit="contain"
                source={meetsWordmark}
                style={styles.heroLogoAura}
              />
              <Image
                contentFit="contain"
                source={meetsWordmark}
                style={styles.heroLogo}
              />
            </View>
          </View>

          <View style={styles.formShell}>
            <View style={styles.formHeader}>
              <ThemedText type="subtitle" style={styles.formTitle}>
                {isLogin ? "Welcome back" : "Create account"}
              </ThemedText>
              {!isLogin ? (
                <Pressable
                  onPress={() => setMode("login")}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <ThemedText type="small" style={styles.backText}>
                    Back to login
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.fields}>
              {!isLogin ? (
                <InputRow
                  icon={{ ios: "person", android: "person", web: "person" }}
                  onChangeText={setName}
                  placeholder="Name"
                  returnKeyType="next"
                  textContentType="name"
                  value={name}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              ) : null}
              <InputRow
                icon={{ ios: "envelope", android: "email", web: "mail" }}
                onChangeText={setEmail}
                placeholder="Email"
                returnKeyType="next"
                textContentType="emailAddress"
                value={email}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                inputMode="email"
              />
              <InputRow
                icon={{ ios: "lock", android: "lock", web: "lock" }}
                onChangeText={setPassword}
                placeholder="Password"
                returnKeyType={isLogin ? "done" : "next"}
                secureTextEntry
                textContentType="password"
                value={password}
                autoCapitalize="none"
                autoComplete="password"
                onSubmitEditing={isLogin ? handleSubmit : undefined}
              />
              {!isLogin ? (
                <InputRow
                  icon={{ ios: "lock", android: "lock", web: "lock" }}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  returnKeyType="done"
                  secureTextEntry
                  textContentType="password"
                  value={confirmPassword}
                  autoCapitalize="none"
                  onSubmitEditing={handleSubmit}
                />
              ) : null}
            </View>

            {isLogin ? (
              <Pressable
                style={({ pressed }) => [
                  styles.forgotWrap,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText type="small" style={styles.forgotText}>
                  Forgot Password
                </ThemedText>
              </Pressable>
            ) : null}

            <AuthButton
              label={isLogin ? "Login" : "Sign Up"}
              onPress={handleSubmit}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <ThemedText type="small" style={styles.dividerText}>
                Or login with
              </ThemedText>
              <View style={styles.dividerLine} />
            </View>

            <SocialLoginButtons compact />

            <View style={styles.footerRow}>
              <ThemedText type="small" style={styles.footerText}>
                {isLogin ? "Don't have account?" : "Already have account?"}
              </ThemedText>
              <Pressable
                onPress={() => setMode(isLogin ? "signup" : "login")}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <ThemedText type="smallBold" style={styles.footerLink}>
                  {isLogin ? "Sign Up" : "Login"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function InputRow(
  props: React.ComponentProps<typeof AuthTextField> & {
    icon: React.ComponentProps<typeof SymbolView>["name"];
  },
) {
  const { icon, style, ...inputProps } = props;

  return (
    <View style={styles.inputRow}>
      <SymbolView name={icon} size={16} tintColor="#D0D0D0" weight="regular" />
      <AuthTextField {...inputProps} style={[styles.input, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#EEF1EF",
  },
  screen: {
    flexGrow: 1,
    width: "100%",
    maxWidth: Math.min(MaxContentWidth, 480),
    alignSelf: "center",
    backgroundColor: "#EEF1EF",
  },
  heroFormStack: {
    flex: 1,
    backgroundColor: "#EEF1EF",
    overflow: "hidden",
  },
  heroBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 420,
    width: "100%",
  },
  hero: {
    minHeight: 372,
    backgroundColor: "transparent",
    overflow: "hidden",
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 84,
  },
  heroVignette: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(255, 0, 40, 0.04)",
  },
  heroLogoWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 48,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  heroLogoAura: {
    position: "absolute",
    width: 410,
    height: 214,
    opacity: 0.28,
    transform: [{ rotate: "-8deg" }, { translateY: 4 }, { scale: 1.04 }],
  },
  heroLogo: {
    width: 394,
    height: 206,
    opacity: 0.98,
    transform: [{ rotate: "-8deg" }],
  },
  formShell: {
    marginTop: -44,
    flex: 1,
    backgroundColor: "#EEF1EF",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 32,
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 18,
  },
  formHeader: {
    gap: 6,
  },
  formTitle: {
    color: AuthColors.hero,
    fontSize: 32,
    lineHeight: 36,
  },
  formCaption: {
    color: "#727976",
    marginBottom: 4,
  },
  backText: {
    color: AuthColors.hero,
  },
  fields: {
    gap: 14,
  },
  inputRow: {
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingLeft: 18,
    paddingRight: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 54,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  forgotWrap: {
    alignSelf: "flex-end",
  },
  forgotText: {
    color: AuthColors.hero,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#D1D3D3",
  },
  dividerText: {
    color: "#9EA3A1",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  footerText: {
    color: "#8E9492",
  },
  footerLink: {
    color: AuthColors.hero,
  },
  pressed: {
    opacity: 0.76,
  },
});
