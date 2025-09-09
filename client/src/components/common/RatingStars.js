import React, { useState } from "react";
import { Star } from "lucide-react";

const RatingStars = ({ rating = 0, onRatingChange, readonly = false, size = "md" }) => {
  const [hover, setHover] = useState(0);

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const handleStarClick = (starRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hover || rating);

        return (
          <Star
            key={star}
            className={`${sizeClasses[size]} cursor-pointer transition-transform ${
              !readonly ? "hover:scale-110" : ""
            }`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            fill={isFilled ? "gold" : "none"}
            stroke={isFilled ? "goldenrod" : "gray"}
          />
        );
      })}
    </div>
  );
};

export default RatingStars;
