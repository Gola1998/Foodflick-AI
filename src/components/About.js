import React from 'react';

const About = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-800">
      <h1 className="text-3xl font-bold text-orange-500 mb-4">About FoodFlick</h1>
      
      <p className="text-gray-600 mb-10">
        FoodFlick is a food ordering platform that offers a wide variety of cuisines from your favorite local restaurants — delivered fast and fresh.
      </p>

      <div className="space-y-6">
        <p>🍕 Order from top-rated restaurants</p>
        <p>🍜 Explore multiple cuisines in one place</p>
        <p>🚴‍♂️ Fast and reliable delivery</p>
        <p>📲 Simple and user-friendly app</p>
      </div>

      <p className="mt-10 text-gray-700">
        Craving something? <span className="text-orange-500 font-semibold">Start your order now!</span>
      </p>
    </div>
  );
};

export default About;
