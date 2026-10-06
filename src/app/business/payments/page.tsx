"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
   Plus,
   Search,
   ChevronDown,
   Download,
   Settings2,
   MoreVertical,
   CreditCard,
   Copy,
   ExternalLink,
   Shield,
   BellRing,
   Activity,
} from "lucide-react";
import { useWorkspace } from "../../context/workspace-context";
import styles from "./payments.module.css";

type PaymentStatus =
   | "succeeded"
   | "needs_review"
   | "failed"
   | "pending"
   | "blocked"
   | "disputed"
   | "resolution";

interface Payment {
   id: string;
   amount: number;
   currency: string;
   status: PaymentStatus;
   product: string;
   plan: string;
   method: string;
   methodLast4?: string;
   email: string;
   customerName?: string;
   reason: string;
   promoCode: string;
   userAvatar?: string;
   refunded: boolean;
   createdAt: string;
}

const STATUS_TABS: { key: string; label: string }[] = [
   { key: "all", label: "All" },
   { key: "needs_review", label: "Needs review" },
   { key: "succeeded", label: "Succeeded" },
   { key: "resolution", label: "Open resolutions" },
   { key: "disputed", label: "Open disputes" },
   { key: "failed", label: "Failed" },
   { key: "pending", label: "Pending" },
   { key: "blocked", label: "Blocked" },
];

export default function PaymentsPage() {
   const router = useRouter();
   const { activeBusiness } = useWorkspace();
   const [tab, setTab] = useState("all");
   const [payments, setPayments] = useState<Payment[]>([]);
   const [stats, setStats] = useState<Record<string, number>>({});
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [showMenu, setShowMenu] = useState(false);

   const load = useCallback(async () => {
      setLoading(true);
      try {
         const params = new URLSearchParams();
         if (activeBusiness?.id) params.set("businessId", activeBusiness.id);
         if (tab !== "all") params.set("status", tab);
         if (search) params.set("q", search);

         const res = await fetch(`/api/business/payments?${params}`);
         const data = await res.json();
         setPayments(data.payments || []);
         setStats(data.stats || {});
      } catch {
         setPayments([]);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id, tab, search]);

   useEffect(() => {
      load();
   }, [load]);

   const formatCurrency = (amount: number, currency = "USD") =>
      new Intl.NumberFormat("en-US", {
         style: "currency",
         currency,
         minimumFractionDigits: 2,
      }).format(amount);

   const formatDate = (d: string) =>
      new Date(d).toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
         year: "numeric",
      });

   const copyPrompt = () => {
      navigator.clipboard.writeText(
         `Check out my product on Space-Ex: ${window.location.origin}/business/${activeBusiness?.id}`,
      );
   };

   return (
      <div className={styles.page}>
         {/* Header */}
         <div className={styles.header}>
            <h1 className={styles.title}>Payments</h1>
            <div className={styles.headerRight}>
               <button
                  className={styles.primaryBtn}
                  onClick={() => router.push("/business/checkout-links/new")}
               >
                  <Plus size={14} /> Accept a payment
               </button>
               <div className={styles.menuWrap}>
                  <button
                     className={styles.iconBtn}
                     onClick={() => setShowMenu((v) => !v)}
                  >
                     <MoreVertical size={16} />
                  </button>
                  {showMenu && (
                     <div
                        className={styles.menu}
                        onMouseLeave={() => setShowMenu(false)}
                     >
                        <button className={styles.menuItem}>
                           <BellRing size={14} /> Early dispute alerts
                        </button>
                        <button className={styles.menuItem}>
                           <Shield size={14} /> Payment rules
                        </button>
                        <button className={styles.menuItem}>
                           <Activity size={14} /> Payment health
                        </button>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Status Tabs */}
         <div className={styles.statusTabs}>
            {STATUS_TABS.map((t) => {
               const count = stats[t.key] || 0;
               const active = tab === t.key;
               return (
                  <button
                     key={t.key}
                     className={`${styles.statusTab} ${active ? styles.statusTabActive : ""}`}
                     onClick={() => setTab(t.key)}
                  >
                     <div className={styles.statusLabel}>{t.label}</div>
                     <div className={styles.statusCount}>{count}</div>
                  </button>
               );
            })}
         </div>

         {/* Filters */}
         <div className={styles.filtersRow}>
            <div className={styles.searchWrap}>
               <Search size={16} />
               <input
                  className={styles.searchInput}
                  placeholder="Search by name, email, or payment ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>

            <button className={styles.filterBtn}>
               Status <ChevronDown size={14} />
            </button>
            <button className={styles.filterBtn}>
               Method <ChevronDown size={14} />
            </button>
            <button className={styles.filterBtn}>
               Date <ChevronDown size={14} />
            </button>
            <button className={styles.filterBtn}>
               Reason <ChevronDown size={14} />
            </button>

            <div className={styles.filtersRight}>
               <button className={styles.filterBtn} onClick={() => {}}>
                  <Download size={14} /> Export
               </button>
               <button className={styles.iconBtn}>
                  <Settings2 size={16} />
               </button>
            </div>
         </div>

         {/* Table */}
         {loading ? (
            <div className={styles.loading}>Loading payments...</div>
         ) : payments.length === 0 ? (
            <div className={styles.emptyState}>
               <div className={styles.emptyIcon}>
                  <CreditCard size={48} strokeWidth={1.5} />
               </div>
               <div className={styles.emptyTitle}>No payments yet</div>
               <div className={styles.emptySub}>
                  No payments match your filters or no payments yet.
               </div>
               <div className={styles.emptyCta}>
                  <div className={styles.emptyCtaText}>
                     Collect payments via the API
                  </div>
                  <div className={styles.emptyCtaBtns}>
                     <button className={styles.emptyBtn} onClick={copyPrompt}>
                        <Copy size={14} /> Copy prompt
                     </button>
                     <button className={styles.emptyBtnSecondary}>
                        View docs
                     </button>
                  </div>
               </div>
            </div>
         ) : (
            <div className={styles.tableWrap}>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>
                           <input type="checkbox" />
                        </th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Product</th>
                        <th>Plan</th>
                        <th>Method</th>
                        <th>Email</th>
                        <th>Paid</th>
                        <th>Reason</th>
                        <th>User</th>
                        <th>Promo code</th>
                        <th>Created</th>
                     </tr>
                  </thead>
                  <tbody>
                     {payments.map((p) => (
                        <tr key={p.id}>
                           <td>
                              <input type="checkbox" />
                           </td>
                           <td className={styles.amountCell}>
                              {formatCurrency(p.amount, p.currency)}
                           </td>
                           <td>
                              <span
                                 className={`${styles.statusBadge} ${styles[`status_${p.status}`]}`}
                              >
                                 {p.status.replace("_", " ")}
                              </span>
                           </td>
                           <td>{p.product || "—"}</td>
                           <td>{p.plan}</td>
                           <td>
                              <span className={styles.methodCell}>
                                 <CreditCard size={12} /> {p.method}{" "}
                                 {p.methodLast4 ? `•••• ${p.methodLast4}` : ""}
                              </span>
                           </td>
                           <td className={styles.emailCell}>{p.email}</td>
                           <td>{formatDate(p.createdAt)}</td>
                           <td>{p.reason || "—"}</td>
                           <td>{p.userAvatar || "—"}</td>
                           <td>{p.promoCode || "—"}</td>
                           <td>{formatDate(p.createdAt)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
}
