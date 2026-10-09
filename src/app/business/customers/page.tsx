"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
   Search,
   ChevronDown,
   Download,
   Settings2,
   Check,
   MessageCircle,
   Mail,
   UserPlus,
   UserCircle,
   Copy,
   Megaphone,
} from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import styles from "@/styles/pages/customers.module.css";

type Tab = "customers" | "memberships" | "people";

interface Customer {
   id: string;
   name: string;
   email: string;
   username: string;
   avatar: string;
   status: string;
   country: string;
   state: string;
   city: string;
   totalSpend: number;
   joinedAt: string;
   lastAccessed: string;
}

interface Membership {
   id: string;
   name: string;
   email: string;
   avatar: string;
   productName: string;
   status: "active" | "inactive";
   totalSpend: number;
   createdAt: string;
   canceledAt?: string;
   cancelReason: string;
}

interface Person {
   id: string;
   name: string;
   email: string;
   username: string;
   avatar: string;
   location: string;
   source: string;
   totalSpend: number;
   purchases: number;
   events: number;
   lastSeen: string;
}

type CustomerColumn =
   | "customer"
   | "email"
   | "status"
   | "country"
   | "state"
   | "city"
   | "platformDisputes"
   | "platformReviews"
   | "platformSpend"
   | "platformResolutions"
   | "totalSpend"
   | "joinedAt"
   | "lastAccessed"
   | "contact";

const ALL_CUSTOMER_COLUMNS: { id: CustomerColumn; label: string }[] = [
   { id: "customer", label: "Customer" },
   { id: "email", label: "Email" },
   { id: "status", label: "Status" },
   { id: "country", label: "Country" },
   { id: "state", label: "State" },
   { id: "city", label: "City" },
   { id: "platformDisputes", label: "Platform disputes" },
   { id: "platformReviews", label: "Platform reviews" },
   { id: "platformSpend", label: "Platform spend" },
   { id: "platformResolutions", label: "Platform resolutions" },
   { id: "totalSpend", label: "Total spend" },
   { id: "joinedAt", label: "Joined at" },
   { id: "lastAccessed", label: "Last accessed" },
   { id: "contact", label: "Contact" },
];

export default function CustomersPage() {
   const { activeBusiness } = useWorkspace();
   const [tab, setTab] = useState<Tab>("customers");
   const [search, setSearch] = useState("");
   const [loading, setLoading] = useState(true);

   // Customers
   const [customers, setCustomers] = useState<Customer[]>([]);
   const [visibleColumns, setVisibleColumns] = useState<CustomerColumn[]>(
      ALL_CUSTOMER_COLUMNS.map((c) => c.id),
   );
   const [showColumnPicker, setShowColumnPicker] = useState(false);
   const [columnSearch, setColumnSearch] = useState("");

   // Memberships
   const [memberships, setMemberships] = useState<Membership[]>([]);
   const [mStats, setMStats] = useState<Record<string, number>>({
      all: 0,
      active: 0,
      inactive: 0,
   });

   // People
   const [people, setPeople] = useState<Person[]>([]);

   // =========================================
   // Load data by tab
   // =========================================
   const load = useCallback(async () => {
      setLoading(true);
      try {
         const params = new URLSearchParams();
         if (activeBusiness?.id) params.set("businessId", activeBusiness.id);
         if (search) params.set("q", search);

         if (tab === "customers") {
            const res = await fetch(`/api/business/customers?${params}`);
            const data = await res.json();
            setCustomers(data.customers || []);
         } else if (tab === "memberships") {
            const res = await fetch(`/api/business/memberships?${params}`);
            const data = await res.json();
            setMemberships(data.memberships || []);
            setMStats(data.stats || { all: 0, active: 0, inactive: 0 });
         } else {
            const res = await fetch(`/api/business/people?${params}`);
            const data = await res.json();
            setPeople(data.people || []);
         }
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id, tab, search]);

   useEffect(() => {
      load();
   }, [load]);

   const isColumnVisible = (id: CustomerColumn) => visibleColumns.includes(id);
   const toggleColumn = (id: CustomerColumn) => {
      setVisibleColumns((prev) =>
         prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
   };

   const formatDate = (d: string) => {
      const diff = Date.now() - new Date(d).getTime();
      const min = Math.floor(diff / 60000);
      if (min < 1) return "just now";
      if (min < 60) return `${min} min ago`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
      const day = Math.floor(hr / 24);
      if (day < 30) return `${day} day${day > 1 ? "s" : ""} ago`;
      return new Date(d).toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
         year: "numeric",
      });
   };

   return (
      <div className={styles.page}>
         {/* Top Tabs */}
         <div className={styles.topTabs}>
            {(["customers", "memberships", "people"] as Tab[]).map((t) => (
               <button
                  key={t}
                  className={`${styles.topTab} ${tab === t ? styles.topTabActive : ""}`}
                  onClick={() => setTab(t)}
               >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
               </button>
            ))}
         </div>

         {/* =========================================
          CUSTOMERS TAB
          ========================================= */}
         {tab === "customers" && (
            <>
               <h1 className={styles.title}>Customers</h1>

               <div className={styles.filtersRow}>
                  <div className={styles.searchWrap}>
                     <Search size={16} />
                     <input
                        className={styles.searchInput}
                        placeholder="Search by name, username, or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                     />
                  </div>
                  <button className={styles.filterBtn}>
                     Status <ChevronDown size={14} />
                  </button>
                  <button className={styles.filterBtn}>
                     Date joined <ChevronDown size={14} />
                  </button>
                  <div className={styles.filtersRight}>
                     <button className={styles.filterBtn}>
                        <Download size={14} /> Export
                     </button>
                     <button
                        className={styles.iconBtn}
                        onClick={() => setShowColumnPicker((v) => !v)}
                     >
                        <Settings2 size={16} />
                     </button>
                  </div>
               </div>

               {loading ? (
                  <div className={styles.loading}>Loading...</div>
               ) : customers.length === 0 ? (
                  <div className={styles.empty}>No customers yet</div>
               ) : (
                  <div className={styles.tableWrap}>
                     <table className={styles.table}>
                        <thead>
                           <tr>
                              {isColumnVisible("customer") && <th>Customer</th>}
                              {isColumnVisible("email") && <th>Email</th>}
                              {isColumnVisible("status") && <th>Status</th>}
                              {isColumnVisible("country") && <th>Country</th>}
                              {isColumnVisible("state") && <th>State</th>}
                              {isColumnVisible("city") && <th>City</th>}
                              {isColumnVisible("totalSpend") && (
                                 <th>Total spend</th>
                              )}
                              {isColumnVisible("joinedAt") && (
                                 <th>
                                    Joined at <ChevronDown size={10} />
                                 </th>
                              )}
                              {isColumnVisible("lastAccessed") && (
                                 <th>Last accessed</th>
                              )}
                              {isColumnVisible("contact") && <th>Contact</th>}
                           </tr>
                        </thead>
                        <tbody>
                           {customers.map((c) => (
                              <tr key={c.id}>
                                 {isColumnVisible("customer") && (
                                    <td>
                                       <div className={styles.custCell}>
                                          <div className={styles.custAvatar}>
                                             {c.avatar || c.name[0]}
                                          </div>
                                          <span>{c.name}</span>
                                       </div>
                                    </td>
                                 )}
                                 {isColumnVisible("email") && (
                                    <td>{c.email}</td>
                                 )}
                                 {isColumnVisible("status") && (
                                    <td>
                                       <span
                                          className={`${styles.badge} ${styles[`badge_${c.status}`]}`}
                                       >
                                          {c.status} <Check size={11} />
                                       </span>
                                    </td>
                                 )}
                                 {isColumnVisible("country") && (
                                    <td>{c.country || "—"}</td>
                                 )}
                                 {isColumnVisible("state") && (
                                    <td>{c.state || "—"}</td>
                                 )}
                                 {isColumnVisible("city") && (
                                    <td>{c.city || "—"}</td>
                                 )}
                                 {isColumnVisible("totalSpend") && (
                                    <td>${c.totalSpend.toFixed(2)}</td>
                                 )}
                                 {isColumnVisible("joinedAt") && (
                                    <td>{formatDate(c.joinedAt)}</td>
                                 )}
                                 {isColumnVisible("lastAccessed") && (
                                    <td>{formatDate(c.lastAccessed)}</td>
                                 )}
                                 {isColumnVisible("contact") && (
                                    <td>
                                       <div className={styles.contactActions}>
                                          <button className={styles.contactBtn}>
                                             <MessageCircle size={14} />
                                          </button>
                                          <button className={styles.contactBtn}>
                                             <Mail size={14} />
                                          </button>
                                          <button className={styles.contactBtn}>
                                             <UserPlus size={14} />
                                          </button>
                                          <button className={styles.contactBtn}>
                                             <Copy size={14} />
                                          </button>
                                       </div>
                                    </td>
                                 )}
                              </tr>
                           ))}
                        </tbody>
                     </table>

                     <div className={styles.tableFooter}>
                        <span>
                           1-{customers.length} of {customers.length} results
                        </span>
                        <div className={styles.rowsPerPage}>
                           Rows per page
                           <select className={styles.rowsSelect}>
                              <option>20</option>
                              <option>50</option>
                              <option>100</option>
                           </select>
                        </div>
                     </div>
                  </div>
               )}

               {showColumnPicker && (
                  <div
                     className={styles.columnPicker}
                     onMouseLeave={() => setShowColumnPicker(false)}
                  >
                     <div className={styles.colSearch}>
                        <Search size={12} />
                        <input
                           placeholder="Search columns..."
                           value={columnSearch}
                           onChange={(e) => setColumnSearch(e.target.value)}
                        />
                     </div>

                     <div className={styles.colGroupLabel}>Fixed columns</div>
                     <label className={styles.colRow}>
                        <input type="checkbox" checked disabled />
                        <span>Customer</span>
                     </label>

                     <div className={styles.colGroupLabel}>
                        Available columns
                     </div>
                     <div className={styles.colList}>
                        {ALL_CUSTOMER_COLUMNS.filter(
                           (c) =>
                              c.id !== "customer" &&
                              c.label
                                 .toLowerCase()
                                 .includes(columnSearch.toLowerCase()),
                        ).map((c) => (
                           <label key={c.id} className={styles.colRow}>
                              <input
                                 type="checkbox"
                                 checked={isColumnVisible(c.id)}
                                 onChange={() => toggleColumn(c.id)}
                              />
                              <span>{c.label}</span>
                              <span className={styles.dragHandle}>⋮⋮</span>
                           </label>
                        ))}
                     </div>

                     <div className={styles.colFooter}>
                        <button
                           className={styles.colFooterBtn}
                           onClick={() =>
                              setVisibleColumns(
                                 ALL_CUSTOMER_COLUMNS.map((c) => c.id),
                              )
                           }
                        >
                           Select all
                        </button>
                        <button
                           className={styles.colFooterBtn}
                           onClick={() => setVisibleColumns(["customer"])}
                        >
                           Reset
                        </button>
                     </div>
                  </div>
               )}
            </>
         )}

         {/* =========================================
          MEMBERSHIPS TAB
          ========================================= */}
         {tab === "memberships" && (
            <>
               <h1 className={styles.title}>Memberships</h1>

               <div className={styles.statCards}>
                  <div
                     className={`${styles.statCard} ${styles.statCardActive}`}
                  >
                     <div className={styles.statLabel}>All</div>
                     <div className={styles.statValue}>{mStats.all || 0}</div>
                  </div>
                  <div className={styles.statCard}>
                     <div className={styles.statLabel}>Active</div>
                     <div className={styles.statValue}>
                        {mStats.active || 0}
                     </div>
                  </div>
                  <div className={styles.statCard}>
                     <div className={styles.statLabel}>Inactive</div>
                     <div className={styles.statValue}>
                        {mStats.inactive || 0}
                     </div>
                  </div>
               </div>

               <div className={styles.filtersRow}>
                  <button className={styles.filterBtn}>
                     Status <ChevronDown size={14} />
                  </button>
                  <button className={styles.filterBtn}>
                     Date joined <ChevronDown size={14} />
                  </button>
                  <div className={styles.filtersRight}>
                     <button className={styles.filterBtn}>
                        <Download size={14} /> Export
                     </button>
                     <button className={styles.iconBtn}>
                        <Settings2 size={16} />
                     </button>
                  </div>
               </div>

               {loading ? (
                  <div className={styles.loading}>Loading...</div>
               ) : memberships.length === 0 ? (
                  <div className={styles.emptyLarge}>
                     <div className={styles.emptyIconLarge}>📣</div>
                     <div className={styles.emptyTitle}>
                        Get your first customer
                     </div>
                     <div className={styles.emptySub}>
                        Share your checkout link to get your first customer!
                     </div>
                     <a href="/business/products" className={styles.emptyCta}>
                        Go to products
                     </a>
                  </div>
               ) : (
                  <div className={styles.tableWrap}>
                     <table className={styles.table}>
                        <thead>
                           <tr>
                              <th>Customer</th>
                              <th>Email</th>
                              <th>Product</th>
                              <th>Status</th>
                              <th>Total spend</th>
                              <th>
                                 Created <ChevronDown size={10} />
                              </th>
                              <th>Canceled</th>
                              <th>Cancel reason</th>
                           </tr>
                        </thead>
                        <tbody>
                           {memberships.map((m) => (
                              <tr key={m.id}>
                                 <td>
                                    <div className={styles.custCell}>
                                       <div className={styles.custAvatar}>
                                          {m.avatar || m.name[0]}
                                       </div>
                                       <span>{m.name}</span>
                                    </div>
                                 </td>
                                 <td>{m.email}</td>
                                 <td>{m.productName}</td>
                                 <td>
                                    <span
                                       className={`${styles.badge} ${styles[`badge_${m.status}`]}`}
                                    >
                                       {m.status}
                                    </span>
                                 </td>
                                 <td>${m.totalSpend.toFixed(2)}</td>
                                 <td>{formatDate(m.createdAt)}</td>
                                 <td>
                                    {m.canceledAt
                                       ? formatDate(m.canceledAt)
                                       : "—"}
                                 </td>
                                 <td>{m.cancelReason || "—"}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </>
         )}

         {/* =========================================
          PEOPLE TAB
          ========================================= */}
         {tab === "people" && (
            <>
               <h1 className={styles.title}>People</h1>

               <div className={styles.filtersRow}>
                  <div className={styles.searchWrap}>
                     <Search size={16} />
                     <input
                        className={styles.searchInput}
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                     />
                  </div>
                  <button className={styles.filterBtn}>
                     <Settings2 size={14} /> Filters
                  </button>
                  <button className={styles.filterBtn}>
                     Source <ChevronDown size={14} />
                  </button>
                  <button className={styles.filterBtn}>
                     Event <ChevronDown size={14} />
                  </button>
                  <button className={styles.filterBtn}>
                     UTM source <ChevronDown size={14} />
                  </button>
                  <button className={styles.filterBtn}>
                     Country <ChevronDown size={14} />
                  </button>
                  <div className={styles.filtersRight}>
                     <button className={styles.audienceBtn}>
                        Save as audience
                     </button>
                     <button className={styles.filterBtn}>
                        <Download size={14} /> Export
                     </button>
                     <button className={styles.iconBtn}>
                        <Settings2 size={16} />
                     </button>
                  </div>
               </div>

               {loading ? (
                  <div className={styles.loading}>Loading...</div>
               ) : people.length === 0 ? (
                  <div className={styles.empty}>No people yet</div>
               ) : (
                  <div className={styles.tableWrap}>
                     <table className={styles.table}>
                        <thead>
                           <tr>
                              <th>Person</th>
                              <th>Email</th>
                              <th>Location</th>
                              <th>Source</th>
                              <th>Total spend</th>
                              <th>Purchases</th>
                              <th>Events</th>
                              <th>
                                 Last seen <ChevronDown size={10} />
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {people.map((p) => (
                              <tr key={p.id}>
                                 <td>
                                    <div className={styles.custCell}>
                                       <div className={styles.custAvatar}>
                                          {p.avatar || p.name[0]}
                                       </div>
                                       <div>
                                          <div className={styles.personName}>
                                             {p.name}
                                          </div>
                                          <div className={styles.personHandle}>
                                             {p.username}
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td>{p.email}</td>
                                 <td>{p.location || "—"}</td>
                                 <td>
                                    <span className={styles.sourceBadge}>
                                       {p.source}
                                    </span>
                                 </td>
                                 <td>${p.totalSpend.toFixed(2)}</td>
                                 <td>{p.purchases}</td>
                                 <td>{p.events}</td>
                                 <td>{formatDate(p.lastSeen)}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </>
         )}
      </div>
   );
}
