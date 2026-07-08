// client-user/src/features/admin/components/CreateUserModal.jsx

import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";

const ROLES = [
  { value: "ADMIN_ROLE", label: "Admin" },
  { value: "RES_ADMIN_ROLE", label: "Admin Restaurante" },
  { value: "USER_ROLE", label: "Usuario" },
];

const CreateUserModal = ({ visible, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    role: "USER_ROLE",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const USERNAME_REGEX = /^\S+$/;
  const PHONE_REGEX = /^[0-9]{8}$/;

  const handleSubmit = () => {
    const firstName = formData.firstName.trim();
    const surname = formData.surname.trim();
    const email = formData.email.trim();
    const username = formData.username.trim();
    const phone = formData.phone.trim();

    if (!firstName) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }
    if (firstName.length < 2) {
      Alert.alert("Error", "El nombre debe tener al menos 2 caracteres");
      return;
    }
    if (!NAME_REGEX.test(firstName)) {
      Alert.alert("Error", "El nombre solo puede contener letras");
      return;
    }
    if (!surname) {
      Alert.alert("Error", "El apellido es obligatorio");
      return;
    }
    if (surname.length < 2) {
      Alert.alert("Error", "El apellido debe tener al menos 2 caracteres");
      return;
    }
    if (!NAME_REGEX.test(surname)) {
      Alert.alert("Error", "El apellido solo puede contener letras");
      return;
    }
    if (!email) {
      Alert.alert("Error", "El email es obligatorio");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      Alert.alert("Error", "Email inválido");
      return;
    }
    if (!username) {
      Alert.alert("Error", "El usuario es obligatorio");
      return;
    }
    if (username.length < 3) {
      Alert.alert("Error", "El usuario debe tener al menos 3 caracteres");
      return;
    }
    if (!USERNAME_REGEX.test(username)) {
      Alert.alert("Error", "El usuario no puede contener espacios");
      return;
    }
    if (phone && !PHONE_REGEX.test(phone)) {
      Alert.alert("Error", "El teléfono debe tener 8 dígitos");
      return;
    }
    if (!formData.password.trim()) {
      Alert.alert("Error", "La contraseña es obligatoria");
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    onSubmit({
      ...formData,
      firstName,
      surname,
      email,
      username,
      phone: phone || undefined,
    });
    setFormData({
      firstName: "",
      surname: "",
      email: "",
      username: "",
      phone: "",
      password: "",
      role: "USER_ROLE",
    });
    setPasswordVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Card style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Crear Usuario</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <MaterialIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre</Text>
              <Input
                placeholder="Ej: Juan"
                value={formData.firstName}
                onChangeText={(value) => handleChange("firstName", value)}
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Apellido</Text>
              <Input
                placeholder="Ej: Pérez"
                value={formData.surname}
                onChangeText={(value) => handleChange("surname", value)}
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <Input
                placeholder="Ej: juan@email.com"
                value={formData.email}
                onChangeText={(value) => handleChange("email", value)}
                editable={!loading}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Usuario</Text>
              <Input
                placeholder="Ej: juanperez"
                value={formData.username}
                onChangeText={(value) => handleChange("username", value)}
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <Input
                placeholder="Ej: 12345678"
                value={formData.phone}
                onChangeText={(value) => handleChange("phone", value)}
                editable={!loading}
                keyboardType="phone-pad"
                maxLength={8}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordInputContainer}>
                <Input
                  placeholder="Ej: Segura123!"
                  value={formData.password}
                  onChangeText={(value) => handleChange("password", value)}
                  editable={!loading}
                  secureTextEntry={!passwordVisible}
                  style={{ flex: 1 }}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={styles.togglePasswordButton}
                  disabled={loading}
                >
                  <MaterialIcons
                    name={passwordVisible ? "visibility" : "visibility-off"}
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Rol</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rolesScroll}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.roleButton,
                      formData.role === role.value && styles.roleButtonSelected,
                    ]}
                    onPress={() => handleChange("role", role.value)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        formData.role === role.value && styles.roleButtonTextSelected,
                      ]}
                    >
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Button
              title="Cancelar"
              onPress={onClose}
              variant="secondary"
              disabled={loading}
              style={{ flex: 1 }}
            />
            <Button
              title="Crear"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={{ flex: 1, marginLeft: SPACING.md }}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  container: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
  content: {
    padding: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  togglePasswordButton: {
    paddingHorizontal: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
  },
  rolesScroll: {
    marginRight: -SPACING.lg,
    paddingRight: SPACING.lg,
  },
  roleButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  roleButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "500",
  },
  roleButtonTextSelected: {
    color: COLORS.text,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default CreateUserModal;