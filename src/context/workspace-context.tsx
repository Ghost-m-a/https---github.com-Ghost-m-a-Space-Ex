"use client";

import React, {
   createContext,
   useContext,
   useState,
   useEffect,
   useCallback,
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
   createdAt: string | number;
}

interface WorkspaceContextType {
   mode: "personal" | "business";
   activeBusiness: Business | null;
   businesses: Business[];
   isLoading: boolean;
   setMode: (mode: "personal" | "business") => void;
   setActiveBusiness: (biz: Business) => void;
   addBusiness: (biz: {
      name: string;
      type: string;
      revenue: string;
      migrateFrom: string;
      website: string;
   }) => Promise<Business | null>;
   resetToPersonal: () => void;
   refreshBusinesses: () => Promise<void>;
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
   const [isLoading, setIsLoading] = useState(true);
   const [mounted, setMounted] = useState(false);

   // Load businesses from MongoDB
   const refreshBusinesses = useCallback(async () => {
      try {
         const res = await fetch("/api/business");
         const data = await res.json();
         const list: Business[] = data.businesses || [];
         setBusinesses(list);

         // Restore active business from localStorage
         const savedActiveId = localStorage.getItem("activeBusinessId");
         if (savedActiveId) {
            const found = list.find((b) => b.id === savedActiveId);
            if (found) setActiveBusinessState(found);
         }

         // Restore mode
         const savedMode = localStorage.getItem("workspaceMode") as
            | "personal"
            | "business"
            | null;
         if (savedMode) setMode(savedMode);
      } catch (err) {
         console.error("[Workspace] Failed to load businesses:", err);
      }
   }, []);

   // On mount
   useEffect(() => {
      setMounted(true);
      refreshBusinesses().finally(() => setIsLoading(false));
   }, [refreshBusinesses]);

   // Persist mode
   useEffect(() => {
      if (mounted) localStorage.setItem("workspaceMode", mode);
   }, [mode, mounted]);

   // Persist active business
   useEffect(() => {
      if (!mounted) return;
      if (activeBusiness) {
         localStorage.setItem("activeBusinessId", activeBusiness.id);
      } else {
         localStorage.removeItem("activeBusinessId");
      }
   }, [activeBusiness, mounted]);

   const setActiveBusiness = (biz: Business) => {
      setActiveBusinessState(biz);
      setMode("business");
   };

   const addBusiness = async (data: {
      name: string;
      type: string;
      revenue: string;
      migrateFrom: string;
      website: string;
   }): Promise<Business | null> => {
      try {
         const res = await fetch("/api/business", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
         });

         if (!res.ok) {
            const err = await res.json();
            console.error("[Workspace] Create failed:", err);
            return null;
         }

         const result = await res.json();
         const newBiz: Business = result.business;

         setBusinesses((prev) => [...prev, newBiz]);
         setActiveBusinessState(newBiz);
         setMode("business");

         return newBiz;
      } catch (err) {
         console.error("[Workspace] addBusiness error:", err);
         return null;
      }
   };

   const resetToPersonal = () => {
      setMode("personal");
   };

   return (
      <WorkspaceContext.Provider
         value={{
            mode,
            activeBusiness,
            businesses,
            isLoading,
            setMode,
            setActiveBusiness,
            addBusiness,
            resetToPersonal,
            refreshBusinesses,
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
