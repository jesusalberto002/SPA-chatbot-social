import React from 'react';
import './suggestionCarousel.css';

const SuggestionCard = ({ title, imageUrl, onClick }) => (
  <button onClick={onClick} className="suggestion-card">
    <img src={imageUrl} alt={title} />
    <span className="suggestion-card-title">{title}</span>
  </button>
);

const SuggestionCarousel = ({ onSuggestionClick }) => {
  return (
    <div className="suggestion-carousel-container">
      <div className="suggestion-carousel-content">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="suggestion-carousel-item">
            <SuggestionCard
              title={suggestion.title}
              imageUrl={suggestion.imageUrl}
              onClick={() => onSuggestionClick(suggestion.title)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionCarousel;