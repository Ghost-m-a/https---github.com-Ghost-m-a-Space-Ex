"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { BusinessCustomer } from "../../lib/types";
import styles from "../business.module.css";

export default function CustomersPage() {
   const [customers, setCustomers] = useState<BusinessCustomer[]>([]);
   const [q, setQ] = useState("");

   useEffect(() => {
      fetch("/api/business/customers")
         .then((r) => r.json())
         .then((d) => setCustomers(d.customers));
   }, []);

   const filtered = customers.filter(
      (c) =>
         c.name.toLowerCase().includes(q.toLowerCase()) ||
         c.email.toLowerCase().includes(q.toLowerCase()),
   );

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>Customers</h1>
            <div className={styles.searchBar}>
               <Search size={16} />
               <input
                  placeholder="Search customers"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
               />
            </div>
         </div>

         <div className={styles.tableCard}>
            <div className={styles.tableHead}>
               <div>Customer</div>
               <div>Status</div>
               <div>Orders</div>
               <div>Total Spent</div>
               <div>Joined</div>
            </div>
            {filtered.map((c) => (
               <div key={c.id} className={styles.tableRow}>
                  <div className={styles.custCell}>
                     <div className={styles.custAvatar}>{c.avatar}</div>
                     <div>
                        <div className={styles.custName}>{c.name}</div>
                        <div className={styles.custEmail}>{c.email}</div>
                     </div>
                  </div>
                  <div className={styles.cell}>
                     <span className={`${styles.status} ${styles[c.status]}`}>
                        {c.status}
                     </span>
                  </div>
                  <div className={styles.cell}>{c.orders}</div>
                  <div className={styles.cell}>${c.spent.toFixed(2)}</div>
                  <div className={styles.cell}>{c.joinedOn}</div>
               </div>
            ))}
         </div>
      </div>
   );
}
