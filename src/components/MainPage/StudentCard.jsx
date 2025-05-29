import React, { useState } from 'react';

const StudentCard = ({ avatar, name, role, socialLink = '#' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    window.open(socialLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`card student-card ${isHovered ? 'card--hovered' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={avatar} alt={name} className="card__avatar" />
      <div className="card__content">
        <div className="card__title">{name}</div>
        <div className="card__subtitle">{role}</div>
      </div>
      <div className="card__action">
        {isHovered && <span className="card__link-icon">→</span>}
      </div>
    </div>
  );
};

export default StudentCard;
