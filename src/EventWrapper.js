import React from "react";

const EventWrapper = ({ event, children }) => {
  const { title, className, style } = children.props;
  const customClass = `${className} rbc-event--${event.type}`;

  return (
    <div
      title={title}
      className={customClass}
      style={style}
    >
      {children.props.children}
    </div>
  );
};

export default EventWrapper;
