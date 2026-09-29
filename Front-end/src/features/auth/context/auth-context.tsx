"use client";

import * as React from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuthSafe } from "@/lib/firebase/auth";
import type { UserProfile, UserRole } from "@/types";
import {
  signInCitizen,
  registerCitizen,
  signOutCitizen,
  fetchUserProfile,
  type LoginResult,
  type SignupResult,
} from "../services/auth-service";
import type { LoginFormData } from "../schemas/login-schema";
import type { SignupFormData } from "../schemas/signup-schema";

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<LoginResult>;
  signup: (data: SignupFormData) => Promise<SignupResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Subscribe to persistent Firebase Auth state changes
  React.useEffect(() => {
    const auth = getFirebaseAuthSafe();

    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            const userProfile = await fetchUserProfile(firebaseUser.uid);
            setProfile(userProfile);
          } catch (err) {
            console.error("[ResQEarth AuthContext] Error loading profile:", err);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("[ResQEarth AuthContext] Auth observer error:", error);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const refreshProfile = React.useCallback(async () => {
    if (!user) return;
    try {
      const updated = await fetchUserProfile(user.uid);
      if (updated) {
        setProfile(updated);
      }
    } catch (err) {
      console.error("[ResQEarth AuthContext] Error refreshing profile:", err);
    }
  }, [user]);

  const login = React.useCallback(
    async (data: LoginFormData): Promise<LoginResult> => {
      const result = await signInCitizen(data);
      if (result.success && result.user) {
        setUser(result.user);
        if (result.profile) {
          setProfile(result.profile);
        } else {
          const fetched = await fetchUserProfile(result.user.uid);
          setProfile(fetched);
        }
      }
      return result;
    },
    []
  );

  const signup = React.useCallback(
    async (data: SignupFormData): Promise<SignupResult> => {
      const result = await registerCitizen(data);
      if (result.success && result.user) {
        setUser(result.user);
        if (result.profile) {
          setProfile(result.profile);
        }
      }
      return result;
    },
    []
  );

  const logout = React.useCallback(async (): Promise<void> => {
    await signOutCitizen();
    setUser(null);
    setProfile(null);
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    role: profile?.role ?? (user ? "citizen" : null),
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    signup,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
