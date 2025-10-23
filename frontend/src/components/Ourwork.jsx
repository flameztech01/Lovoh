import React, { useState, useEffect } from 'react';

const Ourwork = () => {
    const works = [
        { image: 'firstProject.png' },
        { image: 'secondProject.png' },
        { image: 'thirdProject.png' }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === works.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [works.length]);

    const nextSlide = () => {
        setCurrentIndex(currentIndex === works.length - 1 ? 0 : currentIndex + 1);
    };

    const prevSlide = () => {
        setCurrentIndex(currentIndex === 0 ? works.length - 1 : currentIndex - 1);
    };

    return (
        <div className=" min-h-screen bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="max-w-4xl mx-auto text-center mb-16">
                <h1 className="text-5xl lg:text-7xl font-bold mb-8">Our Work</h1>
                <p className="text-lg lg:text-xl text-gray-300 leading-relaxed">
                    Businesses play a major role in your day to day experience, as these establishments provide the products and services we all use in our daily lives.

                    For us @Lovoh Create, developing and promoting Brands with the right culture, products, and services is NOT just business as usual, but a key contribution to improving human living and advancing society. We take our work seriously, it is a mission!
                </p>
            </div>

            {/* Binary Section */}
            <div className="text-center mb-16">
                <h5 className="text-xl lg:text-2xl font-semibold mb-4">
                    We've cracked the hard codes, to give you seamless results.
                </h5>
                <h5 className="text-blue-400 font-mono text-lg opacity-80">
                    1010101010101010101010 1010101010101010101010
                </h5>
            </div>

            {/* Carousel Section */}
            <div className="max-w-6xl mx-auto">
                <div className="relative">
                    {/* Main Image */}
                    <div className="relative h-96 lg:h-[600px] rounded-2xl overflow-hidden">
                        <img 
                            src={works[currentIndex].image} 
                            alt={`Project ${currentIndex + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
                        />
                        
                        {/* Navigation Buttons */}
                        <button 
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        
                        <button 
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Indicator Dots */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                            {works.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        index === currentIndex 
                                            ? 'bg-white' 
                                            : 'bg-white/50 hover:bg-white/70'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Thumbnail Previews */}
                    <div className="flex justify-center space-x-4 mt-8">
                        {works.map((work, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                                    index === currentIndex 
                                        ? 'border-white scale-110' 
                                        : 'border-gray-600 hover:border-gray-400'
                                }`}
                            >
                                <img 
                                    src={work.image} 
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ourwork;