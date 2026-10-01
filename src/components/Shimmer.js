const Shimmer = () => {
  return (
    <div className="px-4 py-6 max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-60 bg-gray-200 rounded-2xl animate-pulse"></div>
      ))}
    </div>
  );
};

export default Shimmer;
