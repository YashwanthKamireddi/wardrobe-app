import { create } from "zustand";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type InsertUser } from "@shared/schema";

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
  setUser: (user: User | null) => void;
}

// Create auth store using Zustand
const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));

// Common fetch configuration
const fetchConfig = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' }
};

// Hook for managing auth state and mutations
export function useAuth() {
  const queryClient = useQueryClient();
  const { user, setUser, isAuthenticated } = useAuthStore();

  // Query for current user
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    queryFn: async () => {
      const response = await fetch("/api/auth/me", { ...fetchConfig });
      if (!response.ok) throw new Error("Not authenticated");
      return response.json();
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await fetch("/api/auth/update", {
        ...fetchConfig,
        method: "PATCH",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.setQueryData(["/api/auth/me"], data);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        ...fetchConfig,
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.setQueryData(["/api/auth/me"], data);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: Omit<InsertUser, "password"> & { password: string }) => {
      const response = await fetch("/api/auth/register", {
        ...fetchConfig,
        method: "POST",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.setQueryData(["/api/auth/me"], data);
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        ...fetchConfig,
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to logout");
      return response.json();
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    },
  });

  return {
    user: currentUser || user,
    isLoading,
    isAuthenticated: !!currentUser || isAuthenticated,
    loginMutation,
    registerMutation,
    logoutMutation,
    updateUserMutation,
  };
}