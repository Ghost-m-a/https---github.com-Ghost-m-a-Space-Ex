"use client";

import { useEffect, useState } from "react";
import {
   BarChart3,
   DollarSign,
   FileText,
   Image as ImageIcon,
   Link as LinkIcon,
   MessageCircle,
   MoreHorizontal,
   Repeat2,
   Heart,
   Share,
   Eye,
   Send,
} from "lucide-react";
import styles from "@/styles/pages/townhall.module.css";

interface PostAuthor {
   id: string;
   name: string;
   username: string;
   avatar: string;
   verified: boolean;
}

interface Post {
   id: string;
   author: PostAuthor;
   forum: string;
   content: string;
   media: any;
   stats: { comments: number; likes: number; views: number; shares: number };
   likedBy: string[];
   createdAt: string;
}

interface PopularUser {
   id: string;
   name: string;
   username: string;
   avatarColor: string;
   subtitle: string;
}

type Tab = "all" | "following" | "joined";

export default function TownhallPage() {
   const [tab, setTab] = useState<Tab>("all");
   const [posts, setPosts] = useState<Post[]>([]);
   const [popular, setPopular] = useState<PopularUser[]>([]);
   const [loading, setLoading] = useState(true);
   const [composerText, setComposerText] = useState("");
   const [posting, setPosting] = useState(false);

   const loadPosts = (t: Tab) => {
      setLoading(true);
      fetch(`/api/townhall/posts?tab=${t}`, { credentials: "include" })
         .then((r) => r.json())
         .then((d) => setPosts(d.posts ?? []))
         .finally(() => setLoading(false));
   };

   useEffect(() => {
      loadPosts(tab);
   }, [tab]);

   useEffect(() => {
      fetch("/api/townhall/popular")
         .then((r) => r.json())
         .then((d) => setPopular(d.users ?? []));
   }, []);

   const submit = async () => {
      if (!composerText.trim() || posting) return;
      setPosting(true);
      try {
         const res = await fetch("/api/townhall/posts", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: composerText }),
         });
         if (res.ok) {
            setComposerText("");
            loadPosts(tab);
         }
      } finally {
         setPosting(false);
      }
   };

   const formatTime = (t: string) => {
      const diff = Date.now() - new Date(t).getTime();
      const min = Math.floor(diff / 60000);
      if (min < 1) return "just now";
      if (min < 60) return `${min}m`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr}h`;
      return `${Math.floor(hr / 24)}d`;
   };

   return (
      <div className={styles.page}>
         <div className={styles.layout}>
            {/* MAIN COLUMN */}
            <div className={styles.main}>
               {/* Header */}
               <div className={styles.header}>
                  <div className={styles.headerTitle}>
                     <span className={styles.title}>Townhall</span>
                     <span className={styles.dot} />
                  </div>
                  <div className={styles.tabs}>
                     {(["all", "following", "joined"] as Tab[]).map((t) => (
                        <button
                           key={t}
                           className={`${styles.tab} ${
                              tab === t ? styles.tabActive : ""
                           }`}
                           onClick={() => setTab(t)}
                        >
                           {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Composer */}
               <div className={styles.composer}>
                  <div className={styles.composerFilters}>
                     <button className={styles.filterChip}>
                        <span className={styles.filterDot} /> Space/Ex
                     </button>
                     <button className={styles.filterChip}>
                        <span className={styles.filterDot} /> Public forum
                     </button>
                  </div>
                  <div className={styles.composerRow}>
                     <div className={styles.composerAvatar}>DZ</div>
                     <textarea
                        className={styles.composerInput}
                        placeholder="Your next post could blow up..."
                        value={composerText}
                        onChange={(e) => setComposerText(e.target.value)}
                        rows={1}
                     />
                  </div>
                  <div className={styles.composerActions}>
                     <div className={styles.composerTools}>
                        <button title="Image">
                           <ImageIcon size={16} />
                        </button>
                        <button title="Poll">
                           <BarChart3 size={16} />
                        </button>
                        <button title="Link">
                           <LinkIcon size={16} />
                        </button>
                        <button title="Price">
                           <DollarSign size={16} />
                        </button>
                     </div>
                     <div className={styles.composerRight}>
                        <button className={styles.goLiveBtn}>
                           <span className={styles.liveDot} /> Go live
                        </button>
                        <button
                           className={styles.postBtn}
                           onClick={submit}
                           disabled={posting || !composerText.trim()}
                        >
                           {posting ? "Posting…" : "Post"}
                        </button>
                     </div>
                  </div>
               </div>

               {/* Feed */}
               {loading ? (
                  <div className={styles.loading}>Loading…</div>
               ) : posts.length === 0 ? (
                  <div className={styles.emptyState}>
                     <Send size={32} />
                     <div>No posts yet — be the first to post something.</div>
                  </div>
               ) : (
                  <div className={styles.feed}>
                     {posts.map((p) => (
                        <PostCard key={p.id} post={p} formatTime={formatTime} />
                     ))}
                  </div>
               )}
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className={styles.side}>
               <div className={styles.sideCard}>
                  <div className={styles.sideHeader}>
                     <span>Popular users</span>
                     <button className={styles.seeAll}>See all</button>
                  </div>
                  <div className={styles.userList}>
                     {popular.map((u) => (
                        <div key={u.id} className={styles.userRow}>
                           <div
                              className={styles.userAvatar}
                              style={{ background: u.avatarColor }}
                           >
                              {u.name.charAt(0).toUpperCase()}
                           </div>
                           <div className={styles.userInfo}>
                              <div className={styles.userName}>{u.name}</div>
                              <div className={styles.userSub}>{u.subtitle}</div>
                           </div>
                           <button className={styles.followBtn}>Follow</button>
                        </div>
                     ))}
                  </div>
               </div>
            </aside>
         </div>
      </div>
   );
}

function PostCard({
   post,
   formatTime,
}: {
   post: Post;
   formatTime: (t: string) => string;
}) {
   return (
      <div className={styles.post}>
         <div className={styles.postHeader}>
            <div className={styles.postAvatar}>{post.author.avatar || "?"}</div>
            <div className={styles.postAuthorInfo}>
               <div className={styles.postAuthorLine}>
                  <span className={styles.postAuthorName}>
                     {post.author.name}
                  </span>
                  <span className={styles.postHandle}>
                     @{post.author.username || "anon"}
                  </span>
                  <span className={styles.postDot}>·</span>
                  <span className={styles.postTime}>
                     {formatTime(post.createdAt)}
                  </span>
               </div>
               <div className={styles.postForum}>{post.forum}</div>
            </div>
            <div className={styles.postActions}>
               <button>
                  <Repeat2 size={14} />
               </button>
               <button>
                  <MoreHorizontal size={14} />
               </button>
            </div>
         </div>

         <div className={styles.postBody}>{post.content}</div>

         {post.media?.url && (
            <div className={styles.postMedia}>
               <img src={post.media.url} alt="" />
            </div>
         )}

         <div className={styles.postStats}>
            <button className={styles.statBtn}>
               <MessageCircle size={14} /> {post.stats.comments}
            </button>
            <button className={styles.statBtn}>
               <Heart size={14} /> {post.stats.likes}
            </button>
            <button className={styles.statBtn}>
               <Eye size={14} /> {post.stats.views.toLocaleString()}
            </button>
            <button className={styles.statBtn}>
               <Share size={14} />
            </button>
         </div>
      </div>
   );
}
