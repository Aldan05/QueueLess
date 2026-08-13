import React, { useState, useEffect } from 'react';
import { FiStar, FiMessageSquare, FiTrendingUp, FiThumbsUp, FiShield, FiCheckCircle, FiFilter, FiClock, FiUser } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import StarRating from '../../components/common/StarRating';

const BusinessReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState('All');
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  const { currentUser } = useAuth();
  const { businesses, socket } = useDatabase();
  
  const business = businesses.find(b => b._id === currentUser?.businessId);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchReviews = async () => {
    if (!business?._id) return;
    try {
      const response = await fetch(`${API_URL}/customer/reviews/${business._id}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setReviews(data);
        } else if (data && data.reviews) {
          setReviews(data.reviews);
          if (data.summary) {
            setSummary(data.summary);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [business?._id, API_URL]);

  useEffect(() => {
    if (!socket || !business?._id) return;
    const handleReviewAdded = (data) => {
      if (data.business?._id === business._id || data.review?.businessId === business._id) {
        fetchReviews();
      }
    };
    const handleReviewUpdated = (data) => {
      if (data.review) {
        setReviews(prev => prev.map(r => r._id === data.review._id ? data.review : r));
      }
    };
    socket.on('reviewAdded', handleReviewAdded);
    socket.on('reviewUpdated', handleReviewUpdated);
    return () => {
      socket.off('reviewAdded', handleReviewAdded);
      socket.off('reviewUpdated', handleReviewUpdated);
    };
  }, [socket, business?._id]);

  if (!business) return null;

  const totalReviews = reviews.length > 0 ? reviews.length : (Number(summary.totalReviews) || Number(business.reviewCount) || 0);

  let rawAvg = 0;
  if (reviews.length > 0) {
    const sum = reviews.reduce((s, r) => s + (Math.min(5, Math.max(1, Number(r.rating) || 5))), 0);
    rawAvg = sum / reviews.length;
  } else if (summary.averageRating && Number(summary.averageRating) <= 5) {
    rawAvg = Number(summary.averageRating);
  } else if (business.rating && Number(business.rating) <= 5) {
    rawAvg = Number(business.rating);
  }
  const averageRating = Math.min(5, Math.max(0, Number(rawAvg) || 0));

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (reviews.length > 0) {
    reviews.forEach(r => {
      const cleanRating = Math.min(5, Math.max(1, Number(r.rating) || 5));
      const star = Math.min(5, Math.max(1, Math.round(cleanRating)));
      ratingCounts[star] = (ratingCounts[star] || 0) + 1;
    });
  } else if (business.ratingDistribution && Object.values(business.ratingDistribution).some(v => v > 0)) {
    Object.keys(ratingCounts).forEach(star => {
      ratingCounts[star] = Number(business.ratingDistribution[star]) || 0;
    });
  } else if (summary.ratingDistribution && Object.values(summary.ratingDistribution).some(v => v > 0)) {
    Object.keys(ratingCounts).forEach(star => {
      ratingCounts[star] = Number(summary.ratingDistribution[star]) || 0;
    });
  }

  const ratingTiers = [
    { stars: 5, label: 'Excellent', count: ratingCounts[5], starVisual: '★★★★★' },
    { stars: 4, label: 'Good', count: ratingCounts[4], starVisual: '★★★★☆' },
    { stars: 3, label: 'Average', count: ratingCounts[3], starVisual: '★★★☆☆' },
    { stars: 2, label: 'Poor', count: ratingCounts[2], starVisual: '★★☆☆☆' },
    { stars: 1, label: 'Very Poor', count: ratingCounts[1], starVisual: '★☆☆☆☆' },
  ];

  const filteredReviews = reviews.filter(r => {
    if (starFilter === 'All') return true;
    return Math.round(r.rating) === Number(starFilter);
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Customer Reviews & Ratings</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Real-time feedback calculation and customer sentiment breakdown.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-black uppercase tracking-wider border border-emerald-200/50 dark:border-emerald-900/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Feedback Feed
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Loading reviews analytics...</div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Average Rating */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Overall Average Rating</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-5xl font-black text-gray-900 dark:text-white">{averageRating.toFixed(1)}</h3>
                  <span className="text-gray-400 font-bold text-xl">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <StarRating rating={averageRating} showScore={false} showCount={false} size="md" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Calculated automatically from all customer feedback
              </p>
            </div>

            {/* Total Reviews */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Verified Reviews</p>
                <h3 className="text-5xl font-black text-gray-900 dark:text-white mb-2">{totalReviews.toLocaleString()}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <FiShield className="w-4 h-4" /> 100% Verified Customer Feedback
              </div>
            </div>

            {/* Rating Distribution Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rating Distribution</p>
                <span className="text-xs font-bold text-gray-400">{totalReviews} Total</span>
              </div>
              <div className="space-y-2.5">
                {ratingTiers.map(tier => {
                  const percentage = totalReviews > 0 ? Math.round((tier.count / totalReviews) * 100) : 0;
                  return (
                    <div key={tier.stars} className="flex items-center text-xs">
                      <span className="w-24 font-bold text-gray-700 dark:text-gray-300">{tier.label} ({tier.stars}★)</span>
                      <div className="flex-1 h-2.5 mx-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            tier.stars >= 4 ? 'bg-emerald-500' : tier.stars === 3 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-gray-500 dark:text-gray-400 font-bold">{tier.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews List with Filtering */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Customer Feedback Log</h3>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">Filter feedback by rating tier</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {['All', '5', '4', '3', '2', '1'].map((starOpt) => {
                  const isActive = starFilter === starOpt;
                  const count = starOpt === 'All' ? reviews.length : ratingCounts[starOpt] || 0;
                  return (
                    <button
                      key={starOpt}
                      type="button"
                      onClick={() => setStarFilter(starOpt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {starOpt === 'All' ? 'All' : `${starOpt} ★`} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-slate-700/60">
              {filteredReviews.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <FiMessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Reviews Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-xs">
                    {reviews.length === 0 ? 'When customers leave feedback, it will appear here in real time.' : 'No reviews match this rating filter.'}
                  </p>
                </div>
              ) : (
                filteredReviews.map(review => {
                  const customerName = review.customerId?.name || 'Customer';
                  const initial = customerName.charAt(0).toUpperCase();

                  return (
                    <div key={review._id} className="p-6 sm:p-8 hover:bg-gray-50/50 dark:hover:bg-slate-750 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                            {initial}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-gray-900 dark:text-white">{customerName}</h4>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                                <FiCheckCircle className="w-3 h-3 text-emerald-500" /> Verified Customer
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {/* Stars Pill */}
                        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-200/50 dark:border-amber-900/30 w-fit">
                          <StarRating rating={review.rating} showScore={true} showCount={false} size="xs" />
                        </div>
                      </div>

                      {/* Sub-ratings */}
                      {(review.waitTimeRating || review.staffBehaviourRating) && (
                        <div className="flex items-center gap-2 mb-3">
                          {review.waitTimeRating && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                              <FiClock className="w-3 h-3 text-blue-500" /> Wait Time: {review.waitTimeRating}/5
                            </span>
                          )}
                          {review.staffBehaviourRating && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                              <FiUser className="w-3 h-3 text-indigo-500" /> Staff Help: {review.staffBehaviourRating}/5
                            </span>
                          )}
                        </div>
                      )}

                      {/* Feedback Quote */}
                      <p className="text-gray-700 dark:text-gray-200 text-sm font-medium leading-relaxed bg-gray-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-gray-100/80 dark:border-slate-800">
                        "{review.feedback}"
                      </p>

                      {/* Helpful votes info */}
                      {review.helpfulCount > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                          <FiThumbsUp className="text-blue-500" />
                          <span>{review.helpfulCount} customers found this review helpful</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BusinessReviews;
