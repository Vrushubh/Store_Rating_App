import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const handleStarClick = (starRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`star ${sizeClasses[size]} ${
            star <= rating ? 'star-filled' : 'star-empty'
          } ${!readonly ? 'hover:scale-110' : ''}`}
          onClick={() => handleStarClick(star)}
        />
      ))}
    </div>
  );
};

export default RatingStars;
