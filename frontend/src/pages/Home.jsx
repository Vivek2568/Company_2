import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import HomeHero from "../components/HomeHero";
import HomePostCard from "../components/HomePostCard";
import { useAuth } from "../context/AuthContext";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [categories, setCategories] = useState([]);
  const [commentsCount, setCommentsCount] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [page, category, tag]);

  // Helper to format counts (e.g., 1200 -> 1.2k)
  const formatCount = (n) => {
    if (!n && n !== 0) return "0";
    if (n < 1000) return n.toString();
    return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
  };

  // When posts change, fetch comment counts for displayed posts
  useEffect(() => {
    const fetchCommentsCounts = async () => {
      try {
        if (!posts || posts.length === 0) return;
        const promises = posts.map((p) =>
          axios
            .get(`/api/comments/${p._id}`)
            .then((res) => ({ id: p._id, count: Array.isArray(res.data) ? res.data.length : 0 }))
            .catch(() => ({ id: p._id, count: 0 }))
        );
        const results = await Promise.all(promises);
        const map = {};
        results.forEach((r) => {
          map[r.id] = r.count;
        });
        setCommentsCount(map);
      } catch (err) {
        console.error("Error fetching comment counts", err);
      }
    };
    fetchCommentsCounts();
  }, [posts]);

  const handleLike = async (e, post) => {
    e.stopPropagation();
    try {
      if (!user) return navigate('/login');
      const res = await axios.post(`/api/posts/${post._id}/like`);
      if (res && res.data) {
        const { id, likes } = res.data;
        setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, likes: Array(likes).fill(null) } : p)));
      }
    } catch (err) {
      console.error('Error liking post', err);
    }
  };

  const handleCommentClick = (e, post) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    navigate(`/posts/${post._id}#comments`);
  };

  const fetchPosts = async () => {
    try {
      const params = { page, limit: 10 };
      if (category) params.category = category;
      if (tag) params.tag = tag;
      const response = await axios.get("/api/posts", { params });
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  if (loading) return <Loader />;

  const latestPosts = posts.slice(0, 6);

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-display text-slate-800 dark:text-slate-200 bg-[#FFFBEB] page-bg">
      {/* HERO SECTION */}
      <HomeHero />

    {/* LATEST POSTS */}
    <section
      id="latest"
      className="flex w-full flex-col items-center bg-white px-6 py-16 dark:bg-background-dark/80 md:px-12 lg:px-16 md:py-24"
    >
      <div className="flex w-full max-w-7xl flex-col gap-12">
        <div className="flex flex-col items-center gap-3">
          <h4 className="text-sm font-bold uppercase tracking-widest text-[#4d7399] dark:text-slate-400">
            Latest from the Community
          </h4>
          <div className="h-1 w-16 bg-[#FFD84D]"></div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {latestPosts.map((post) => {
            const imageUrl = post.images?.[0]
              ? `http://localhost:5000/uploads/${post.images[0]}`
              : (post.thumbnail || "https://via.placeholder.com/400");
            
            return (
              <HomePostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onComment={handleCommentClick}
                formatCount={formatCount}
                imageUrl={imageUrl}
                user={user}
              />
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-4 pt-8">
          {page > 1 && (
            <button
              onClick={() => setPage(page - 1)}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-slate-800"
            >
              <FaArrowLeft className="text-lg" />
              Previous
            </button>
          )}
          {page < totalPages && (
            <button
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-slate-800"
            >
              Next
              <FaArrowRight className="text-lg" />
            </button>
          )}
        </div>
      </div>
    </section>

    {/* CTA SECTION */}
    <section className="flex w-full flex-col items-center bg-background-light px-4 py-16 dark:bg-background-dark sm:px-8 md:py-24">
      <div className="flex max-w-2xl flex-col items-center justify-center gap-6 text-center">
        <h1 className="text-4xl font-black leading-tight tracking-tighter text-[#0e141b] dark:text-slate-50 md:text-5xl">
          Ready to Share Your Voice?
        </h1>
        <p className="max-w-xl text-base font-normal leading-normal text-[#4d7399] dark:text-slate-400 md:text-lg">
          Join a community of creators and start building your audience today.
          It's free to get started.
        </p>
        <div className="flex justify-center">
          <Link
            to="/signup"
            className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#FFD84D] px-6 text-base font-bold leading-normal tracking-[0.015em] text-slate-900 transition-transform hover:scale-105"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </section>
  </main>
);
};

export default Home;