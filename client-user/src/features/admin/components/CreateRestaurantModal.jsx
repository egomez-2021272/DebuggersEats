// client-user/src/features/admin/components/CreateRestaurantModal.jsx

import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image, Alert, Platform, Dimensions, KeyboardAvoidingView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";

const CATEGORIES = ["COMIDA_RAPIDA", "ITALIANA", "CHINA", "MEXICANA", "CAFETERIA"];
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.95;

// Convierte un string "HH:MM" a un objeto Date (con fecha de hoy, solo importa la hora)
const parseTimeString = (timeStr, fallbackHour, fallbackMinute) => {
  const d = new Date();
  if (timeStr && /^\d{1,2}:\d{2}$/.test(timeStr)) {
    const [h, m] = timeStr.split(":").map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(fallbackHour, fallbackMinute, 0, 0);
  }
  return d;
};

// Convierte un objeto Date a string "HH:MM"
const formatTimeString = (date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const CreateRestaurantModal = ({ visible, restaurant = null, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    category: "COMIDA_RAPIDA",
    capacity: "",
    businessHoursOpen: "",
    businessHoursClose: "",
    managerName: "",
    contactEmail: "",
    photo: null,
  });
  const [preview, setPreview] = useState(null);

  const [openTime, setOpenTime] = useState(() => parseTimeString(null, 8, 0));
  const [closeTime, setCloseTime] = useState(() => parseTimeString(null, 22, 0));
  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showClosePicker, setShowClosePicker] = useState(false);

  React.useEffect(() => {
    if (!visible) return;

    if (restaurant) {
      const openStr = restaurant.businessHours?.open || "";
      const closeStr = restaurant.businessHours?.close || "";
      setFormData({
        name: restaurant.name || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        category: restaurant.category || "COMIDA_RAPIDA",
        capacity: restaurant.capacity?.toString() || "",
        businessHoursOpen: openStr,
        businessHoursClose: closeStr,
        managerName: restaurant.contactInfo?.managerName || "",
        contactEmail: restaurant.contactInfo?.email || "",
        photo: null,
      });
      setOpenTime(parseTimeString(openStr, 8, 0));
      setCloseTime(parseTimeString(closeStr, 22, 0));
      setPreview(restaurant.photo || null);
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
        category: "COMIDA_RAPIDA",
        capacity: "",
        businessHoursOpen: "",
        businessHoursClose: "",
        managerName: "",
        contactEmail: "",
        photo: null,
      });
      setOpenTime(parseTimeString(null, 8, 0));
      setCloseTime(parseTimeString(null, 22, 0));
      setPreview(null);
    }
  }, [visible, restaurant]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenTimeChange = (event, time) => {
    if (Platform.OS === "android") setShowOpenPicker(false);
    if (event.type === "dismissed") return;
    if (time) {
      setOpenTime(time);
      handleChange("businessHoursOpen", formatTimeString(time));
    }
  };

  const handleCloseTimeChange = (event, time) => {
    if (Platform.OS === "android") setShowClosePicker(false);
    if (event.type === "dismissed") return;
    if (time) {
      setCloseTime(time);
      handleChange("businessHoursClose", formatTimeString(time));
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "El nombre del restaurante es obligatorio");
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert("Error", "La dirección es obligatoria");
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert("Error", "El teléfono es obligatorio");
      return;
    }
    if (!formData.capacity.trim()) {
      Alert.alert("Error", "La capacidad es obligatoria");
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("address", formData.address);
    payload.append("phone", formData.phone);
    payload.append("category", formData.category);
    payload.append("capacity", formData.capacity);
    payload.append("businessHoursOpen", formData.businessHoursOpen);
    payload.append("businessHoursClose", formData.businessHoursClose);
    payload.append("managerName", formData.managerName);
    payload.append("contactEmail", formData.contactEmail);
    if (formData.photo) {
      payload.append("photo", formData.photo);
    }

    onSubmit(payload, restaurant?._id);
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a la galería para seleccionar la foto");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.cancelled) {
      const localUri = result.assets?.[0]?.uri || result.uri;
      const filename = localUri.split('/').pop();
      const match = filename?.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
      const type = match ? `image/${match[1]}` : 'image';

      handleChange('photo', {
        uri: localUri,
        name: filename,
        type,
      });
      setPreview(localUri);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Card style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{restaurant ? "Editar Restaurante" : "Crear Restaurante"}</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <MaterialIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.photoUploadContainer}>
              <TouchableOpacity
                style={styles.photoUploadButton}
                onPress={handlePickPhoto}
                disabled={loading}
              >
                {preview ? (
                  <Image source={{ uri: preview }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <MaterialIcons name="add-a-photo" size={24} color={COLORS.textSecondary} />
                    <Text style={styles.photoPlaceholderText}>Subir foto</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre del restaurante</Text>
              <Input
                placeholder="Ej: Mi Restaurante"
                value={formData.name}
                onChangeText={(value) => handleChange("name", value)}
                editable={!loading}
              />
            </View>

            <View style={styles.formGroupRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Dirección</Text>
                <Input
                  placeholder="Ej: Calle Principal 123"
                  value={formData.address}
                  onChangeText={(value) => handleChange("address", value)}
                  editable={!loading}
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Teléfono</Text>
                <Input
                  placeholder="Ej: 2468-1234"
                  value={formData.phone}
                  onChangeText={(value) => handleChange("phone", value)}
                  editable={!loading}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Categoría</Text>
              <View style={styles.categoryWrap}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formData.category === category && styles.categoryButtonSelected,
                    ]}
                    onPress={() => handleChange("category", category)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        formData.category === category && styles.categoryButtonTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Capacidad</Text>
              <Input
                placeholder="Ej: 50"
                value={formData.capacity}
                onChangeText={(value) => handleChange("capacity", value)}
                editable={!loading}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroupRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Horario apertura</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => !loading && setShowOpenPicker(true)}
                  disabled={loading}
                >
                  <MaterialIcons name="access-time" size={18} color={COLORS.primary} />
                  <Text style={styles.pickerButtonText}>{formatTimeString(openTime)}</Text>
                </TouchableOpacity>
                {showOpenPicker && (
                  <DateTimePicker
                    value={openTime}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleOpenTimeChange}
                    is24Hour={true}
                    textColor={COLORS.text}
                  />
                )}
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Horario cierre</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => !loading && setShowClosePicker(true)}
                  disabled={loading}
                >
                  <MaterialIcons name="access-time" size={18} color={COLORS.primary} />
                  <Text style={styles.pickerButtonText}>{formatTimeString(closeTime)}</Text>
                </TouchableOpacity>
                {showClosePicker && (
                  <DateTimePicker
                    value={closeTime}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleCloseTimeChange}
                    is24Hour={true}
                    textColor={COLORS.text}
                  />
                )}
              </View>
            </View>

            <View style={styles.formGroupRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Encargado</Text>
                <Input
                  placeholder="Ej: Carlos Méndez"
                  value={formData.managerName}
                  onChangeText={(value) => handleChange("managerName", value)}
                  editable={!loading}
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Correo contacto</Text>
                <Input
                  placeholder="Ej: contacto@restaurante.com"
                  value={formData.contactEmail}
                  onChangeText={(value) => handleChange("contactEmail", value)}
                  editable={!loading}
                  keyboardType="email-address"
                />
              </View>
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
      </KeyboardAvoidingView>
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
    height: MODAL_HEIGHT,
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
    flex: 1,
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
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  categoryButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "500",
  },
  photoUploadContainer: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  photoUploadButton: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm,
  },
  formGroupRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  formHalf: {
    flex: 1,
  },
  categoryButtonTextSelected: {
    color: COLORS.text,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  pickerButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default CreateRestaurantModal;