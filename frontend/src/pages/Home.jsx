import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { FaHeart, FaComment, FaArrowRight, FaArrowLeft } from "react-icons/fa6";

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
  <main
    className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-display text-slate-800 dark:text-slate-200 bg-[#FFFBEB] page-bg"
  >
    {/* HERO SECTION */}
    <section className="relative flex h-auto min-h-[75vh] w-full flex-col">
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
        {/* Left Side */}
        <div className="flex flex-col items-center justify-center gap-8 p-8 py-16 text-center lg:p-12 lg:text-left">
          <div className="flex max-w-lg flex-col gap-6">
            <h1 className="text-5xl font-black leading-tight tracking-tighter text-[#0e141b] dark:text-slate-50 md:text-6xl">
              Share Your Story With the World
            </h1>
            <h2 className="text-base font-normal leading-normal text-[#4d7399] dark:text-slate-400 md:text-lg">
              Write, record, and express ideas that connect people.
            </h2>
          </div>
          <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              to="/create-post"
              className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#FFD84D] px-6 text-base font-bold leading-normal tracking-[0.015em] text-slate-900 transition-transform hover:scale-105"
            >
              Get Started
            </Link>
            <a
              href="#latest"
              className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-transparent px-6 text-base font-bold leading-normal tracking-[0.015em] text-[#0e141b] transition-colors hover:bg-slate-200/50 dark:border-slate-700 dark:text-slate-50 dark:hover:bg-slate-800/50"
            >
              Explore Content
            </a>
          </div>
        </div>

        {/* Right Side Collage */}
        <div className="relative hidden h-full min-h-[400px] items-center justify-center p-8 lg:flex">
          <div className="grid h-full w-full max-w-2xl grid-cols-4 grid-rows-4 gap-4">
            <div
              className="col-span-2 row-span-2 transform rounded-[1.5rem] bg-cover bg-center transition-all duration-300 ease-in-out hover:scale-105"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBA_MoTCHgXplOzcKsyueiAbGx4ZxO9DOOnVmvklir5boSRx2Vbe0jTqXQZHgIh1UDZEXeFV0BDnifihT1UFvQ-m8TvhDy7qPrOm4ztIdrVzJNCp1_QyrxTgQ46Frv_mElrV-Dfq4RTkIWSuH1cRpjkJl5nU8CirjkMyz5HboKPDo1L9dbqbPm3hvSPgGjMHizaxwxsEyz4iYbxE94owxzda4S7iV6VaIBTUgq73eNwZV4XJqZyFIzXHZ2zace8kajxWdW0TPlkbRI')`,
              }}
            ></div>

            <div
              className="col-span-2 row-start-3 transform rounded-[1.5rem] bg-cover bg-center opacity-70 transition-all duration-300 ease-in-out hover:z-10 hover:scale-105 hover:opacity-100"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwDJ2Togzcviw7R2gTUC0QE1SYw2qEAq-L2YyOXTUPoiuvSbMb1GZcPlV1PeJ1jo9zOgkm3yrDQ4hxR-XS90vWuIVbgWWcCzmxO5yUbSTNyHE370Ds39g-TJf8WHvdSxhFxvcw5lSKaseft0ufVLVnPYbjLOfJhkmo0Cj8DHJrYZKLqeJsFDbxLl2cc8yT2FFwAo1PpRd5grm1bES4fAv0t4gs9GDFFjwens58H1uvoGoQDmwNR2a1tl0eDWmTNAoE7FvtBI6agWY')`,
              }}
            ></div>

            <div
              className="col-span-2 col-start-3 row-span-3 transform rounded-[1.5rem] bg-cover bg-center opacity-80 transition-all duration-300 ease-in-out hover:z-10 hover:scale-105 hover:opacity-100"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBNoyKCpgPm60npITve2zaPAnIcQDeWx4x91RMwII6GxBK4suGC6-qlxfpz4MIK3_J6_YqiiTS2fgCToOAfgWC7o_RxcN9CYHMiJdXNWXit36RgUQ2mt6qCBZSAn2tD7PumUjI74iBpQ5J7G7Quc9lQBOVZLtVPhGxzymfx-kN62_pi5Yrw79iXQozT2MHZ-ABhLeRrQxsPk24-Uu0Qn0XfYTJvI74T93T-2EVitoShGsYiYoctMKT0ZtuTKxZjNrz3Wio8t7MklJo')`,
              }}
            ></div>

            <div
              className="row-span-2 row-start-3 transform rounded-[1.5rem] bg-cover bg-center opacity-90 transition-all duration-300 ease-in-out hover:z-10 hover:scale-105 hover:opacity-100"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDY-vWGa9bp5_YOrpss_TufY17fvDyLCosHLK0hDVbqOVagg97wal0gM1tP-0ZWRuSNfKcRBgYanf4yfEQkVsGda5A63ZMiCEW-m9w8h_kuV53RrWWYmehKecceNbtjp6gR7YxzwJinqKcUaPPK8MECu5HgcCD4v3d_41WKmAcTpn7iqCfGypN7C3sHXJP8wkS6fQIKkt45vtIO1_DHdB_4UtPriqCyFlPxkXtjAgxKFFzbFjsXiaJDpJyVrcoM8EHOreS-n56zXwY')`,
              }}
            ></div>

            <div
              className="col-start-2 row-start-4 transform rounded-[1.5rem] bg-cover bg-center opacity-60 transition-all duration-300 ease-in-out hover:z-10 hover:scale-105 hover:opacity-100"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEem1mJMH3Yg0I1ci3RIHc5uSITPZWLJfgUsVNDdE-Fb7stYcOTH8H2LfNYupSL9vqg2lX2CIFv4AkC2MtBeYAx9jEkx_RYmAdifWxBrQjLJeVovA1nr2O1xQTBgC5ULJUoDmvlsfJzFq9j3D16tdH8CspiCHmgWq5Ud2Zo-7MJyfXBz6noNo-JzEntrsTOvkkGqYPNueM8s5TRcdLsFFEb9oZzHXRUZok1a-s0_i_P_SpQOycMdsON-v2Dv9xfdLUyVFJW6q003s')`,
              }}
            ></div>

            <div
              className="col-start-4 row-start-4 transform rounded-[1.5rem] bg-cover bg-center opacity-50 transition-all duration-300 ease-in-out hover:z-10 hover:scale-105 hover:opacity-100"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDobL11HrXvtDy2o4BNPLbt4fQBwCAnk_rKfrjkGXS7xuO-xSWokapE-APZi-r0fjTXdwn3YPBlrP_HjQQ4FJAB-O4cS5-7dDfw9_j73aZv6E457zVSE4ZN10d-N6cOh9lHjYkjqV57vlcShM9k5tgMpDoa2ZCeNefGirgDx7JhRrMpHDf1o2Mr99dTzT-HcxGQZNGrJSEmWAnVyi0XuFb8N4RaGMSYqhy_Q-GhhQTMr6Ntdjwasi6u9tLFFxHfhgdwgmfLZhaAWmI')`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </section>

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
              <article
                key={post._id}
                className="group flex flex-col pb-6 border-b border-slate-200 dark:border-slate-700"
              >
                {/* Image */}
                <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  ></div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3">
                  {/* Author & Date */}
                  <div className="flex items-center gap-2 text-xs text-[#4d7399] dark:text-slate-400">
                    <span className="font-medium">{post.author.username}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {/* Title */}
                  <h3 className="line-clamp-2 text-xl font-bold leading-tight text-[#0e141b] transition-colors group-hover:text-blue-600 dark:text-slate-50 dark:group-hover:text-blue-400" style={{ fontFamily: 'Georgia, serif' }}>
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="line-clamp-3 flex-1 text-base leading-relaxed text-slate-600 dark:text-slate-300" style={{ fontFamily: 'Georgia, serif' }}>
                    {post.excerpt || post.content.replace(/<[^>]+>/g, "").slice(0, 150) + "..."}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                      <button
                        onClick={(e) => handleLike(e, post)}
                        className="flex items-center gap-1 text-xs transition-colors hover:text-red-500"
                      >
                        <FaHeart className="text-base" />
                        <span>{formatCount(post.likes ? post.likes.length : 0)}</span>
                      </button>
                      <button
                        onClick={(e) => handleCommentClick(e, post)}
                        className="flex items-center gap-1 text-xs transition-colors hover:text-blue-500"
                      >
                        <FaComment className="text-base" />
                        <span>{formatCount(commentsCount[post._id] || 0)}</span>
                      </button>
                    </div>

                    <Link
                      to={`/posts/${post._id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-[#0e141b] transition-colors hover:text-blue-600 dark:text-slate-50"
                    >
                      Read more
                      <FaArrowRight className="text-base" />
                    </Link>
                  </div>
                </div>
              </article>
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