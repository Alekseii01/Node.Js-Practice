import React from 'react';
import './Button.css';

function Button({ children, variant = 'primary', className = '', ...props }) {
  const btnClass = [
    'btn',
    variant === 'secondary' ? 'btn-secondary' : 'btn-primary',
    className
  ].join(' ');
  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
}

export default Button;
