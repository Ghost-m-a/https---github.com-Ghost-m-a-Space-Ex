"use client";

import React, { useState } from "react";
import {
   Rocket,
   Store,
   ChevronDown,
   X,
   Image as ImageIcon,
   Shuffle,
} from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import styles from "@/styles/components/businessModal.module.css";

interface BusinessModalProps {
   isOpen: boolean;
   onClose: () => void;
}

type Step = "choose" | "name" | "details";
type Choice = "have" | "want" | null;

const BUSINESS_TYPES = [
   "Coaching & Courses",
   "Paid Group",
   "Physical Products",
   "Services",
   "Platforms",
   "Software",
   "Other",
];

const REVENUE_OPTIONS = [
   "Under $50k",
   "$50-$250k",
   "$250-$500k",
   "$500k-$1M",
   "$1-$5M",
   "Over $5M",
];

const MIGRATE_PLATFORMS = [
   "Circle",
   "Gumroad",
   "Kajabi",
   "Paddle",
   "Patreon",
   "PayPal",
   "Shopify",
   "Skool",
   "Square",
   "Stripe",
   "Teachable",
   "Other",
   "Not migrating",
];

// =========================================
// RANDOM BUSINESS NAME GENERATOR
// =========================================
const NAME_PREFIXES = [
   "Nova",
   "Apex",
   "Lumen",
   "Vertex",
   "Zenith",
   "Orbit",
   "Pulse",
   "Echo",
   "Nimbus",
   "Craft",
   "Prime",
   "Fusion",
   "Vivid",
   "Bright",
   "Swift",
   "Bold",
   "Peak",
   "Spark",
   "Halo",
   "Vibe",
   "Pixel",
   "Flow",
   "Bloom",
   "Drift",
];

const NAME_SUFFIXES = [
   "Labs",
   "Studio",
   "Works",
   "Collective",
   "Co",
   "HQ",
   "Hub",
   "Base",
   "Systems",
   "Digital",
   "Media",
   "Group",
   "Ventures",
   "Solutions",
   "Agency",
   "Design",
   "Tech",
   "Craft",
   "& Co",
   "Society",
];

const NAME_STYLES = [
   "Creative",
   "Modern",
   "Academy",
   "Shop",
   "Kitchen",
   "Fitness",
   "Wellness",
   "Consulting",
   "Marketing",
   "Finance",
   "Travel",
   "Coffee",
   "Bakery",
   "Salon",
   "Photography",
   "Realty",
   "Books",
   "Games",
   "Fashion",
];

const generateRandomName = (): string => {
   const roll = Math.random();

   if (roll < 0.5) {
      const prefix =
         NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
      const suffix =
         NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
      return `${prefix} ${suffix}`;
   }

   if (roll < 0.8) {
      const prefix =
         NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
      const style = NAME_STYLES[Math.floor(Math.random() * NAME_STYLES.length)];
      return `${prefix} ${style}`;
   }

   const style = NAME_STYLES[Math.floor(Math.random() * NAME_STYLES.length)];
   const suffix =
      NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
   return `${style} ${suffix}`;
};

const BusinessModal: React.FC<BusinessModalProps> = ({ isOpen, onClose }) => {
   const { addBusiness } = useWorkspace();
   const [step, setStep] = useState<Step>("choose");
   const [choice, setChoice] = useState<Choice>(null);
   const [name, setName] = useState("");
   const [type, setType] = useState("");
   const [revenue, setRevenue] = useState("");
   const [migrateFrom, setMigrateFrom] = useState("");
   const [website, setWebsite] = useState("");
   const [openDropdown, setOpenDropdown] = useState<string | null>(null);
   const [isShuffling, setIsShuffling] = useState(false);

   // ✅ NEW: submission state
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState("");

   const reset = () => {
      setStep("choose");
      setChoice(null);
      setName("");
      setType("");
      setRevenue("");
      setMigrateFrom("");
      setWebsite("");
      setOpenDropdown(null);
      setIsShuffling(false);
      setIsSubmitting(false);
      setError("");
   };

   const handleClose = () => {
      reset();
      onClose();
   };

   const handleHaveBusiness = () => {
      setChoice("have");
      setName("");
      setStep("name");
   };

   const handleWantBusiness = () => {
      setChoice("want");
      setName(generateRandomName());
      setStep("name");
   };

   const handleShuffle = () => {
      setIsShuffling(true);
      setName(generateRandomName());
      setTimeout(() => setIsShuffling(false), 300);
   };

   // ✅ NEW: async create handler
   const handleCreate = async () => {
      if (!name.trim() || isSubmitting) return;

      setError("");
      setIsSubmitting(true);

      try {
         const created = await addBusiness({
            name: name.trim(),
            type,
            revenue,
            migrateFrom,
            website,
         });

         if (created) {
            reset();
            onClose();
         } else {
            setError("Failed to create business. Please try again.");
         }
      } catch (err) {
         console.error("Create business error:", err);
         setError(
            err instanceof Error
               ? err.message
               : "Something went wrong. Please try again.",
         );
      } finally {
         setIsSubmitting(false);
      }
   };

   if (!isOpen) return null;

   return (
      <div className={styles.overlay} onClick={handleClose}>
         <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={handleClose}>
               <X size={20} />
            </button>

            {/* =========================================
            STEP 1: CHOOSE
            ========================================= */}
            {step === "choose" && (
               <>
                  <h1 className={styles.title}>Start a business</h1>
                  <div className={styles.choices}>
                     <button
                        className={styles.choiceCard}
                        onClick={handleHaveBusiness}
                     >
                        <div className={styles.choiceIcon}>
                           <Rocket size={48} strokeWidth={1.5} />
                        </div>
                        <span className={styles.choiceLabel}>
                           I have a business
                        </span>
                     </button>

                     <button
                        className={styles.choiceCard}
                        onClick={handleWantBusiness}
                     >
                        <div className={styles.choiceIcon}>
                           <Store size={48} strokeWidth={1.5} />
                        </div>
                        <span className={styles.choiceLabel}>
                           I want a business
                        </span>
                     </button>
                  </div>
               </>
            )}

            {/* =========================================
            STEP 2: NAME
            ========================================= */}
            {step === "name" && (
               <>
                  <h1 className={styles.title}>Name your business</h1>

                  {choice === "want" && (
                     <p className={styles.suggestionHint}>
                        Here&apos;s an idea to get you started — click{" "}
                        <Shuffle
                           size={12}
                           style={{
                              display: "inline",
                              verticalAlign: "middle",
                           }}
                        />{" "}
                        for another.
                     </p>
                  )}

                  <div className={styles.formContainer}>
                     <div className={styles.inputWrapper}>
                        <input
                           type="text"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           placeholder="Acme Detailing"
                           className={`${styles.textInput} ${
                              isShuffling ? styles.inputShuffle : ""
                           }`}
                           autoFocus
                        />

                        {choice === "want" ? (
                           <button
                              type="button"
                              className={styles.iconBtn}
                              onClick={handleShuffle}
                              title="Suggest another name"
                              aria-label="Regenerate name suggestion"
                           >
                              <Shuffle size={18} />
                           </button>
                        ) : (
                           <button className={styles.iconBtn} type="button">
                              <ImageIcon size={18} />
                           </button>
                        )}
                     </div>

                     <button
                        className={styles.continueBtn}
                        disabled={!name.trim()}
                        onClick={() => setStep("details")}
                     >
                        Continue
                     </button>
                  </div>
               </>
            )}

            {/* =========================================
            STEP 3: DETAILS
            ========================================= */}
            {step === "details" && (
               <>
                  <h1 className={styles.title}>Tell us about your business</h1>
                  <div className={styles.formContainer}>
                     {/* Error banner */}
                     {error && (
                        <div
                           style={{
                              padding: "10px 14px",
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              borderRadius: "8px",
                              color: "#fca5a5",
                              fontSize: "13px",
                           }}
                        >
                           {error}
                        </div>
                     )}

                     {/* Type of business */}
                     <div className={styles.field}>
                        <label className={styles.label}>Type of business</label>
                        <div className={styles.selectWrapper}>
                           <button
                              className={styles.selectBtn}
                              onClick={() =>
                                 setOpenDropdown(
                                    openDropdown === "type" ? null : "type",
                                 )
                              }
                           >
                              <span className={type ? "" : styles.placeholder}>
                                 {type || "Select type of business"}
                              </span>
                              <ChevronDown size={18} />
                           </button>
                           {openDropdown === "type" && (
                              <div className={styles.dropdown}>
                                 {BUSINESS_TYPES.map((opt) => (
                                    <button
                                       key={opt}
                                       className={styles.dropdownItem}
                                       onClick={() => {
                                          setType(opt);
                                          setOpenDropdown(null);
                                       }}
                                    >
                                       {opt}
                                    </button>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Monthly revenue */}
                     <div className={styles.field}>
                        <label className={styles.label}>Monthly revenue</label>
                        <div className={styles.selectWrapper}>
                           <button
                              className={styles.selectBtn}
                              onClick={() =>
                                 setOpenDropdown(
                                    openDropdown === "revenue"
                                       ? null
                                       : "revenue",
                                 )
                              }
                           >
                              <span
                                 className={revenue ? "" : styles.placeholder}
                              >
                                 {revenue || "Select monthly revenue"}
                              </span>
                              <ChevronDown size={18} />
                           </button>
                           {openDropdown === "revenue" && (
                              <div className={styles.dropdown}>
                                 {REVENUE_OPTIONS.map((opt) => (
                                    <button
                                       key={opt}
                                       className={styles.dropdownItem}
                                       onClick={() => {
                                          setRevenue(opt);
                                          setOpenDropdown(null);
                                       }}
                                    >
                                       {opt}
                                    </button>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Migrate from */}
                     <div className={styles.field}>
                        <label className={styles.label}>
                           Where are you migrating from?
                        </label>
                        <div className={styles.selectWrapper}>
                           <button
                              className={styles.selectBtn}
                              onClick={() =>
                                 setOpenDropdown(
                                    openDropdown === "migrate"
                                       ? null
                                       : "migrate",
                                 )
                              }
                           >
                              <span
                                 className={
                                    migrateFrom ? "" : styles.placeholder
                                 }
                              >
                                 {migrateFrom || "Select a platform"}
                              </span>
                              <ChevronDown size={18} />
                           </button>
                           {openDropdown === "migrate" && (
                              <div
                                 className={`${styles.dropdown} ${styles.dropdownTall}`}
                              >
                                 {MIGRATE_PLATFORMS.map((opt) => (
                                    <button
                                       key={opt}
                                       className={styles.dropdownItem}
                                       onClick={() => {
                                          setMigrateFrom(opt);
                                          setOpenDropdown(null);
                                       }}
                                    >
                                       {opt}
                                    </button>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Website */}
                     <div className={styles.field}>
                        <label className={styles.label}>Website</label>
                        <input
                           type="text"
                           value={website}
                           onChange={(e) => setWebsite(e.target.value)}
                           placeholder="yourbusiness.com"
                           className={styles.textInput}
                        />
                     </div>

                     <button
                        className={styles.continueBtn}
                        onClick={handleCreate}
                        disabled={isSubmitting}
                        style={{
                           opacity: isSubmitting ? 0.7 : 1,
                           cursor: isSubmitting ? "wait" : "pointer",
                        }}
                     >
                        {isSubmitting ? "Creating..." : "Continue"}
                     </button>
                  </div>
               </>
            )}
         </div>
      </div>
   );
};

export default BusinessModal;
