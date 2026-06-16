import React, { useId } from "react";
import "./Loader.css";

interface LoaderProps {
  size?: number;
  style?: React.CSSProperties;
}

export const Loader = ({ size = 1, style }: LoaderProps) => {
  const clippingId = useId();

  return (
    <div 
      className="loader-wrapper" 
      style={{ 
        "--size": size,
        ...style 
      } as React.CSSProperties}
    >
      <div className="loader">
        <svg width={100} height={100} viewBox="0 0 100 100">
          <defs>
            <mask id={clippingId} className="clipping-mask">
              <polygon points="0,0 100,0 100,100 0,100" fill="black" />
              <polygon points="25,25 75,25 50,75" fill="white" />
              <polygon points="50,25 75,75 25,75" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
            </mask>
          </defs>
        </svg>
        <div 
          className="box" 
          style={{
            mask: `url(#${clippingId})`,
            WebkitMask: `url(#${clippingId})`
          }}
        />
      </div>
    </div>
  );
};

export default Loader;
