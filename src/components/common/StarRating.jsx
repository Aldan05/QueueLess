import React from 'react';
import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

/**
 * StarRating component for displaying and selecting star ratings.
 * 
 * Props:
 * - rating: Number (e.g. 4.4)
 * - totalReviews: Number (optional, e.g. 1245)
 * - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * - showCount: Boolean (default true if totalReviews is provided)
 * - showScore: Boolean (default true)
 * - interactive: Boolean (default false)
 * - onRatingChange: Function (callback when star is clicked in interactive mode)
 * - hoverRating: Number (for interactive hover preview)
 * - setHoverRating: Function (for interactive hover preview)
 */
const StarRating = ({
  rating = 0,
  totalReviews = null,
  size = 'md',
  showScore = true,
  showCount = true,
  interactive = false,
  onRatingChange = null,
  hoverRating = null,
  setHoverRating = null,
  className = ''
}) => {
  const rawRating = hoverRating !== null && hoverRating !== undefined ? Number(hoverRating) : Number(rating) || 0;
  const currentRating = Math.min(5, Math.max(0, rawRating));

  // Size mapping
  const sizeMap = {
    xs: { star: 'w-3 h-3 text-xs', text: 'text-[11px]', gap: 'gap-0.5' },
    sm: { star: 'w-3.5 h-3.5 text-xs', text: 'text-xs', gap: 'gap-1' },
    md: { star: 'w-4 h-4 text-sm', text: 'text-sm', gap: 'gap-1.5' },
    lg: { star: 'w-5 h-5 text-base', text: 'text-base', gap: 'gap-2' },
    xl: { star: 'w-7 h-7 text-xl', text: 'text-lg', gap: 'gap-2.5' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((starValue) => {
      const isFilled = currentRating >= starValue;
      const isHalf = !isFilled && currentRating >= starValue - 0.5;

      if (interactive) {
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onRatingChange && onRatingChange(starValue)}
            onMouseEnter={() => setHoverRating && setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating && setHoverRating(null)}
            className="p-1 text-yellow-400 hover:scale-125 transition-transform focus:outline-none cursor-pointer"
            aria-label={`${starValue} Star`}
          >
            {isFilled ? (
              <FaStar className={`${currentSize.star} fill-amber-400 text-amber-400 drop-shadow-sm`} />
            ) : isHalf ? (
              <FaStarHalfAlt className={`${currentSize.star} fill-amber-400 text-amber-400`} />
            ) : (
              <FaRegStar className={`${currentSize.star} text-gray-300 dark:text-gray-600 hover:text-amber-300`} />
            )}
          </button>
        );
      }

      return (
        <span key={starValue} className="inline-flex items-center">
          {isFilled ? (
            <FaStar className={`${currentSize.star} text-amber-400 drop-shadow-sm`} />
          ) : isHalf ? (
            <FaStarHalfAlt className={`${currentSize.star} text-amber-400 drop-shadow-sm`} />
          ) : (
            <FaRegStar className={`${currentSize.star} text-gray-300 dark:text-gray-600`} />
          )}
        </span>
      );
    });
  };

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      {/* Stars cluster */}
      <div className="flex items-center">{renderStars()}</div>

      {/* Numerical score */}
      {showScore && !interactive && (
        <span className={`font-black text-gray-900 dark:text-white ${currentSize.text} tracking-tight`}>
          {currentRating.toFixed(1)}
        </span>
      )}

      {/* Reviews count badge */}
      {showCount && totalReviews !== null && !interactive && (
        <span className={`font-semibold text-gray-500 dark:text-gray-400 ${currentSize.text}`}>
          ({totalReviews === 1 ? '1 Review' : `${totalReviews.toLocaleString()} Reviews`})
        </span>
      )}
    </div>
  );
};

export default StarRating;
