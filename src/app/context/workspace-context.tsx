"use client";

import React, {
   createContext,
   useContext,
   useState,
   useEffect,
   ReactNode,
} from "react";

export interface Business {
   id: string;
   name: string;
   initial: string;
   type: string;
   revenue: string;
   migrateFrom: string;
   website: string;
   createdAt: number;
}

interface WorkspaceContextType {
   mode: "personal" | "business";
   activeBusiness: Business | null;
   businesses: Business[];
   setMode: (mode: "personal" | "business") => void;
   setActiveBusiness: (biz: Business) => void;
   addBusiness: (
      biz: Omit<Business, "id" | "createdAt" | "initial">,
   ) => Business;
   resetToPersonal: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
   undefined,
);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({
   children,
}) => {
   const [mode, setMode] = useState<"personal" | "business">("personal");
   const [businesses, setBusinesses] = useState<Business[]>([]);
   const [activeBusiness, setActiveBusinessState] = useState<Business | null>(
      null,
   );
   const [mounted, setMounted] = useState(false);

   // Load from localStorage
   useEffect(() => {
      setMounted(true);
      try {
         const savedBusinesses = localStorage.getItem("businesses");
         const savedActive = localStorage.getItem("activeBusiness");
         const savedMode = localStorage.getItem("mode") as
            | "personal"
            | "business"
            | null;

         if (savedBusinesses) {
            const parsed = JSON.parse(savedBusinesses);
            setBusinesses(parsed);
         }
         if (savedActive) {
            const parsed = JSON.parse(savedActive);
            setActiveBusinessState(parsed);
         }
         if (savedMode) {
            setMode(savedMode);
         }
      } catch (e) {
         console.error("Failed to load workspace state", e);
      }
   }, []);

   // Persist to localStorage
   useEffect(() => {
      if (!mounted) return;
      localStorage.setItem("businesses", JSON.stringify(businesses));
      localStorage.setItem("activeBusiness", JSON.stringify(activeBusiness));
      localStorage.setItem("mode", mode);
   }, [businesses, activeBusiness, mode, mounted]);

   const setActiveBusiness = (biz: Business) => {
      setActiveBusinessState(biz);
      setMode("business");
   };

   const addBusiness = (
      data: Omit<Business, "id" | "createdAt" | "initial">,
   ): Business => {
      const initial = data.name.charAt(0).toUpperCase() || "B";
      const newBusiness: Business = {
         ...data,
         id: `biz-${Date.now()}`,
         initial,
         createdAt: Date.now(),
      };
      setBusinesses((prev) => [...prev, newBusiness]);
      setActiveBusinessState(newBusiness);
      setMode("business");
      return newBusiness;
   };

   const resetToPersonal = () => {
      setMode("personal");
      setActiveBusinessState(null);
   };

   return (
      <WorkspaceContext.Provider
         value={{
            mode,
            activeBusiness,
            businesses,
            setMode,
            setActiveBusiness,
            addBusiness,
            resetToPersonal,
         }}
      >
         {children}
      </WorkspaceContext.Provider>
   );
};

export const useWorkspace = () => {
   const ctx = useContext(WorkspaceContext);
   if (!ctx)
      throw new Error("useWorkspace must be used within WorkspaceProvider");
   return ctx;
};
