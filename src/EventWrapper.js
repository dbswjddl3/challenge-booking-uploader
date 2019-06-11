import React from "react";

const EventWrapper = ({ event, children }) => {
  const { title, className, style } = children.props;
  var customClass = [className];

  if(event.new) {
    customClass.push('rbc-event--new');
  }

  if(event.overlap) {
    customClass.push('rbc-event--overlap');
  }
  
  return (
    <div
      title={title}
      className={customClass.join(' ')}
      style={style}
    >
      {children.props.children}
    </div>
  );
};

export default EventWrapper;
