import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Order } from "../types";

// Mock data - depois virá da API
const mockOrders: Order[] = [
  {
    id: "12345",
    items: [
      { id: 1, name: "Fettuccine Alfredo", price: 32.9, quantity: 1 },
      { id: 4, name: "Pão de Alho", price: 12.9, quantity: 2 },
    ],
    total: 58.7,
    status: "delivered",
    createdAt: new Date("2024-01-15"),
    deliveryAddress: "Rua das Massas, 123 - Centro",
    customerName: "João Silva",
    customerPhone: "(11) 99999-9999",
    paymentMethod: "pix",
  },
  {
    id: "12346",
    items: [{ id: 2, name: "Lasanha Bolonhesa", price: 38.5, quantity: 1 }],
    total: 43.5,
    status: "on_the_way",
    createdAt: new Date("2024-01-16"),
    deliveryAddress: "Av. Italiana, 456 - Jardins",
    customerName: "Maria Santos",
    customerPhone: "(11) 98888-8888",
    paymentMethod: "card",
  },
];

const OrdersScreen: React.FC = () => {
  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "preparing":
        return "Preparando";
      case "on_the_way":
        return "A Caminho";
      case "delivered":
        return "Entregue";
      case "canceled":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "preparing":
        return "#f39c12";
      case "on_the_way":
        return "#3498db";
      case "delivered":
        return "#2ecc71";
      case "canceled":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pedido #{item.id}</Text>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderItems}>
          {item.items.length} {item.items.length === 1 ? "item" : "itens"}
        </Text>
        <Text style={styles.orderTotal}>R$ {item.total.toFixed(2)}</Text>
      </View>

      <View style={styles.orderFooter}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        <Text style={styles.paymentMethod}>
          {item.paymentMethod === "pix" ? "PIX" : "Cartão"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Pedidos</Text>

      {mockOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
          <Text style={styles.emptySubtext}>
            Seus pedidos aparecerão aqui quando você fizer seu primeiro pedido.
          </Text>
        </View>
      ) : (
        <FlatList
          data={mockOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  ordersList: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderItems: {
    fontSize: 14,
    color: "#666",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  paymentMethod: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#666",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    color: "#999",
  },
});

export default OrdersScreen;
