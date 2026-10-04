"use client";

import React, { useEffect, useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { BusinessProduct } from "../../lib/types";
import styles from "../business.module.css";

export default function ProductsPage() {
   const [products, setProducts] = useState<BusinessProduct[]>([]);
   const [showModal, setShowModal] = useState(false);
   const [form, setForm] = useState({
      name: "",
      description: "",
      price: "",
      type: "one-time",
   });

   const load = () =>
      fetch("/api/business/products")
         .then((r) => r.json())
         .then((d) => setProducts(d.products));

   useEffect(() => {
      load();
   }, []);

   const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      await fetch("/api/business/products", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(form),
      });
      setForm({ name: "", description: "", price: "", type: "one-time" });
      setShowModal(false);
      load();
   };

   const handleToggle = async (id: string) => {
      await fetch("/api/business/products", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ action: "toggle", id }),
      });
      load();
   };

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>Products</h1>
            <button
               className={styles.primaryBtn}
               onClick={() => setShowModal(true)}
            >
               <Plus size={16} /> New Product
            </button>
         </div>

         <div className={styles.tableCard}>
            <div className={styles.tableHead}>
               <div>Product</div>
               <div>Type</div>
               <div>Price</div>
               <div>Sales</div>
               <div>Revenue</div>
               <div>Status</div>
               <div></div>
            </div>
            {products.map((p) => (
               <div key={p.id} className={styles.tableRow}>
                  <div className={styles.prodCell}>
                     <div className={styles.prodImage}>{p.image}</div>
                     <div>
                        <div className={styles.prodName}>{p.name}</div>
                        <div className={styles.prodDesc}>{p.description}</div>
                     </div>
                  </div>
                  <div className={styles.cell}>{p.type}</div>
                  <div className={styles.cell}>${p.price}</div>
                  <div className={styles.cell}>{p.sales}</div>
                  <div className={styles.cell}>
                     ${p.revenue.toLocaleString()}
                  </div>
                  <div className={styles.cell}>
                     <span className={`${styles.status} ${styles[p.status]}`}>
                        {p.status}
                     </span>
                  </div>
                  <button
                     className={styles.iconBtn}
                     onClick={() => handleToggle(p.id)}
                  >
                     <MoreHorizontal size={16} />
                  </button>
               </div>
            ))}
         </div>

         {showModal && (
            <div
               className={styles.modalOverlay}
               onClick={() => setShowModal(false)}
            >
               <form
                  className={styles.modal}
                  onClick={(e) => e.stopPropagation()}
                  onSubmit={handleCreate}
               >
                  <h2 className={styles.modalTitle}>New Product</h2>
                  <input
                     className={styles.input}
                     placeholder="Product name"
                     value={form.name}
                     onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                     }
                     required
                  />
                  <input
                     className={styles.input}
                     placeholder="Description"
                     value={form.description}
                     onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                     }
                  />
                  <input
                     className={styles.input}
                     type="number"
                     placeholder="Price"
                     value={form.price}
                     onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                     }
                     required
                  />
                  <select
                     className={styles.input}
                     value={form.type}
                     onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                     }
                  >
                     <option value="one-time">One-time</option>
                     <option value="subscription">Subscription</option>
                     <option value="renewal">Renewal</option>
                  </select>
                  <button type="submit" className={styles.primaryBtn}>
                     Create Product
                  </button>
               </form>
            </div>
         )}
      </div>
   );
}
