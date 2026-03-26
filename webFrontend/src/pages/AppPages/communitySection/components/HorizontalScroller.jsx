import React, { Children } from "react";

const HorizontalScroller = ({ title, children }) => {
  return (
    <section className="mb-8 md:mb-12 min-w-0">
      <h2 className="text-xl md:text-3xl font-bold main-text mb-4 md:mb-6">{title}</h2>

      <div className="-mx-4">
        <div
          className="pl-4 overflow-x-auto custom-scrollbar"
          role="region"
          aria-label={`${title} scroller`}
        >
          <div className="flex gap-4 pr-4 snap-x snap-mandatory min-w-0">
            {Children.map(children, (child, i) => (
              <div
                key={i}
                className={[
                  "snap-start shrink-0 box-border",
                  "w-[90%] max-w-[320px]",        // mobile: almost full width
                  "sm:w-[45%] sm:max-w-[360px]", // small tablets: 2 across
                  "md:w-[30%] md:max-w-[400px]", // medium: 3 across
                  "lg:w-[22%] lg:max-w-[420px]", // large: 4 across
                ].join(" ")}
              >
                {child}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalScroller;
