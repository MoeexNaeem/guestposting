import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import {
  TrendingUp,
  Shield,
  ExternalLink,
  Search,
  Plus,
  UserCircle,
  CheckCircle2,
  SlidersHorizontal,
  Loader2,
  X,
  AlertCircle,
  ShoppingCart,
  RefreshCw,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // User Data
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const canAddSite = userInfo?.role === "seller" || userInfo?.role === "admin";

  // Custom UX States
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [confirmModal, setConfirmModal] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [filters, setFilters] = useState({
    minDA: "",
    maxDA: "",
    minTraffic: "",
    maxTraffic: "",
    minPrice: "",
    maxPrice: "",
  });
  const [sortBy, setSortBy] = useState("default");

  const showNotification = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
  };

  const fetchListings = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category !== "All") params.append("category", category);
      if (sortBy !== "default") params.append("sort", sortBy);

      Object.keys(filters).forEach((key) => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const { data } = await api.get(`/listings?${params.toString()}`);
      setListings(data);
    } catch (err) {
      showNotification("error", "Failed to sync marketplace data.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchListings();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category, filters, sortBy]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const executePurchase = async (listingId) => {
    setPurchaseLoading(true);
    try {
      await api.post("/orders", { listingId });
      setConfirmModal(null);
      navigate("/orders");
    } catch (err) {
      showNotification(
        "error",
        err.response?.data?.message || "Check your balance and try again.",
      );
    } finally {
      setPurchaseLoading(false);
    }
  };

  const categories = [
    "All",
    "Technology",
    "Health & Fitness",
    "Business & Finance",
    "Real Estate",
    "Crypto",
    "Lifestyle",
    "General",
  ];

  return (
    <div className="max-w-7xl mx-auto pb-40 relative">
      {/* Notifications */}
      {alert.show && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-4 rounded-xl flex items-start gap-3 border shadow-2xl ${
            alert.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          } animate-in fade-in slide-in-from-top-4 duration-300`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-red-500 mt-0.5" />
          )}
          <p className="text-[13px] font-medium flex-1">{alert.message}</p>
          <button
            onClick={() => setAlert({ show: false, type: "", message: "" })}
            className="opacity-50 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Marketplace
          </h1>
          <p className="text-[14px] text-slate-500 font-medium mt-1">
            Discover high-authority domains for your SEO campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search domains..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          {/* RBAC BUTTON LOGIC: Add Site for Sellers/Admins, Refresh for Buyers */}
          {canAddSite ? (
            <button
              onClick={() => navigate("/add-listing")}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all shadow-lg shadow-slate-200 flex items-center gap-2 whitespace-nowrap active:scale-95"
            >
              <Plus size={18} /> Add Site
            </button>
          ) : (
            <button
              onClick={() => fetchListings(true)}
              disabled={isRefreshing}
              className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <RefreshCw
                size={18}
                className={isRefreshing ? "animate-spin" : ""}
              />
              {isRefreshing ? "Refreshing..." : "Refresh Marketplace"}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <SlidersHorizontal size={14} /> Catalog Filters
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-700">
                  Niche Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium outline-none appearance-none focus:border-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-700">
                  Domain Authority
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minDA"
                    placeholder="Min"
                    value={filters.minDA}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-center outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    name="maxDA"
                    placeholder="Max"
                    value={filters.maxDA}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-center outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-700">
                  Monthly Traffic
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minTraffic"
                    placeholder="Min"
                    value={filters.minTraffic}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-center outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    name="maxTraffic"
                    placeholder="Max"
                    value={filters.maxTraffic}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-center outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setFilters({
                      minDA: "",
                      maxDA: "",
                      minTraffic: "",
                      maxTraffic: "",
                      minPrice: "",
                      maxPrice: "",
                    });
                    setCategory("All");
                    setSearch("");
                  }}
                  className="w-full py-2 text-[11px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-wider transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[13px] font-medium text-slate-500">
              Showing{" "}
              <span className="text-slate-900 font-bold">
                {listings.length}
              </span>{" "}
              Results
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-[13px] font-semibold text-slate-900 focus:ring-0 cursor-pointer"
              >
                <option value="default">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="da_desc">Highest Authority</option>
                <option value="traffic_desc">Highest Traffic</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2
                  size={32}
                  className="animate-spin mb-4 text-blue-500"
                />
                <p className="text-[14px] font-semibold tracking-tight">
                  Syncing Marketplace...
                </p>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-20 flex flex-col items-center justify-center text-center">
                <Search
                  size={48}
                  strokeWidth={1}
                  className="mb-4 text-slate-200"
                />
                <p className="text-[16px] font-semibold text-slate-900">
                  No sites found.
                </p>
                <p className="text-[14px] text-slate-500 mt-1">
                  Try broadening your search criteria.
                </p>
              </div>
            ) : (
              listings.map((listing) => (
                <div
                  key={listing._id}
                  className={`bg-white border rounded-2xl p-6 shadow-sm transition-all flex flex-col sm:flex-row items-center justify-between gap-6 relative ${
                    listing.isFeatured
                      ? "border-amber-200 bg-amber-50/20"
                      : "border-slate-200 hover:border-blue-200"
                  } ${confirmModal === listing._id ? "z-40 ring-4 ring-blue-500/10 border-blue-400" : "z-10"}`}
                >
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-slate-900 text-[17px] tracking-tight">
                        {listing.url.replace(/^https?:\/\/(www\.)?/, "")}
                      </span>
                      <a
                        href={listing.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-300 hover:text-blue-600"
                      >
                        <ExternalLink size={16} />
                      </a>
                      {listing.isFeatured && (
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded ml-2">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-1 rounded-md border border-slate-200/50">
                        {listing.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <UserCircle size={14} className="text-slate-400" />
                        <Link
                          to={`/seller/${listing.seller?._id}`}
                          className="text-[13px] font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                        >
                          {listing.seller?.name || "Verified Vendor"}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          DA
                        </p>
                        <p className="text-[15px] font-bold text-slate-900 flex items-center justify-center gap-1">
                          <Shield size={14} className="text-blue-500" />{" "}
                          {listing.da}
                        </p>
                      </div>
                      <div className="text-center border-l border-slate-100 pl-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Traffic
                        </p>
                        <p className="text-[15px] font-bold text-slate-900 flex items-center justify-center gap-1">
                          <TrendingUp size={14} className="text-emerald-500" />{" "}
                          {listing.traffic.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right border-l border-slate-100 pl-8">
                      <p className="text-2xl font-bold text-slate-900 mb-1">
                        ${listing.price}
                      </p>
                      <button
                        onClick={() =>
                          setConfirmModal(
                            confirmModal === listing._id ? null : listing._id,
                          )
                        }
                        className={`px-6 py-2 rounded-xl text-[13px] font-bold transition-all shadow-md ${
                          confirmModal === listing._id
                            ? "bg-slate-100 text-slate-700"
                            : "bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700"
                        }`}
                      >
                        {confirmModal === listing._id ? "Cancel" : "Buy Post"}
                      </button>
                    </div>

                    {/* Order Popover */}
                    {confirmModal === listing._id && (
                      <div className="absolute right-0 top-[calc(100%+12px)] w-full sm:w-[320px] bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 animate-popover overflow-hidden text-left">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                          <ShoppingCart size={16} className="text-blue-600" />
                          <span className="text-[13px] font-bold text-slate-900 uppercase">
                            Checkout Review
                          </span>
                        </div>
                        <div className="p-5 space-y-3">
                          <div className="flex justify-between text-[13px] font-medium">
                            <span className="text-slate-500">
                              Domain Authority
                            </span>
                            <span className="text-slate-900">
                              DA {listing.da}
                            </span>
                          </div>
                          <div className="flex justify-between text-[13px] font-medium">
                            <span className="text-slate-500">Service Fee</span>
                            <span className="text-emerald-600 font-bold">
                              $0.00
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                            <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">
                              Total cost
                            </span>
                            <span className="text-2xl font-bold text-slate-900">
                              ${listing.price}
                            </span>
                          </div>
                          <button
                            onClick={() => executePurchase(listing._id)}
                            disabled={purchaseLoading}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl text-[14px] font-bold mt-4 hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {purchaseLoading ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              "Confirm Payment"
                            )}
                          </button>
                          <p className="text-[10px] text-center text-slate-400 font-semibold uppercase tracking-tighter mt-2">
                            Funds protected by LetRank Escrow
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popover {
          0% { opacity: 0; transform: scale(0.95) translateY(-8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-popover { animation: popover 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Dashboard;
