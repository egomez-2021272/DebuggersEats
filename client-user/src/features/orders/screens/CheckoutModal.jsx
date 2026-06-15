// client-user/src/features/orders/screens/CheckoutModal.jsx

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../../shared/store/authStore";
import { useOrders } from "../hooks/useOrders";
import { useCart } from "../hooks/useCart";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../../../shared/constants/theme";
import Button from "../../../shared/components/common/Button";
import Input from "../../../shared/components/common/Input";

const ADDRESS_TYPES = ["Casa", "Trabajo", "Otro"];
const PAYMENT_TYPES = ["Tarjeta", "Efectivo"];

const CheckoutModal = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { cart } = route.params || {};
  const user = useAuthStore((state) => state.user);
  const { confirmOrder, loading } = useOrders();
  const { clearCart } = useCart();
  const [selectedAddressType, setSelectedAddressType] = useState("Casa");
  const [selectedPaymentType, setSelectedPaymentType] = useState("Tarjeta");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      descripcion: "",
      referencias: "",
      telefono: user?.phone || "",
      notas: "",
    },
  });

  const onSubmit = async (data) => {
    if (!cart || cart.items?.length === 0) {
      Alert.alert("Error", "El carrito está vacío");
      return;
    }

    try {
      const orderBody = {
        restaurantId: cart.items[0]?.restaurantId,
        userId: user._id,
        items: cart.items,
        direccion: {
          tipo: selectedAddressType,
          descripcion: data.descripcion,
          referencias: data.referencias,
        },
        telefono: data.telefono,
        tipoPago: selectedPaymentType,
        notas: data.notas,
      };

      await confirmOrder(orderBody);
      await clearCart(user._id);

      Alert.alert(
        "¡Pedido realizado!",
        "Tu pedido ha sido confirmado. Recibirás una actualización pronto.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Pedidos" }],
              });
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert("Error", "No se pudo realizar el pedido");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirmar pedido</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Dirección de entrega</Text>

          <View style={styles.chipsContainer}>
            {ADDRESS_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, selectedAddressType === type && styles.chipSelected]}
                onPress={() => setSelectedAddressType(type)}
              >
                <Text style={[styles.chipText, selectedAddressType === type && styles.chipTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Descripción de dirección"
            control={control}
            name="descripcion"
            rules={{ required: "La dirección es requerida" }}
            error={errors.descripcion?.message}
            placeholder="Calle, número, colonia..."
          />

          <Input
            label="Referencias (opcional)"
            control={control}
            name="referencias"
            placeholder="Puntos de referencia..."
          />

          <Text style={styles.sectionTitle}>Información de contacto</Text>

          <Input
            label="Teléfono"
            control={control}
            name="telefono"
            rules={{ required: "El teléfono es requerido" }}
            error={errors.telefono?.message}
            placeholder="+52 123 456 7890"
            keyboardType="phone-pad"
          />

          <Text style={styles.sectionTitle}>Tipo de pago</Text>

          <View style={styles.chipsContainer}>
            {PAYMENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, selectedPaymentType === type && styles.chipSelected]}
                onPress={() => setSelectedPaymentType(type)}
              >
                <Text style={[styles.chipText, selectedPaymentType === type && styles.chipTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Notas adicionales (opcional)"
            control={control}
            name="notas"
            placeholder="Instrucciones especiales..."
            multiline
            numberOfLines={3}
          />

          {cart && cart.items && cart.items.length > 0 && (
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Tu pedido</Text>
              {cart.items.map((item, index) => (
                <View key={index} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.nombre}</Text>
                    <Text style={styles.cartItemQuantity}>x{item.cantidad}</Text>
                  </View>
                  <Text style={styles.cartItemPrice}>Q {item.subtotal}</Text>
                </View>
              ))}
              <View style={styles.summaryDivider} />
              <Text style={styles.summaryTitle}>Resumen del pedido</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>Q {cart.subtotal}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>IVA (12%)</Text>
                <Text style={styles.summaryValue}>Q {cart.iva}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>Q {cart.total}</Text>
              </View>
            </View>
          )}

          <Button
            title="Confirmar pedido"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
  closeButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  chipsContainer: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  chip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: COLORS.text,
  },
  summary: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    marginBottom: SPACING.md,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  cartItemQuantity: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
  },
  cartItemPrice: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
  totalValue: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
  },
  submitButton: {
    marginBottom: SPACING.xl,
  },
});

export default CheckoutModal;
