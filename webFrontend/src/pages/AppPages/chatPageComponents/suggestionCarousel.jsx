import React from 'react';
import './suggestionCarousel.css';

// Data for the suggestion cards. I've used some of the images you provided.
const suggestions = [
  {
    title: 'Anxiety',
    imageUrl: 'jesusalberto002/haivens/jesusalberto002-Haivens-f06f5eebc8b8ff62bb16211b610eb506c042e73f/backend/public/uploads/communityBanners/postImage-1755090733616.png',
  },
  {
    title: 'Couple Therapy',
    imageUrl: 'jesusalberto002/haivens/jesusalberto002-Haivens-f06f5eebc8b8ff62bb16211b610eb506c042e73f/backend/public/uploads/communityBanners/postImage-1755789338971.jpg',
  },
  {
    title: 'Addiction',
    imageUrl: 'jesusalberto002/haivens/jesusalberto002-Haivens-f06f5eebc8b8ff62bb16211b610eb506c042e73f/backend/public/uploads/communityBanners/bannerImage-1755089726775.png',
  },
  {
    title: 'Depression',
    imageUrl: 'jesusalberto002/haivens/jesusalberto002-Haivens-f06f5eebc8b8ff62bb16211b610eb506c042e73f/backend/public/uploads/postImages/postImage-1753886631188.jpg',
  },
  {
    title: 'Loneliness',
    imageUrl: 'jesusalberto002/haivens/jesusalberto002-Haivens-f06f5eebc8b8ff62bb16211b610eb506c042e73f/backend/public/uploads/communityBanners/postImage-1755789759832.png',
  },
  {
      title: 'Low self-esteem',
      imageUrl: 'jesusalberto002/haivens/jesusalberto002-Haivens-f06f5eebc8b8ff62bb16211b610eb506c042e73f/backend/public/uploads/communityBanners/postImage-1755860204587.jpg'
  }
];

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