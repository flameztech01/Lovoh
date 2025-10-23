import React from 'react';

const Hero4 = () => {
    const things = [
        { name: "Strategy", image: "strategy.jpg" },
        { name: "Innovation", image: "innovation.jpg" },
        { name: "Growth", image: "growth.jpg" }
    ];

    return (
        <div className=" min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
                {things.map((thing, index) => (
                    <div 
                        key={index}
                        className="card bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 flex flex-col items-center text-center border border-gray-100"
                    >
                        <div className="mb-6">
                            <img 
                                src={thing.image} 
                                alt={thing.name} 
                                className="w-48 h-48 object-cover rounded-lg"
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {thing.name}
                        </h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Hero4;