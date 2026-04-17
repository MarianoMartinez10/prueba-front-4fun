"use client";

/**
 * Capa de Lógica Reutilizable: Orquestador de Cuenta (Account ViewModel)
 * --------------------------------------------------------------------------
 * Centraliza toda la lógica de gestión de identidad, órdenes transaccionales,
 * edición de perfil y seguridad. Implementa validaciones, manejo de errores
 * y sincronización bidireccional con el API.
 * (MVC / ViewModel)
 */

import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import type { Order } from "@/lib/types";

interface AccountState {
  // Órdenes
  orders: Order[];
  loadingOrders: boolean;
  
  // Perfil
  editName: string;
  editPhone: string;
  editAddress: string;
  savingProfile: boolean;
  
  // Avatar
  uploadingAvatar: boolean;
  
  // Contraseña
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  changingPassword: boolean;

  // Marketplace (Becoming Seller)
  storeName: string;
  storeDescription: string;
  bankAccount: string;
  taxId: string;
  becomingSeller: boolean;
  ordersPage: number;
  ordersTotalPages: number;
  totalOrders: number;
  resendingVerification: boolean;
}

interface AccountActions {
  // Órdenes
  refreshOrders: () => Promise<void>;
  
  // Perfil
  updateEditName: (value: string) => void;
  updateEditPhone: (value: string) => void;
  updateEditAddress: (value: string) => void;
  saveProfile: () => Promise<void>;
  
  // Avatar
  handleAvatarUpload: (file: File) => Promise<void>;
  handleRemoveAvatar: () => Promise<void>;
  
  // Contraseña
  updateCurrentPassword: (value: string) => void;
  updateNewPassword: (value: string) => void;
  updateConfirmPassword: (value: string) => void;
  changePassword: () => Promise<void>;
  resetPasswordFields: () => void;

  // Marketplace
  updateStoreName: (value: string) => void;
  updateStoreDescription: (value: string) => void;
  updateBankAccount: (value: string) => void;
  updateTaxId: (value: string) => void;
  becomeSeller: (fastTrack?: boolean) => Promise<void>;
  changeOrdersPage: (page: number) => Promise<void>;
  resendVerification: () => Promise<void>;
}

export function useAccountViewModel() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const router = useRouter();

  // Estado
  const [state, setState] = useState<AccountState>({
    orders: [],
    loadingOrders: true,
    editName: "",
    editPhone: "",
    editAddress: "",
    savingProfile: false,
    uploadingAvatar: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    changingPassword: false,
    storeName: "",
    storeDescription: "",
    bankAccount: "",
    taxId: "",
    becomingSeller: false,
    ordersPage: 1,
    ordersTotalPages: 1,
    totalOrders: 0,
    resendingVerification: false,
  });

  /**
   * RN - Guarda de Navegación: Redirección automática sin sesión.
   */
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  /**
   * RN - Hidratación de Perfil: Cargar datos iniciales del usuario.
   */
  useEffect(() => {
    if (user) {
      setState((prev) => ({
        ...prev,
        editName: user.name || "",
        editPhone: user.phone || "",
        editAddress: user.address || "",
      }));
    }
  }, [user]);

  /**
   * RN - Sincronización de Órdenes: Recupera el historial transaccional.
   */
  useEffect(() => {
    loadOrders(1);
  }, [user]);

  const loadOrders = async (page: number) => {
    if (!user) return;
    setState((prev) => ({ ...prev, loadingOrders: true }));
    try {
      const res = await ApiClient.getMyOrders({ page, limit: 5 }) as any;
      
      // 1. Si el servidor respondió con metadatos de paginación (Backend actualizado)
      if (res.totalPages !== undefined) {
        // Refuerzo: Incluso si el servidor enviara más de 5, nosotros mostramos solo 5
        const serverOrders = res.orders || [];
        setState((prev) => ({ 
          ...prev, 
          orders: serverOrders.slice(0, 5), 
          ordersPage: res.page || page,
          ordersTotalPages: res.totalPages,
          totalOrders: res.total,
          loadingOrders: false
        }));
      } else {
        // 2. Fallback: Paginación en memoria (Si el Backend aún envía toda la lista porque no se reinició)
        const allOrders = Array.isArray(res) ? res : (res.orders || []);
        const limit = 5;
        const total = allOrders.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const safePage = Math.max(1, Math.min(page, totalPages));
        
        const start = (safePage - 1) * limit;
        const paginatedOrders = allOrders.slice(start, start + limit);

        setState((prev) => ({
          ...prev,
          orders: paginatedOrders,
          ordersPage: safePage,
          ordersTotalPages: totalPages,
          totalOrders: total,
          loadingOrders: false
        }));
      }
    } catch (error) {
      console.error("[Account ViewModel] Error loading orders:", error);
      setState((prev) => ({ ...prev, loadingOrders: false }));
    }
  };

  const changeOrdersPage = async (page: number) => {
    await loadOrders(page);
  };

  // ==================== ACCIONES ====================

  /**
   * RN - Recarga de Órdenes: Fuerza sincronización con API.
   */
  const refreshOrders = async () => {
    await loadOrders(state.ordersPage);
  };

  /**
   * RN - Actualización de Campos de Perfil.
   */
  const updateEditName = (value: string) => {
    setState((prev) => ({ ...prev, editName: value }));
  };

  const updateEditPhone = (value: string) => {
    setState((prev) => ({ ...prev, editPhone: value }));
  };

  const updateEditAddress = (value: string) => {
    setState((prev) => ({ ...prev, editAddress: value }));
  };

  /**
   * RN - Persistencia de Perfil: Validación y guardado en API.
   */
  const saveProfile = async () => {
    if (!state.editName.trim()) {
      throw new Error("El campo nominal es obligatorio.");
    }

    setState((prev) => ({ ...prev, savingProfile: true }));
    try {
      await ApiClient.updateProfile({
        name: state.editName.trim(),
        phone: state.editPhone.trim() || null,
        address: state.editAddress.trim() || null,
      });
      await refreshUser();
    } catch (error) {
      console.error("[Account ViewModel] Error saving profile:", error);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, savingProfile: false }));
    }
  };

  /**
   * RN - Carga de Avatar: Validación y sincronización con CDN.
   */
  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Formato de imagen no soportado.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("El activo supera el límite de 5MB.");
    }

    setState((prev) => ({ ...prev, uploadingAvatar: true }));
    try {
      const imageUrl = await ApiClient.uploadImage(file);
      await ApiClient.updateProfile({ avatar: imageUrl });
      await refreshUser();
    } catch (error) {
      console.error("[Account ViewModel] Error uploading avatar:", error);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, uploadingAvatar: false }));
    }
  };

  /**
   * RN - Remoción de Avatar: Purga del activo multimedia.
   */
  const handleRemoveAvatar = async () => {
    setState((prev) => ({ ...prev, uploadingAvatar: true }));
    try {
      await ApiClient.updateProfile({ avatar: null });
      await refreshUser();
    } catch (error) {
      console.error("[Account ViewModel] Error removing avatar:", error);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, uploadingAvatar: false }));
    }
  };

  /**
   * RN - Actualización de Campos de Contraseña.
   */
  const updateCurrentPassword = (value: string) => {
    setState((prev) => ({ ...prev, currentPassword: value }));
  };

  const updateNewPassword = (value: string) => {
    setState((prev) => ({ ...prev, newPassword: value }));
  };

  const updateConfirmPassword = (value: string) => {
    setState((prev) => ({ ...prev, confirmPassword: value }));
  };

  /**
   * RN - Seguridad Criptográfica: Validación y mutación de credenciales.
   */
  const changePassword = async () => {
    if (!state.currentPassword || !state.newPassword) {
      throw new Error("Especifique las credenciales solicitadas.");
    }
    if (state.newPassword.length < 6) {
      throw new Error("La nueva contraseña debe poseer al menos 6 caracteres.");
    }
    if (state.newPassword !== state.confirmPassword) {
      throw new Error("La validación de contraseña no coincide.");
    }

    setState((prev) => ({ ...prev, changingPassword: true }));
    try {
      const res = await ApiClient.changePassword({
        currentPassword: state.currentPassword,
        newPassword: state.newPassword,
      });
      resetPasswordFields();
      return res.message || "Credenciales actualizadas correctamente.";
    } catch (error) {
      console.error("[Account ViewModel] Error changing password:", error);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, changingPassword: false }));
    }
  };

  /**
   * RN - Limpieza de Campos: Resetea los campos de contraseña.
   */
  const resetPasswordFields = () => {
    setState((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };
  
  /**
   * RN - Marketplace: Transforma al usuario en Vendedor.
   */
  const updateStoreName = (value: string) => setState(prev => ({ ...prev, storeName: value }));
  const updateStoreDescription = (value: string) => setState(prev => ({ ...prev, storeDescription: value }));
  const updateBankAccount = (value: string) => setState(prev => ({ ...prev, bankAccount: value }));
  const updateTaxId = (value: string) => setState(prev => ({ ...prev, taxId: value }));

  const becomeSeller = async (fastTrack = false) => {
    // Si es fastTrack y no hay nombre, usamos el nombre del usuario
    const finalStoreName = fastTrack && !state.storeName.trim() 
      ? `Vendedor: ${user?.name || 'Vendedor'}`
      : state.storeName.trim();

    if (!finalStoreName && !fastTrack) throw new Error("El nombre de la tienda es obligatorio.");
    
    setState(prev => ({ ...prev, becomingSeller: true }));
    try {
      const res = await ApiClient.becomeSeller({
        storeName: finalStoreName,
        storeDescription: state.storeDescription.trim() || "Perfil de venta en 4Fun",
        bankAccount: state.bankAccount.trim(),
        taxId: state.taxId.trim(),
      });
      
      await refreshUser(); // Sincronizamos el nuevo rol y perfil
      
      // Si fue exitoso, redirigimos a la creación de producto para que sea fluido
      router.push("/seller/products/new");
      
      return res.message;
    } catch (error) {
      console.error("[Account ViewModel] Error becoming seller:", error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, becomingSeller: false }));
    }
  };

  const resendVerification = async () => {
    if (!user?.email) return;
    setState(prev => ({ ...prev, resendingVerification: true }));
    try {
      await ApiClient.resendVerification(user.email);
    } catch (error) {
      console.error("[Account ViewModel] Error resending verification:", error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, resendingVerification: false }));
    }
  };

  // ==================== RETORNO ====================

  return {
    // Estado
    ...state,
    
    // Flags
    isLoading: authLoading,
    user,
    
    // Acciones
    refreshOrders,
    updateEditName,
    updateEditPhone,
    updateEditAddress,
    saveProfile,
    handleAvatarUpload,
    handleRemoveAvatar,
    updateCurrentPassword,
    updateNewPassword,
    updateConfirmPassword,
    changePassword,
    resetPasswordFields,
    updateStoreName,
    updateStoreDescription,
    updateBankAccount,
    updateTaxId,
    becomeSeller,
    changeOrdersPage,
    resendVerification,
  };
}
