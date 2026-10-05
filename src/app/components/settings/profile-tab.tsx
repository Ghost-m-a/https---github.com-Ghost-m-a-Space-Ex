"use client";

import React, { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import styles from "../../styles/settings.module.css";

interface UserData {
   name: string;
   username: string;
   bio: string;
   dateOfBirth: string;
   location: string;
   avatarColor: string;
   privacy: {
      totalEarned: boolean;
      location: boolean;
      ownedWhops: boolean;
      joinedWhops: boolean;
   };
}

const ProfileTab = () => {
   const [user, setUser] = useState<UserData | null>(null);
   const [saving, setSaving] = useState(false);
   const [saved, setSaved] = useState(false);

   useEffect(() => {
      fetch("/api/user/settings")
         .then((r) => r.json())
         .then((d) => setUser(d.user));
   }, []);

   const update = (patch: Partial<UserData>) =>
      setUser((prev) => (prev ? { ...prev, ...patch } : prev));

   const updatePrivacy = (key: keyof UserData["privacy"], value: boolean) =>
      setUser((prev) =>
         prev ? { ...prev, privacy: { ...prev.privacy, [key]: value } } : prev,
      );

   const save = async () => {
      if (!user) return;
      setSaving(true);
      await fetch("/api/user/settings", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            name: user.name,
            username: user.username,
            bio: user.bio,
            dateOfBirth: user.dateOfBirth,
            location: user.location,
            privacy: user.privacy,
         }),
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
   };

   if (!user) return <div className={styles.loading}>Loading...</div>;

   const initials = user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

   return (
      <div className={styles.tabContent}>
         {/* Banner + avatar */}
         <div className={styles.profileBanner}>
            <div className={styles.profileAvatarWrap}>
               <div className={styles.profileAvatar}>{initials}</div>
               <button
                  className={styles.avatarUploadBtn}
                  aria-label="Upload avatar"
               >
                  <Camera size={16} />
               </button>
            </div>
            <div className={styles.profileIdentity}>
               <div className={styles.profileName}>{user.name}</div>
               <div className={styles.profileHandle}>
                  @{user.username || "user"}
               </div>
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Details</h4>
            <p className={styles.sectionSubtitle}>
               Update your name, handle and personal details.
            </p>

            <div className={styles.fieldRow}>
               <label className={styles.fieldLabel}>Name</label>
               <input
                  className={styles.fieldInput}
                  value={user.name}
                  onChange={(e) => update({ name: e.target.value })}
               />
            </div>

            <div className={styles.fieldRow}>
               <label className={styles.fieldLabel}>Username</label>
               <input
                  className={styles.fieldInput}
                  value={user.username}
                  onChange={(e) => update({ username: e.target.value })}
                  placeholder="username"
               />
            </div>

            <div className={styles.fieldRow}>
               <label className={styles.fieldLabel}>Bio</label>
               <textarea
                  className={styles.fieldTextarea}
                  value={user.bio}
                  onChange={(e) => update({ bio: e.target.value })}
                  placeholder="No bio"
                  rows={4}
                  maxLength={500}
               />
            </div>

            <div className={styles.fieldRow}>
               <label className={styles.fieldLabel}>Date of birth</label>
               <input
                  className={styles.fieldInput}
                  type="date"
                  value={user.dateOfBirth}
                  onChange={(e) => update({ dateOfBirth: e.target.value })}
               />
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>More details</h4>
            <p className={styles.sectionSubtitle}>
               Choose what appears on your profile and other discovery surfaces.
            </p>

            {[
               { key: "totalEarned", label: "Total earned" },
               { key: "location", label: "Location" },
               { key: "ownedWhops", label: "Owned businesses" },
               { key: "joinedWhops", label: "Joined businesses" },
            ].map((item) => (
               <div key={item.key} className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>{item.label}</span>
                  <button
                     className={`${styles.switch} ${
                        user.privacy[item.key as keyof typeof user.privacy]
                           ? styles.switchOn
                           : ""
                     }`}
                     onClick={() =>
                        updatePrivacy(
                           item.key as keyof typeof user.privacy,
                           !user.privacy[item.key as keyof typeof user.privacy],
                        )
                     }
                  >
                     <span className={styles.switchThumb} />
                  </button>
               </div>
            ))}
         </div>

         <div className={styles.saveBar}>
            <button className={styles.saveBtn} onClick={save} disabled={saving}>
               {saving ? "Saving..." : saved ? "✓ Saved" : "Save changes"}
            </button>
         </div>
      </div>
   );
};

export default ProfileTab;
