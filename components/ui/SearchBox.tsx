import React from "react";

export function SearchBox(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative w-full">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12.9 14.32a8 8 0 1 1 1.414-1.414l4.387 4.387-1.414 1.414-4.387-4.387Z" />
      </svg>
      <input
        {...props}
        className="h-11 w-full pl-10 pr-3 rounded-xl border border-gray-200 ring-1 ring-gray-100 focus:outline-none focus:ring-indigo-500 bg-white placeholder:text-gray-400"
        placeholder={props.placeholder ?? "Buscar por nombre, marca o SKU…"}
      />
    </div>
  );
}
