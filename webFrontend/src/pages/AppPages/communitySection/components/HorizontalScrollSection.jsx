// components/HorizontalScroller.jsx
import React from 'react';

export default function HorizontalScrollSection({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 main-text">{title}</h2>
      <div className="overflow-x-auto">
        <div className="flex gap-4">
          {React.Children.map(children, (child, idx) => (
            <div
              key={idx}
              className="
                flex-shrink-0
                w-[85%] sm:w-[300px] md:w-[350px]
              "
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}