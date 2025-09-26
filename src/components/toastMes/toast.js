"use client";

import React, { useEffect, useState } from "react";

export function Toast({ message, onClose, duration = 1000 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false); 

   
      setTimeout(() => {
        onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <>
   
      <div
        className={`fixed inset-0 bg-black/5 backdrop-blur-[3px] z-40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      ></div>

     <div
        className={`fixed top-1/2 left-1/2 px-6 py-3 rounded z-50 bg-green-600 text-white text-lg  shadow-lg transform transition-all duration-300
          w-[320px] sm:w-96 max-w-full text-center
          ${visible ? "opacity-80 -translate-x-1/2 -translate-y-1/2" : "opacity-0 -translate-x-1/2 -translate-y-1/2"}
        `}
      
      >
        {message}
      </div>
    </>
  );
}
