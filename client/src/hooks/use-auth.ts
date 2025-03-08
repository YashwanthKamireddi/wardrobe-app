import { create } from "zustand";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  profilePicture?: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create auth store using Zustand
const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const user = await response.json();
        set({ user, isAuthenticated: true });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        set({ user: null, isAuthenticated: false });
      } else {
        throw new Error("Logout failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
      throw error;
    }
  },
}));

// Hook for managing auth state and mutations
export function useAuth() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  // Query for current user
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Mutation for updating user
  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await fetch("/api/auth/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
  });

  // Mutation for logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to logout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/auth";
    },
  });

  return {
    user: user || authStore.user,
    isLoading,
    isAuthenticated: !!user || authStore.isAuthenticated,
    updateUserMutation,
    logoutMutation,
    login: authStore.login,
    logout: authStore.logout,
  };
}