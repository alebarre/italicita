import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { User } from "../types";

// Mock user data
const mockUser: User = {
  id: "1",
  name: "João Silva",
  email: "joao.silva@email.com",
  phone: "(11) 99999-9999",
  address: "Rua das Massas, 123 - Centro, São Paulo - SP",
};

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User>(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(mockUser);

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
    Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      <View style={styles.profileCard}>
        <View style={styles.field}>
          <Text style={styles.label}>Nome</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedUser.name}
              onChangeText={(text) =>
                setEditedUser({ ...editedUser, name: text })
              }
              placeholder="Seu nome completo"
            />
          ) : (
            <Text style={styles.value}>{user.name}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>E-mail</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedUser.email}
              onChangeText={(text) =>
                setEditedUser({ ...editedUser, email: text })
              }
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.value}>{user.email}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Telefone</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedUser.phone}
              onChangeText={(text) =>
                setEditedUser({ ...editedUser, phone: text })
              }
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{user.phone}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Endereço</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedUser.address}
              onChangeText={(text) =>
                setEditedUser({ ...editedUser, address: text })
              }
              placeholder="Seu endereço completo"
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.value}>{user.address}</Text>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Editar Perfil</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Configurações</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Formas de Pagamento</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Endereços Salvos</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Notificações</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Ajuda & Suporte</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]}>
          <Text style={[styles.menuItemText, styles.logoutText]}>
            Sair da Conta
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  profileCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#e74c3c",
  },
  saveButton: {
    backgroundColor: "#2ecc71",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuSection: {
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 15,
    backgroundColor: "#f8f9fa",
    color: "#333",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  menuItemArrow: {
    fontSize: 18,
    color: "#999",
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#e74c3c",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
