(() => {
  const Card = ({ children, className = '' }) => {
    return (
      React.createElement('div', {
        className: `bg-white rounded-xl shadow-md p-6 ${className}`
      }, children)
    );
  };

  window.MySelvam.components.Card = Card;
})();
