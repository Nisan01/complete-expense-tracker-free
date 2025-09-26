export default function ExpButton({ text, className = "", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-white px-6 py-3 cursor-pointer rounded-[3px] shadow-md hover:shadow-lg hover:bg-blue-100 hover:text-black transition-all duration-200 ${className}`}
    >
      {text}
    </button>
  );
}
