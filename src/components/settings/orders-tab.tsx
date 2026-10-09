"use client";

import React, { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import styles from "@/styles/components/settings.module.css";

interface Order {
   id: string;
   productName: string;
   productImage: string;
   amount: number;
   currency: string;
   status: string;
   isWaitlist: boolean;
   createdAt: string;
}

const OrdersTab = () => {
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetch("/api/user/orders")
         .then((r) => r.json())
         .then((d) => setOrders(d.orders || []))
         .finally(() => setLoading(false));
   }, []);

   const waitlists = orders.filter((o) => o.isWaitlist);
   const regular = orders.filter((o) => !o.isWaitlist);

   return (
      <div className={styles.tabContent}>
         {waitlists.length > 0 && (
            <div className={styles.section}>
               <h4 className={styles.sectionTitle}>Waitlists</h4>
               {waitlists.map((o) => (
                  <div key={o.id} className={styles.waitlistCard}>
                     <div className={styles.waitlistIcon}>
                        {o.productImage || o.productName[0]}
                     </div>
                     <div className={styles.listInfo}>
                        <div className={styles.listTitle}>{o.productName}</div>
                        <div className={styles.listSub}>
                           Free · Joined{" "}
                           {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                     </div>
                     <button className={styles.iconBtn}>
                        <MoreHorizontal size={16} />
                     </button>
                  </div>
               ))}
            </div>
         )}

         <div className={styles.section}>
            {loading ? (
               <div className={styles.emptyBox}>Loading...</div>
            ) : regular.length === 0 ? (
               <div className={styles.emptyBoxLarge}>
                  <div className={styles.emptyIllustration}>🧾</div>
                  <div className={styles.emptyTitle}>No orders yet</div>
                  <div className={styles.emptySubtitle}>
                     All your purchases will appear here
                  </div>
                  <button className={styles.btnPrimary}>
                     Browse marketplace
                  </button>
               </div>
            ) : (
               <div className={styles.listBox}>
                  {regular.map((o) => (
                     <div key={o.id} className={styles.listItem}>
                        <div className={styles.listAvatar}>
                           {o.productImage || o.productName[0]}
                        </div>
                        <div className={styles.listInfo}>
                           <div className={styles.listTitle}>
                              {o.productName}
                           </div>
                           <div className={styles.listSub}>
                              ${o.amount} {o.currency} · {o.status}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
};

export default OrdersTab;
