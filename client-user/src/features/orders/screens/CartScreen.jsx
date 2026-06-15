// client-user/src/features/orders/screens/CartScreen.jsx

import React, { useCallback, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../../shared/store/authStore";
import { useCart } from "../hooks/useCart";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "../../../shared/constants/theme";
import { Card, EmptyState } from "../../../shared/components/common/Common";
import Button from "../../../shared/components/common/Button";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
  <Card style={styles.cartItem}>
    {item.photo ? (
      <Image source={{ uri: item.photo }} style={styles.itemImage} />
    ) : (
      <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
        <MaterialIcons name="restaurant-menu" size={32} color={COLORS.textMuted} />
      </View>
    )}
    <View style={styles.itemContent}>
      <Text style={styles.itemName}>{item.nombre}</Text>
      <Text style={styles.itemPrice}>Q {item.precio}</Text>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.menuItemId, item.cantidad - 1)}
        >
          <MaterialIcons name="remove" size={18} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.cantidad}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.menuItemId, item.cantidad + 1)}
        >
          <MaterialIcons name="add" size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <Text style={styles.itemSubtotal}>Subtotal: Q {item.subtotal}</Text>
      <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(item.menuItemId)}>
        <MaterialIcons name="delete" size={18} color={COLORS.error} />
        <Text style={styles.removeButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  </Card>
);

const CartScreen = () => {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const { cart, cartCount, loading, error, fetchCart, updateCartItem, removeCartItem } = useCart();

  useEffect(() => {
    if (user?._id) {
      fetchCart(user._id);
    }
  }, [user, fetchCart]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: `Carrito (${cartCount})`,
    });
  }, [navigation, cartCount]);

  const handleUpdateQuantity = async (menuItemId, cantidad) => {
    if (cantidad < 1) {
      Alert.alert("Cantidad mínima", "La cantidad mínima es 1");
      return;
    }
    try {
      await updateCartItem(user._id, menuItemId, cantidad);
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar la cantidad");
    }
  };

  const handleRemove = async (menuItemId) => {
    Alert.alert(
      "Eliminar ítem",
      "¿Estás seguro de que deseas eliminar este ítem del carrito?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await removeCartItem(user._id, menuItemId);
            } catch (err) {
              Alert.alert("Error", "No se pudo eliminar el ítem");
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    navigation.navigate("CheckoutModal", { cart });
  };

  if (cart.items?.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="shopping-cart"
          title="Carrito vacío"
          subtitle="Agrega items del menú para comenzar"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {cart.items.map((item, index) => (
            <CartItem
              key={index}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Card style={styles.summaryCard}>
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
        </Card>
        <Button
          title="Proceder al pago"
          onPress={handleCheckout}
          style={styles.checkoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
  },
  cartItem: {
    flexDirection: "row",
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  itemImage: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  itemImagePlaceholder: {
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
    padding: SPACING.md,
    marginLeft: SPACING.md,
  },
  itemName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  quantityButton: {
    backgroundColor: COLORS.surface,
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    marginHorizontal: SPACING.md,
  },
  itemSubtotal: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginLeft: SPACING.xs,
  },
  footer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.xl,
  },
  summaryCard: {
    marginBottom: SPACING.md,
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
  checkoutButton: {
    marginBottom: SPACING.xs,
  },
});

export default CartScreen;
