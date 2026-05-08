import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Ourwork = () => {
  // Using the works data from the Work page
  const works = [
    // Branding Projects
    {
      image: "/brandin1.jpg",
      title: "Afrikits",
      category: "Branding",
      description: "A complete brand identity system designed to elevate positioning and market clarity.",
    },
    {
      image: "/branding2.jpg",
      title: "Airnext Autos",
      category: "Branding",
      description: "Full brand identity for an automotive brand entering the market.",
    },
    {
      image: "/Cassia.jpg",
      title: "Cassia Interiors",
      category: "Branding",
      description: "Complete brand identity for an interior design and project management firm.",
    },
    // Digital Campaign Projects
    {
      image: "/Digital Campaign/Afrikits(1).jpg",
      title: "Afrikits Campaign",
      category: "Digital Campaign",
      description: "A data-driven digital campaign that delivered strong engagement.",
    },
    {
      image: "/Digital Campaign/Beckluxe’Ride  (1).jpg",
      title: "Beckluxe'Ride",
      category: "Digital Campaign",
      description: "Launch campaign for Beckluxe'Ride with bold creative direction.",
    },
    {
      image: "/Digital Campaign/HOMEREST  (1).jpg",
      title: "HOMEREST",
      category: "Digital Campaign",
      description: "Digital campaign focused on lifestyle and comfort.",
    },
    // Website Development Projects
    {
      image: "/Web/cassia 1.jpeg",
      title: "Cassia Website",
      category: "Website Development",
      description: "Modern, responsive website for Cassia with elegant design.",
    },
    {
      image: "/Web/Goldenville 1.jpeg",
      title: "Goldenville Schools",
      category: "Website Development",
      description: "Premium website for Goldenville with educational excellence.",
    },
    {
      image: "/Web/Uduua 1.jpeg",
      title: "Uduua",
      category: "Website Development",
      description: "Sophisticated digital marketplace platform with seamless UX.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(2);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % works.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + works.length) % works.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const getWrappedIndex = (index) => {
    return (index + works.length) % works.length;
  };

  const visibleSlides = [
    works[getWrappedIndex(currentIndex - 2)],
    works[getWrappedIndex(currentIndex - 1)],
    works[getWrappedIndex(currentIndex)],
    works[getWrappedIndex(currentIndex + 1)],
    works[getWrappedIndex(currentIndex + 2)],
  ];

  return (
    <section className="relative overflow-hidden bg-[#f6f8ff] py-20 sm:py-24 lg:py-28">
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-8 h-80 w-80 rounded-full bg-[#2f6bff]/10 blur-3xl" />
        <div className="absolute right-[-120px] top-16 h-96 w-96 rounded-full bg-[#4b73ff]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#8ea8ff]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        {/* top text */}
        <div className="mb-14 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 bg-clip-text text-transparent">
              Our
            </span>{" "}
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Work
            </span>
          </h2>

          <p className="mt-5 max-w-[700px] text-[15px] sm:text-[17px] lg:text-[18px] font-normal leading-[1.75] text-[#5f6f98]">
            We create modern brand experiences and help our clients win. From branding to digital campaigns and website development, we deliver meaningful solutions that drive real results.
          </p>

          <Link
            to="/work"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2f6bff] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_24px_rgba(47,107,255,0.18)] transition duration-300 hover:translate-y-[-1px] hover:bg-[#245df0]"
          >
            SEE MORE
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14m-6-6 6 6-6 6"
              />
            </svg>
          </Link>
        </div>

        {/* carousel */}
        <div className="relative">
          {/* desktop controls */}
          <div className="absolute left-1/2 top-1/2 z-30 hidden w-full max-w-[980px] -translate-x-1/2 -translate-y-1/2 justify-between px-4 md:flex">
            <button
              onClick={prevSlide}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#2f6bff] backdrop-blur-md shadow-[0_10px_30px_rgba(47,107,255,0.12)] transition duration-300 hover:scale-105"
              aria-label="Previous slide"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#2f6bff] backdrop-blur-md shadow-[0_10px_30px_rgba(47,107,255,0.12)] transition duration-300 hover:scale-105"
              aria-label="Next slide"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* slides */}
          <div className="flex items-center justify-center gap-3 overflow-hidden px-2 sm:gap-5 sm:px-4 lg:gap-7">
            {visibleSlides.map((work, index) => {
              const isCenter = index === 2;
              const isNear = index === 1 || index === 3;

              return (
                <button
                  key={`${work.title}-${index}`}
                  onClick={() => {
                    const actualIndex = works.findIndex(
                      (item) => item.image === work.image,
                    );
                    setCurrentIndex(actualIndex);
                  }}
                  className={`group relative shrink-0 overflow-hidden rounded-[28px] transition-all duration-700 ease-out ${
                    isCenter
                      ? "z-20 h-[340px] w-[46vw] max-w-[520px] shadow-[0_30px_80px_rgba(47,107,255,0.18)] sm:h-[460px] lg:h-[620px]"
                      : isNear
                        ? "z-10 h-[260px] w-[26vw] max-w-[280px] opacity-100 shadow-[0_18px_45px_rgba(47,107,255,0.10)] sm:h-[340px] lg:h-[480px]"
                        : "h-[220px] w-[16vw] max-w-[170px] scale-[0.92] opacity-60 sm:h-[280px] lg:h-[400px]"
                  }`}
                >
                  <img
                    src={work.image}
                    alt={work.title}
                    className={`h-full w-full object-cover transition-all duration-700 ${
                      isCenter
                        ? "scale-100 group-hover:scale-[1.03]"
                        : "scale-100 group-hover:scale-105"
                    }`}
                    loading="lazy"
                    style={{ imageRendering: "crisp-edges" }}
                  />

                  <div
                    className={`absolute inset-0 z-10 transition-all duration-500 ${
                      isCenter
                        ? "bg-gradient-to-t from-[#132b7a]/55 via-[#132b7a]/12 to-transparent"
                        : "bg-gradient-to-t from-[#132b7a]/35 via-[#132b7a]/10 to-transparent"
                    }`}
                  />

                  {isCenter && (
                    <>
                      <div className="absolute inset-0 z-20 rounded-[28px] ring-1 ring-white/30" />
                      <div className="absolute inset-x-8 bottom-0 z-10 h-24 rounded-full bg-[#5e84ff]/25 blur-3xl" />
                    </>
                  )}

                  <div
                    className={`absolute bottom-0 left-0 right-0 z-20 text-left ${
                      isCenter ? "p-6 sm:p-8" : "p-4 sm:p-5"
                    }`}
                  >
                    <p
                      className={`uppercase tracking-[0.18em] text-[#dbe4ff] ${
                        isCenter
                          ? "text-xs sm:text-sm"
                          : "text-[10px] sm:text-xs"
                      }`}
                    >
                      {work.category}
                    </p>

                    <h3
                      className={`mt-2 tracking-[-0.03em] text-white ${
                        isCenter
                          ? "text-xl font-medium sm:text-2xl lg:text-3xl"
                          : "text-sm font-medium sm:text-lg"
                      }`}
                    >
                      {work.title}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>

          {/* mobile controls */}
          <div className="mt-8 flex items-center justify-center gap-3 md:hidden">
            <button
              onClick={prevSlide}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8e2ff] bg-white text-[#2f6bff] shadow-sm"
              aria-label="Previous slide"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8e2ff] bg-white text-[#2f6bff] shadow-sm"
              aria-label="Next slide"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* dots */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              {works.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "h-2.5 w-10 bg-[#2f6bff]"
                      : "h-2.5 w-2.5 bg-[#bfd0ff] hover:bg-[#91a8ff]"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <p className="text-sm font-medium tracking-[0.2em] text-[#7f95df]">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(works.length).padStart(2, "0")}
            </p>
          </div>
        </div>

        {/* Start Your Project Button */}
        <div className="mt-16 flex justify-center">
          <Link
            to="/start-project"
            className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(47,107,255,0.25)] transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(47,107,255,0.35)]"
          >
            <span>Start Your Project</span>
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {/* Optional subtext */}
        <p className="mt-4 text-center text-sm text-[#7f95df]">
          Let's bring your vision to life
        </p>
      </div>
    </section>
  );
};

export default Ourwork;