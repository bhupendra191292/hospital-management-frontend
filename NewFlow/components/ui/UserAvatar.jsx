import React from 'react';
import './UserAvatar.css';

const UserAvatar = ({ 
  name, 
  email, 
  size = 'medium',
  showName = true,
  showEmail = false,
  className = ''
}) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const displayName = name || email || 'User';
  const initials = getInitials(displayName);

  return (
    <div className={`user-avatar ${size} ${className}`}>
      <div className="avatar-circle">
        {initials}
      </div>
      {(showName || showEmail) && (
        <div className="avatar-info">
          {showName && <div className="avatar-name">{displayName}</div>}
          {showEmail && email && <div className="avatar-email">{email}</div>}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
