const Shimmer = () => {
  return (
    <div className="px-4 py-6 max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-60 bg-gray-200 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
};

export default Shimmer;
