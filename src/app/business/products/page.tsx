"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
   Plus,
   Download,
   Settings2,
   ChevronDown,
   X,
   Search,
   ChevronLeft,
   ChevronRight,
   ArrowUpDown,
   Store,
} from "lucide-react";
import { useWorkspace } from "../../context/workspace-context";
import styles from "./products.module.css";

interface ProductRow {
   id: string;
   name: string;
   slug: string;
   price: number;
   currency: string;
   accessType: "free" | "paid";
   visibility: "visible" | "hidden" | "archived";
   discoverStatus: "listed" | "unlisted";
   includedApps: string[];
   stats: {
      allTimeRevenue: number;
      activeUsers: number;
      checkoutConversion: number;
      totalSales: number;
   };
}

type ColumnId =
   | "name"
   | "price"
   | "visibility"
   | "discoverStatus"
   | "includedApps"
   | "checkoutConversion"
   | "allTimeRevenue"
   | "activeUsers";

const ALL_COLUMNS: { id: ColumnId; label: string }[] = [
   { id: "name", label: "Name" },
   { id: "price", label: "Price" },
   { id: "visibility", label: "Visibility" },
   { id: "discoverStatus", label: "Discover status" },
   { id: "includedApps", label: "Included apps" },
   { id: "checkoutConversion", label: "Checkout conversion" },
   { id: "allTimeRevenue", label: "All time revenue" },
   { id: "activeUsers", label: "Active users" },
];

export default function ProductsPage() {
   const router = useRouter();
   const { activeBusiness } = useWorkspace();
   const [products, setProducts] = useState<ProductRow[]>([]);
   const [loading, setLoading] = useState(true);
   const [visibilityFilter, setVisibilityFilter] = useState<string[]>([]);
   const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
   const [showColumnPicker, setShowColumnPicker] = useState(false);
   const [visibleColumns, setVisibleColumns] = useState<ColumnId[]>(
      ALL_COLUMNS.map((c) => c.id),
   );
   const [columnSearch, setColumnSearch] = useState("");
   const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
   const [page, setPage] = useState(1);
   const [rowsPerPage, setRowsPerPage] = useState(20);

   const load = async () => {
      setLoading(true);
      const url = activeBusiness?.id
         ? `/api/business/products?businessId=${activeBusiness.id}`
         : `/api/business/products`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
      setLoading(false);
   };

   useEffect(() => {
      load();
   }, [activeBusiness?.id]);

   // Filter
   const filtered = useMemo(() => {
      let list = products;
      if (visibilityFilter.length > 0) {
         list = list.filter((p) => visibilityFilter.includes(p.visibility));
      }
      // Sort
      list = [...list].sort((a, b) => {
         const cmp = a.name.localeCompare(b.name);
         return sortDir === "asc" ? cmp : -cmp;
      });
      return list;
   }, [products, visibilityFilter, sortDir]);

   // Paginate
   const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
   const currentPage = Math.min(page, totalPages);
   const startIdx = (currentPage - 1) * rowsPerPage;
   const endIdx = Math.min(startIdx + rowsPerPage, filtered.length);
   const paginated = filtered.slice(startIdx, endIdx);

   const toggleVisibility = (v: string) => {
      setVisibilityFilter((prev) =>
         prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
      );
      setPage(1);
   };

   const toggleColumn = (id: ColumnId) => {
      setVisibleColumns((prev) =>
         prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
   };

   const isColumnVisible = (id: ColumnId) => visibleColumns.includes(id);

   const handleExport = () => {
      const csv = [
         ["Name", "Price", "Visibility", "Discover", "Revenue", "Users"].join(
            ",",
         ),
         ...filtered.map((p) =>
            [
               p.name,
               p.price,
               p.visibility,
               p.discoverStatus,
               p.stats.allTimeRevenue,
               p.stats.activeUsers,
            ].join(","),
         ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.csv";
      a.click();
      URL.revokeObjectURL(url);
   };

   return (
      <div className={styles.page}>
         {/* Header */}
         <div className={styles.header}>
            <h1 className={styles.title}>Products</h1>
            <div className={styles.headerActions}>
               <Link href="/business/products/new" className={styles.createBtn}>
                  <Plus size={14} /> Create product
               </Link>
               <button className={styles.secondaryBtn} onClick={handleExport}>
                  <Download size={14} /> Export
               </button>
               <button
                  className={styles.iconBtn}
                  onClick={() => setShowColumnPicker(true)}
                  aria-label="Column settings"
               >
                  <Settings2 size={16} />
               </button>
            </div>
         </div>

         {/* Filters */}
         <div className={styles.filtersRow}>
            <div className={styles.dropdownWrap}>
               <button
                  className={styles.filterBtn}
                  onClick={() => setShowVisibilityDropdown((v) => !v)}
               >
                  Visibility <ChevronDown size={14} />
               </button>

               {showVisibilityDropdown && (
                  <div
                     className={styles.dropdown}
                     onMouseLeave={() => setShowVisibilityDropdown(false)}
                  >
                     {[
                        { key: "visible", label: "Visible" },
                        { key: "hidden", label: "Hidden" },
                        { key: "archived", label: "Archived" },
                     ].map((opt) => (
                        <label key={opt.key} className={styles.checkboxRow}>
                           <input
                              type="checkbox"
                              checked={visibilityFilter.includes(opt.key)}
                              onChange={() => toggleVisibility(opt.key)}
                           />
                           <span>{opt.label}</span>
                        </label>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Table */}
         {loading ? (
            <div className={styles.loading}>Loading...</div>
         ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
               <div className={styles.emptyIcon}>
                  <Store size={48} strokeWidth={1.5} />
               </div>
               <div className={styles.emptyTitle}>No products yet</div>
               <div className={styles.emptySub}>
                  A product is needed to organize access to your offering.
               </div>
               <Link href="/business/products/new" className={styles.createBtn}>
                  Create product
               </Link>
            </div>
         ) : (
            <>
               <div className={styles.tableWrap}>
                  <table className={styles.table}>
                     <thead>
                        <tr>
                           {isColumnVisible("name") && (
                              <th>
                                 <button
                                    className={styles.sortBtn}
                                    onClick={() =>
                                       setSortDir((d) =>
                                          d === "asc" ? "desc" : "asc",
                                       )
                                    }
                                 >
                                    Name <ArrowUpDown size={12} />
                                 </button>
                              </th>
                           )}
                           {isColumnVisible("price") && <th>Price</th>}
                           {isColumnVisible("visibility") && (
                              <th>Visibility</th>
                           )}
                           {isColumnVisible("discoverStatus") && (
                              <th>Discover status</th>
                           )}
                           {isColumnVisible("includedApps") && (
                              <th>Included apps</th>
                           )}
                           {isColumnVisible("checkoutConversion") && (
                              <th>Checkout conversion</th>
                           )}
                           {isColumnVisible("allTimeRevenue") && (
                              <th>All time revenue</th>
                           )}
                           {isColumnVisible("activeUsers") && (
                              <th>Active users</th>
                           )}
                        </tr>
                     </thead>
                     <tbody>
                        {paginated.map((p) => (
                           <tr
                              key={p.id}
                              onClick={() =>
                                 router.push(`/business/products/${p.id}`)
                              }
                              className={styles.row}
                           >
                              {isColumnVisible("name") && (
                                 <td>
                                    <div className={styles.nameCell}>
                                       <div className={styles.productAvatar}>
                                          {p.name[0]}
                                       </div>
                                       <div>{p.name}</div>
                                    </div>
                                 </td>
                              )}
                              {isColumnVisible("price") && (
                                 <td>
                                    {p.accessType === "free"
                                       ? "Free"
                                       : `$${p.price} ${p.currency}`}
                                 </td>
                              )}
                              {isColumnVisible("visibility") && (
                                 <td>
                                    <span
                                       className={`${styles.badge} ${styles[p.visibility]}`}
                                    >
                                       {p.visibility}
                                    </span>
                                 </td>
                              )}
                              {isColumnVisible("discoverStatus") && (
                                 <td>
                                    {p.discoverStatus === "listed"
                                       ? "Listed"
                                       : "Unlisted"}
                                 </td>
                              )}
                              {isColumnVisible("includedApps") && (
                                 <td className={styles.appsCell}>
                                    {p.includedApps.length === 0 ? (
                                       <span className={styles.muted}>—</span>
                                    ) : (
                                       p.includedApps.slice(0, 3).map((app) => (
                                          <span
                                             key={app}
                                             className={styles.appPill}
                                          >
                                             {app}
                                          </span>
                                       ))
                                    )}
                                 </td>
                              )}
                              {isColumnVisible("checkoutConversion") && (
                                 <td>
                                    {p.stats.checkoutConversion.toFixed(1)}%
                                 </td>
                              )}
                              {isColumnVisible("allTimeRevenue") && (
                                 <td>${p.stats.allTimeRevenue.toFixed(2)}</td>
                              )}
                              {isColumnVisible("activeUsers") && (
                                 <td>{p.stats.activeUsers}</td>
                              )}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Table Footer */}
               <div className={styles.tableFooter}>
                  <div>
                     {startIdx + 1}-{endIdx} of {filtered.length} results
                  </div>
                  <div className={styles.pagination}>
                     <button
                        className={styles.pageBtn}
                        onClick={() => setPage(1)}
                        disabled={currentPage === 1}
                     >
                        <ChevronLeft size={14} />
                        <ChevronLeft size={14} style={{ marginLeft: -10 }} />
                     </button>
                     <button
                        className={styles.pageBtn}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                     >
                        <ChevronLeft size={14} />
                     </button>
                     <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                     </span>
                     <button
                        className={styles.pageBtn}
                        onClick={() =>
                           setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                     >
                        <ChevronRight size={14} />
                     </button>
                     <button
                        className={styles.pageBtn}
                        onClick={() => setPage(totalPages)}
                        disabled={currentPage === totalPages}
                     >
                        <ChevronRight size={14} />
                        <ChevronRight size={14} style={{ marginLeft: -10 }} />
                     </button>
                  </div>
                  <div className={styles.rowsPerPage}>
                     Rows per page
                     <select
                        value={rowsPerPage}
                        onChange={(e) => {
                           setRowsPerPage(Number(e.target.value));
                           setPage(1);
                        }}
                        className={styles.rowsSelect}
                     >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                     </select>
                  </div>
               </div>
            </>
         )}

         {/* Column Picker Panel */}
         {showColumnPicker && (
            <div
               className={styles.columnPicker}
               onMouseLeave={() => setShowColumnPicker(false)}
            >
               <div className={styles.colSearch}>
                  <Search size={14} />
                  <input
                     placeholder="Search columns..."
                     value={columnSearch}
                     onChange={(e) => setColumnSearch(e.target.value)}
                  />
               </div>

               <div className={styles.colGroupLabel}>Available columns</div>

               <div className={styles.colList}>
                  {ALL_COLUMNS.filter((c) =>
                     c.label.toLowerCase().includes(columnSearch.toLowerCase()),
                  ).map((col) => (
                     <label key={col.id} className={styles.colRow}>
                        <input
                           type="checkbox"
                           checked={isColumnVisible(col.id)}
                           onChange={() => toggleColumn(col.id)}
                        />
                        <span>{col.label}</span>
                        <span className={styles.dragHandle}>⋮⋮</span>
                     </label>
                  ))}
               </div>

               <div className={styles.colFooter}>
                  <button
                     className={styles.colFooterBtn}
                     onClick={() => setVisibleColumns([])}
                  >
                     Unselect all
                  </button>
                  <button
                     className={styles.colFooterBtn}
                     onClick={() =>
                        setVisibleColumns(ALL_COLUMNS.map((c) => c.id))
                     }
                  >
                     Reset
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}
