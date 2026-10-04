"use client";

import React, { useEffect, useState } from "react";
import {
   Image as ImageIcon,
   Gift,
   Smile,
   BarChart3,
   DollarSign,
   Radio,
   MessageCircle,
   Heart,
   BarChart2,
   Share,
   MoreHorizontal,
} from "lucide-react";
import { Post, PopularUser } from "../lib/types";
import styles from "./townhall.module.css";

export default function TownhallPage() {
   const [posts, setPosts] = useState<Post[]>([]);
   const [popularUsers, setPopularUsers] = useState<PopularUser[]>([]);
   const [newPost, setNewPost] = useState("");
   const [tab, setTab] = useState<"all" | "following" | "joined">("all");
   const [posting, setPosting] = useState(false);

   useEffect(() => {
      loadData();
   }, []);

   const loadData = async () => {
      const res = await fetch("/api/townhall");
      const data = await res.json();
      setPosts(data.posts);
      setPopularUsers(data.popularUsers);
   };

   const handlePost = async () => {
      if (!newPost.trim() || posting) return;
      setPosting(true);
      const res = await fetch("/api/townhall", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ content: newPost }),
      });
      if (res.ok) {
         setNewPost("");
         await loadData();
      }
      setPosting(false);
   };

   const handleFollow = async (userId: string) => {
      const res = await fetch("/api/townhall", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ follow: userId }),
      });
      // optimistic update
      setPopularUsers((prev) =>
         prev.map((u) =>
            u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u,
         ),
      );
   };

   return (
      <div className={styles.layout}>
         {/* MAIN FEED */}
         <div className={styles.feed}>
            <div className={styles.feedHeader}>
               <div className={styles.feedTitle}>
                  Townhall <span className={styles.onlineDot} />
               </div>
               <div className={styles.feedTabs}>
                  {(["all", "following", "joined"] as const).map((t) => (
                     <button
                        key={t}
                        className={`${styles.feedTab} ${tab === t ? styles.feedTabActive : ""}`}
                        onClick={() => setTab(t)}
                     >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                     </button>
                  ))}
               </div>
            </div>

            {/* Composer */}
            <div className={styles.composer}>
               <div className={styles.composerTop}>
                  <div className={styles.composerAvatar}>DZ</div>
                  <input
                     className={styles.composerInput}
                     placeholder="Drop something worth talking about..."
                     value={newPost}
                     onChange={(e) => setNewPost(e.target.value)}
                  />
               </div>
               <div className={styles.composerActions}>
                  <div className={styles.composerIcons}>
                     <button className={styles.composerIcon}>
                        <ImageIcon size={18} />
                     </button>
                     <button className={styles.composerIcon}>
                        <Gift size={18} />
                     </button>
                     <button className={styles.composerIcon}>
                        <Smile size={18} />
                     </button>
                     <button className={styles.composerIcon}>
                        <BarChart3 size={18} />
                     </button>
                     <button className={styles.composerIcon}>
                        <DollarSign size={18} />
                     </button>
                  </div>
                  <div className={styles.composerRight}>
                     <button className={styles.goLiveBtn}>
                        <Radio size={16} /> Go live
                     </button>
                     <button
                        className={styles.postBtn}
                        onClick={handlePost}
                        disabled={!newPost.trim() || posting}
                     >
                        {posting ? "Posting..." : "Post"}
                     </button>
                  </div>
               </div>
            </div>

            {/* Posts */}
            {posts.map((post) => (
               <div key={post.id} className={styles.post}>
                  <div className={styles.postAvatar}>{post.author.avatar}</div>
                  <div className={styles.postBody}>
                     <div className={styles.postHeader}>
                        <div>
                           <span className={styles.postAuthorName}>
                              {post.author.name}{" "}
                              {post.author.verified && (
                                 <span className={styles.verified}>✓</span>
                              )}
                           </span>
                           <span className={styles.postHandle}>
                              @{post.author.handle}
                           </span>
                           <span className={styles.postDot}>·</span>
                           <span className={styles.postTime}>
                              {post.timestamp}
                           </span>
                        </div>
                        <div className={styles.postActions}>
                           <button className={styles.iconSmall}>
                              <BarChart2 size={16} />
                           </button>
                           <button className={styles.iconSmall}>
                              <MoreHorizontal size={16} />
                           </button>
                        </div>
                     </div>
                     <div className={styles.postContent}>{post.content}</div>

                     {post.price !== undefined && (
                        <div className={styles.postCard}>
                           <div className={styles.postCardTop}>
                              <div className={styles.postPrice}>
                                 ${post.price.toFixed(2)}
                              </div>
                              {post.isOpen && (
                                 <span className={styles.postOpen}>● Open</span>
                              )}
                           </div>
                        </div>
                     )}

                     <div className={styles.postFooter}>
                        <button className={styles.postStat}>
                           <MessageCircle size={16} /> {post.stats.comments}
                        </button>
                        <button className={styles.postStat}>
                           <Heart size={16} /> {post.stats.likes}
                        </button>
                        <button className={styles.postStat}>
                           <BarChart2 size={16} /> {post.stats.views}
                        </button>
                        <button className={styles.postStat}>
                           <Share size={16} />
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* POPULAR USERS SIDEBAR */}
         <aside className={styles.sidePanel}>
            <div className={styles.sidePanelHeader}>
               <div className={styles.sidePanelTitle}>Popular users</div>
               <button className={styles.seeAll}>See all</button>
            </div>
            <div className={styles.usersList}>
               {popularUsers.map((u) => (
                  <div key={u.id} className={styles.userItem}>
                     <div className={styles.userAvatar}>{u.avatar}</div>
                     <div className={styles.userInfo}>
                        <div className={styles.userName}>{u.name}</div>
                        <div className={styles.userBio}>{u.bio}</div>
                     </div>
                     <button
                        className={`${styles.followBtn} ${u.isFollowing ? styles.followingBtn : ""}`}
                        onClick={() => handleFollow(u.id)}
                     >
                        {u.isFollowing ? "Following" : "Follow"}
                     </button>
                  </div>
               ))}
            </div>
         </aside>
      </div>
   );
}
