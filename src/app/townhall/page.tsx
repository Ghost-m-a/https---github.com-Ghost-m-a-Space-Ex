"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
   Image as ImageIcon,
   Smile,
   BarChart3,
   DollarSign,
   Radio,
   MessageCircle,
   Heart,
   Share2,
   MoreHorizontal,
   Sparkles,
   ShieldCheck,
   Star,
} from "lucide-react";
import Link from "next/link";
import { useWorkspace } from "@/context/workspace-context";
import styles from "@/styles/pages/townhall.module.css";

interface PostAuthor {
   id: string;
   name: string;
   username: string;
   avatar: string;
   verified: boolean;
   businessName?: string;
}

interface PostMedia {
   type: "image" | "link" | "video";
   url: string;
   title?: string;
   description?: string;
   price?: number;
   isOpen?: boolean;
   rating?: number;
   reviewCount?: number;
}

interface Post {
   id: string;
   author: PostAuthor;
   forum: string;
   content: string;
   media?: PostMedia;
   stats: { comments: number; likes: number; views: number; shares: number };
   createdAt: string;
   isFollowing: boolean;
   liked: boolean;
}

interface Suggestion {
   id: string;
   name: string;
   username: string;
   avatar: string;
   bio: string;
   isFollowing: boolean;
}

interface TrendingWhop {
   id: string;
   name: string;
   initial: string;
   rating: number;
   members: number;
}

type Tab = "all" | "following" | "joined";

export default function TownhallPage() {
   const { activeBusiness } = useWorkspace();
   const [tab, setTab] = useState<Tab>("all");
   const [posts, setPosts] = useState<Post[]>([]);
   const [people, setPeople] = useState<Suggestion[]>([]);
   const [trending, setTrending] = useState<TrendingWhop[]>([]);
   const [content, setContent] = useState("");
   const [posting, setPosting] = useState(false);
   const [loading, setLoading] = useState(true);

   // =========================================
   // LOAD POSTS
   // =========================================
   const loadPosts = useCallback(async () => {
      setLoading(true);
      try {
         const res = await fetch(`/api/townhall?tab=${tab}`);
         const data = await res.json();
         setPosts(data.posts || []);
      } catch {
         setPosts([]);
      } finally {
         setLoading(false);
      }
   }, [tab]);

   useEffect(() => {
      loadPosts();
   }, [loadPosts]);

   // =========================================
   // LOAD SUGGESTIONS
   // =========================================
   useEffect(() => {
      fetch("/api/townhall/suggestions")
         .then((r) => r.json())
         .then((d) => {
            setPeople(d.people || []);
            setTrending(d.trending || []);
         })
         .catch(() => {});
   }, []);

   // =========================================
   // CREATE POST
   // =========================================
   const handlePost = async () => {
      if (!content.trim() || posting) return;
      setPosting(true);

      try {
         const res = await fetch("/api/townhall", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               content,
               businessId: activeBusiness?.id,
               businessName: activeBusiness?.name || "",
            }),
         });

         if (res.ok) {
            setContent("");
            await loadPosts();
         }
      } finally {
         setPosting(false);
      }
   };

   // =========================================
   // LIKE
   // =========================================
   const handleLike = async (postId: string) => {
      // Optimistic
      setPosts((prev) =>
         prev.map((p) =>
            p.id === postId
               ? {
                    ...p,
                    liked: !p.liked,
                    stats: {
                       ...p.stats,
                       likes: p.liked ? p.stats.likes - 1 : p.stats.likes + 1,
                    },
                 }
               : p,
         ),
      );

      await fetch(`/api/townhall/${postId}/like`, { method: "POST" });
   };

   // =========================================
   // FOLLOW
   // =========================================
   const handleFollow = async (
      userId: string,
      source: "post" | "suggestion",
   ) => {
      const res = await fetch("/api/townhall/follow", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ userId }),
      });

      if (!res.ok) return;
      const data = await res.json();

      if (source === "suggestion") {
         setPeople((prev) =>
            prev.map((p) =>
               p.id === userId ? { ...p, isFollowing: data.following } : p,
            ),
         );
      } else {
         setPosts((prev) =>
            prev.map((p) =>
               p.author.id === userId
                  ? { ...p, isFollowing: data.following }
                  : p,
            ),
         );
      }
   };

   // =========================================
   // FORMAT
   // =========================================
   const formatTime = (t: string) => {
      const d = new Date(t);
      const diff = Date.now() - d.getTime();
      if (diff < 60000) return "now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
   };

   const formatNumber = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
      return n.toString();
   };

   return (
      <div className={styles.layout}>
         {/* =========================================
          MIDDLE: FEED
          ========================================= */}
         <div className={styles.feed}>
            {/* Header */}
            <div className={styles.feedHeader}>
               <div className={styles.feedTitle}>
                  Townhall <span className={styles.onlineDot} />
               </div>
               <div className={styles.feedTabs}>
                  {(["all", "following", "joined"] as Tab[]).map((t) => (
                     <button
                        key={t}
                        className={`${styles.feedTab} ${
                           tab === t ? styles.feedTabActive : ""
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
               <div className={styles.composerTop}>
                  <div className={styles.composerAvatar}>DZ</div>
                  <input
                     className={styles.composerInput}
                     placeholder="Your next post could blow up..."
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                           e.preventDefault();
                           handlePost();
                        }
                     }}
                  />
               </div>

               <div className={styles.composerActions}>
                  <div className={styles.composerIcons}>
                     <button className={styles.composerIcon} aria-label="Image">
                        <ImageIcon size={18} />
                     </button>
                     <button className={styles.composerIcon} aria-label="GIF">
                        <span className={styles.gifLabel}>GIF</span>
                     </button>
                     <button className={styles.composerIcon} aria-label="Emoji">
                        <Smile size={18} />
                     </button>
                     <button className={styles.composerIcon} aria-label="Poll">
                        <BarChart3 size={18} />
                     </button>
                     <button className={styles.composerIcon} aria-label="Price">
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
                        disabled={!content.trim() || posting}
                     >
                        {posting ? "Posting..." : "Post"}
                     </button>
                  </div>
               </div>

               {activeBusiness && (
                  <div className={styles.composerContext}>
                     Posting as <strong>{activeBusiness.name}</strong>
                  </div>
               )}
            </div>

            {/* People to Follow */}
            {tab === "joined" && people.length > 0 && (
               <div className={styles.peopleToFollow}>
                  <div className={styles.pfHeader}>
                     <div className={styles.pfTitle}>People to follow</div>
                     <div className={styles.pfSub}>
                        Follow creators to see their posts in your feed
                     </div>
                  </div>
                  <div className={styles.pfGrid}>
                     {people.slice(0, 9).map((p) => (
                        <div key={p.id} className={styles.pfCard}>
                           <div className={styles.pfAvatar}>{p.avatar}</div>
                           <div className={styles.pfName}>{p.name}</div>
                           <div className={styles.pfBio}>{p.bio}</div>
                           <button
                              className={`${styles.pfFollowBtn} ${
                                 p.isFollowing ? styles.pfFollowingBtn : ""
                              }`}
                              onClick={() => handleFollow(p.id, "suggestion")}
                           >
                              {p.isFollowing ? "Following" : "Follow"}
                           </button>
                        </div>
                     ))}
                  </div>
                  <button className={styles.pfDiscoverBtn}>
                     Discover more people
                  </button>
               </div>
            )}

            {/* Posts */}
            {loading ? (
               <div className={styles.loading}>Loading posts...</div>
            ) : posts.length === 0 ? (
               <div className={styles.emptyFeed}>
                  <div className={styles.emptyFeedCard}>
                     <div className={styles.skeletonRow} />
                     <div className={styles.skeletonLine} />
                     <div className={styles.skeletonLine} />
                     <div className={styles.skeletonLine} />
                  </div>
                  <div className={styles.emptyFeedTitle}>
                     Looks like there aren&apos;t any posts yet.
                  </div>
                  <div className={styles.emptyFeedSub}>
                     Be the first one to make a post!
                  </div>
               </div>
            ) : (
               posts.map((post) => (
                  <article key={post.id} className={styles.post}>
                     {/* Left avatar column */}
                     <div className={styles.postLeft}>
                        <div className={styles.postAvatar}>
                           {post.author.avatar}
                        </div>
                     </div>

                     {/* Post body */}
                     <div className={styles.postBody}>
                        {/* Header */}
                        <div className={styles.postHeader}>
                           <div className={styles.postAuthorRow}>
                              <span className={styles.postAuthorName}>
                                 {post.author.name}
                                 {post.author.verified && (
                                    <ShieldCheck
                                       size={14}
                                       className={styles.verified}
                                    />
                                 )}
                              </span>
                              <span className={styles.postHandle}>
                                 @{post.author.username}
                              </span>
                              <span className={styles.postDot}>·</span>
                              <span className={styles.postTime}>
                                 {formatTime(post.createdAt)}
                              </span>
                           </div>
                           <div className={styles.postActions}>
                              {!post.isFollowing && post.author.id !== "me" && (
                                 <button
                                    className={styles.followSmallBtn}
                                    onClick={() =>
                                       handleFollow(post.author.id, "post")
                                    }
                                 >
                                    Follow
                                 </button>
                              )}
                              <button className={styles.iconSmall}>
                                 <Share2 size={16} />
                              </button>
                              <button className={styles.iconSmall}>
                                 <MoreHorizontal size={16} />
                              </button>
                           </div>
                        </div>

                        {/* Forum tag */}
                        <div className={styles.postForum}>{post.forum}</div>

                        {/* Content */}
                        <div className={styles.postContent}>{post.content}</div>

                        {/* Media card */}
                        {post.media && post.media.url && (
                           <div className={styles.mediaCard}>
                              {post.media.type === "image" && (
                                 <div className={styles.mediaImage}>
                                    <img
                                       src={post.media.url}
                                       alt="Post media"
                                       className={styles.mediaImg}
                                    />
                                 </div>
                              )}

                              {post.media.type === "link" && (
                                 <>
                                    {post.media.price !== undefined && (
                                       <div className={styles.mediaTop}>
                                          <div className={styles.mediaPrice}>
                                             ${post.media.price}
                                          </div>
                                          {post.media.isOpen && (
                                             <div className={styles.mediaOpen}>
                                                <span
                                                   className={styles.openDot}
                                                />
                                                Open
                                             </div>
                                          )}
                                       </div>
                                    )}

                                    {post.media.title && (
                                       <div className={styles.mediaTitle}>
                                          {post.media.title}
                                       </div>
                                    )}
                                    {post.media.description && (
                                       <div className={styles.mediaDescription}>
                                          {post.media.description}
                                       </div>
                                    )}

                                    {post.media.rating !== undefined && (
                                       <div className={styles.mediaRating}>
                                          <span className={styles.stars}>
                                             ★★★★★
                                          </span>
                                          <span>
                                             {post.media.rating} (
                                             {post.media.reviewCount})
                                          </span>
                                       </div>
                                    )}
                                 </>
                              )}
                           </div>
                        )}

                        {/* Stats */}
                        <div className={styles.postFooter}>
                           <button className={styles.postStat}>
                              <MessageCircle size={16} />
                              <span>{post.stats.comments}</span>
                           </button>
                           <button
                              className={`${styles.postStat} ${
                                 post.liked ? styles.postStatLiked : ""
                              }`}
                              onClick={() => handleLike(post.id)}
                           >
                              <Heart
                                 size={16}
                                 fill={post.liked ? "currentColor" : "none"}
                              />
                              <span>{post.stats.likes}</span>
                           </button>
                           <button className={styles.postStat}>
                              <BarChart3 size={16} />
                              <span>{formatNumber(post.stats.views)}</span>
                           </button>
                           <button className={styles.postStat}>
                              <Share2 size={16} />
                           </button>
                        </div>
                     </div>
                  </article>
               ))
            )}
         </div>

         {/* =========================================
          RIGHT: SIDEBAR
          ========================================= */}
         <aside className={styles.sidebar}>
            {tab === "joined" && trending.length > 0 ? (
               <div className={styles.trendingCard}>
                  <div className={styles.sidePanelHeader}>
                     <div className={styles.sidePanelTitle}>Trending whops</div>
                     <Link href="/discover" className={styles.exploreLink}>
                        Explore
                     </Link>
                  </div>
                  <div className={styles.trendingList}>
                     {trending.slice(0, 10).map((w) => (
                        <div key={w.id} className={styles.trendingItem}>
                           <div className={styles.trendingAvatar}>
                              {w.initial}
                           </div>
                           <div className={styles.trendingInfo}>
                              <div className={styles.trendingName}>
                                 {w.name}
                              </div>
                              <div className={styles.trendingMeta}>
                                 <Star size={11} className={styles.starIcon} />
                                 <span>{w.rating.toFixed(1)}</span>
                                 <span className={styles.trendingDot}>·</span>
                                 <span>{formatNumber(w.members)}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            ) : (
               <div className={styles.usersCard}>
                  <div className={styles.sidePanelHeader}>
                     <div className={styles.sidePanelTitle}>Popular users</div>
                     <button className={styles.seeAllBtn}>See all</button>
                  </div>
                  <div className={styles.usersList}>
                     {people.slice(0, 10).map((u) => (
                        <div key={u.id} className={styles.userItem}>
                           <div className={styles.userAvatarWrap}>
                              <div className={styles.userAvatar}>
                                 {u.avatar}
                              </div>
                              <span className={styles.userOnlineDot} />
                           </div>
                           <div className={styles.userInfo}>
                              <div className={styles.userName}>{u.name}</div>
                              <div className={styles.userBio}>{u.bio}</div>
                           </div>
                           <button
                              className={`${styles.followBtn} ${
                                 u.isFollowing ? styles.followingBtn : ""
                              }`}
                              onClick={() => handleFollow(u.id, "suggestion")}
                           >
                              {u.isFollowing ? "Following" : "Follow"}
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </aside>
      </div>
   );
}
