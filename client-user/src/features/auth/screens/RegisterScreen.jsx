// client-user/src/features/auth/screens/RegisterScreen.jsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../../shared/constants/theme";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";
import { useAuth } from "../hooks/useAuth";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { handleRegister, loading, error } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      surname: "",
      username: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const result = await handleRegister(data);
      if (result.success) {
        Alert.alert(
          "Registro exitoso",
          "Hemos enviado un correo de verificación a tu dirección de email. Por favor verifícalo antes de iniciar sesión.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } catch (err) {
      // Error ya manejado en useAuth
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Regístrate para comenzar</Text>

      <View style={styles.form}>
        <Input
          label="Nombre"
          control={control}
          name="firstName"
          rules={{ required: "El nombre es requerido" }}
          error={errors.firstName?.message}
          placeholder="Ingresa tu nombre"
          autoCapitalize="words"
        />

        <Input
          label="Apellido"
          control={control}
          name="surname"
          rules={{ required: "El apellido es requerido" }}
          error={errors.surname?.message}
          placeholder="Ingresa tu apellido"
          autoCapitalize="words"
        />

        <Input
          label="Usuario"
          control={control}
          name="username"
          rules={{ required: "El usuario es requerido" }}
          error={errors.username?.message}
          placeholder="Elige un nombre de usuario"
          autoCapitalize="none"
        />

        <Input
          label="Correo electrónico"
          control={control}
          name="email"
          rules={{
            required: "El correo es requerido",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Correo inválido",
            },
          }}
          error={errors.email?.message}
          placeholder="ejemplo@correo.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Contraseña"
          control={control}
          name="password"
          rules={{
            required: "La contraseña es requerida",
            minLength: {
              value: 6,
              message: "La contraseña debe tener al menos 6 caracteres",
            },
          }}
          error={errors.password?.message}
          placeholder="Crea una contraseña"
          secureTextEntry
        />

        <Input
          label="Teléfono (opcional)"
          control={control}
          name="phone"
          error={errors.phone?.message}
          placeholder="+52 123 456 7890"
          keyboardType="phone-pad"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          title="Registrarse"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.button}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
    marginTop: SPACING.xl,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xl,
  },
  form: {
    width: "100%",
  },
  button: {
    marginTop: SPACING.md,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.lg,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    textAlign: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
});

export default RegisterScreen;
