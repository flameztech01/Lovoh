import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Work = () => {
  const worksData = {
    "Branding": [
      {
        id: 1,
        title: "Afrikits",
        category: "Branding",
        image: "/brandin1.jpg",
        description: "A complete brand identity system designed to elevate positioning and market clarity.",
        details: "We developed a full identity including logo, typography, brand voice, and visual direction to position the brand for long-term growth. Delivered with comprehensive brand guidelines.",
        link: null,
        extendedWriteup: "Afrikits was preparing to launch in the Netherlands with a Herculean mission. Bringing authentic West African cuisine to the African diaspora and curious European kitchens. They knew what they were building. They just needed a brand that could make strangers understand it in split seconds. We started long before there were any visuals, working through their brand strategy, go-to-market approach, and positioning to figure out exactly where they sat in the market and why that mattered. By the time we got to colours, patterns, and identity, every decision had a reason behind it. The result? A brand that feels warm, unmistakably African and polished enough to hold its own on any shelf in Amsterdam or Lagos."
      },
      {
        id: 2,
        title: "Airnext Autos",
        category: "Branding",
        image: "/branding2.jpg",
        description: "Full brand identity for an automotive brand entering the market.",
        details: "Created a memorable brand story, visual identity, and brand guidelines for market entry. Includes logo variations, color palette, typography system, and brand applications.",
        link: null,
        extendedWriteup: "Airnext Autos already had a logo they were proud of. But they knew it wasn't doing enough. It wasn't telling their story and it wasn't something you'd remember after seeing it once. So they came to us for a proper rebrand, not a just a little touch-up, but a full rethink of how the brand showed up in the world. We went back to the drawing board and built a bold, future-forward identity grounded in sharp geometry and high-contrast energy. A brand designed to communicate speed, reliability and ambition from the very first glance."
      },
      {
        id: 3,
        title: "Cassia Interiors and Project",
        category: "Branding",
        image: "/Cassia.jpg",
        description: "Complete brand identity for an interior design and project management firm.",
        details: "Strategic brand development including new visual identity, messaging framework, and brand positioning. Resulted in increased brand recognition and client engagement.",
        link: null,
        extendedWriteup: "Cassia Interior & Projects is founder-led, and that came with a peculiar challenge. The founder needed a personal brand. The business needed its own. Each had to stand on its own, but they also had to make sense together without one overshadowing the other. We built both from the ground up and established a clear architecture for how they relate. Orchestrating when to let each speak alone, and when to let them quietly reinforce each other. What came out of it is a refined, elegant system that communicates craftsmanship and intentional living wherever it shows up."
      },
      {
        id: 15,
        title: "Casmide Agency",
        category: "Branding",
        image: "/casmide.png",
        description: "A brand identity built on trust, credibility, and warmth — designed for an agency that guides students through university admissions and travel coordination.",
        details: "Developed a clean, credible identity system (logo, typography, colour palette, guidelines) that instils confidence and communicates reliability at every touchpoint.",
        link: null,
        extendedWriteup: "Casmide Agency is doing something that requires a very specific kind of trust. Helping people navigate university admissions in unfamiliar countries and coordinating the travel that gets them there. That's not a service you choose because of a pretty logo. You choose it because everything about the brand tells you these people know exactly what they're doing and they'll handle it excellently. We built an identity around that. Clean, credible, and warm. A brand system that gives prospective clients the confidence to hand over something as significant as their next chapter in life."
      },
    ],
    "Digital Campaign": [
      {
        id: 4,
        title: "Afrikits Campaign",
        category: "Digital Campaign",
        image: "/Digital Campaign/Afrikits(1).jpg",
        description: "A data-driven digital campaign that delivered strong engagement and measurable growth.",
        details: "We executed a multi-channel campaign leveraging data insights to maximize engagement and ROI. Includes social media assets, email templates, and digital ads.",
        link: null,
        extendedWriteup: "Afrikits needed social content that could do real work. Not just look good, but actually pull people from discovery all the way to checking it out. We built a campaign rooted in cultural familiarity, pairing high-energy visuals with messaging that felt native to the platforms and natural to the audience. The goal was to make the path from scroll to order feel exciting and effortless, and it did."
      },
      {
        id: 5,
        title: "Afrikits Campaign 2",
        category: "Digital Campaign",
        image: "/Digital Campaign/Afrikits  (2).jpg",
        description: "Extended digital campaign with focused targeting and creative optimization.",
        details: "Multi-platform campaign designed to drive conversions and brand awareness through compelling visual storytelling.",
        link: null,
        extendedWriteup: "Building on the success of the first campaign, we expanded our approach with more targeted creative and refined messaging to reach deeper into the audience segments that showed the strongest engagement."
      },
      {
        id: 6,
        title: "Afrikits Campaign 3",
        category: "Digital Campaign",
        image: "/Digital Campaign/Afrikits  (3).jpg",
        description: "Third phase of the Afrikits digital campaign with enhanced creative assets.",
        details: "Leveraging insights from previous campaigns to deliver even stronger results with refined targeting and messaging.",
        link: null,
        extendedWriteup: "The third phase focused on retargeting and conversion optimization, using data from previous campaigns to deliver highly personalized creative that drove repeat engagement and increased customer lifetime value."
      },
      {
        id: 7,
        title: "Beckluxe'Ride Campaign 1",
        category: "Digital Campaign",
        image: "/Digital Campaign/Beckluxe’Ride  (1).jpg",
        description: "Launch campaign for Beckluxe'Ride with bold creative direction.",
        details: "A high-impact digital campaign designed to introduce Beckluxe'Ride to the market with striking visuals and strategic ad placements.",
        link: null,
        extendedWriteup: "In the world Beckluxe Ride operates in, perception is everything. Their clients aren't just booking a ride. They're making a statement. We created a campaign built to match that. Dark, cinematic, and unapologetically premium. Every asset was designed to position Beckluxe Ride as the obvious choice for clients who expect more, without ever having to spell out the words luxury or exclusivity."
      },
      {
        id: 8,
        title: "Beckluxe'Ride Campaign 3",
        category: "Digital Campaign",
        image: "/Digital Campaign/Beckluxe’Ride  (3).jpg",
        description: "Follow-up campaign driving sustained engagement for Beckluxe'Ride.",
        details: "Building on the launch success with retargeting strategies and fresh creative assets to maintain momentum.",
        link: null,
        extendedWriteup: "Following the successful launch, we developed a sustained engagement campaign that kept the brand top-of-mind for high-value audiences through strategic retargeting and fresh creative variations."
      },
      {
        id: 9,
        title: "HOMEREST Campaign 1",
        category: "Digital Campaign",
        image: "/Digital Campaign/HOMEREST  (1).jpg",
        description: "Digital campaign for HOMEREST focused on lifestyle and comfort.",
        details: "Crafted a compelling narrative around home and comfort, delivered across social and digital channels for maximum reach.",
        link: null,
        extendedWriteup: "Homerest didn't just want to be known as a real estate and yacht experience service. They wanted to occupy a different kind of space in people's minds, one where the feeling of the brand was as fresh as what they were selling. We built a campaign around that need. Blending cinematic visuals, a copy that spoke directly to aspiration, and a tone that was clean and confident without ever announcing itself as luxury."
      },
      {
        id: 10,
        title: "HOMEREST Campaign",
        category: "Digital Campaign",
        image: "/Digital Campaign/HOMEREST .jpg",
        description: "Core HOMEREST digital campaign with full-funnel marketing approach.",
        details: "Comprehensive campaign spanning awareness, consideration, and conversion stages with tailored creative for each touchpoint.",
        link: null,
        extendedWriteup: "This comprehensive campaign spanned the entire marketing funnel, with tailored creative for each stage—from broad awareness-building content to consideration-focused storytelling and conversion-driven calls to action."
      },
      {
        id: 11,
        title: "HOMEREST Campaign Extended",
        category: "Digital Campaign",
        image: "/Digital Campaign/HOMEREST.jpg",
        description: "Extended HOMEREST campaign with additional creative variations.",
        details: "Expanded the core campaign with new angles and formats to capture broader audience segments.",
        link: null,
        extendedWriteup: "The extended campaign introduced new creative angles and formats, allowing us to capture broader audience segments while maintaining the refined brand voice that defined the original campaign."
      },
      {
        id: 16,
        title: "Nonsman",
        category: "Digital Campaign",
        image: "/nonsman.png",
        description: "A full-funnel brand campaign, from strategy and photoshoot to final creative — assets now used across the brand’s website and offices.",
        details: "End-to-end campaign: strategy, ideation, photo shoot production, and creative execution. The resulting images became a permanent part of Nonsman's brand identity.",
        link: null,
        extendedWriteup: "Nonsman came to us for a campaign and we took it from the very beginning to the very end. Strategy, ideation, photo shoot production, and final creative execution, all of it. The images from that shoot didn't just live only in the campaign. They became the brand. Nonsman has since used them across their website and their offices. We created an image that earns a permanent place in how the brand shows up in the world."
      },
    ],
    "Website Development": [
      {
        id: 12,
        title: "Cassia Interiors & Projects",
        category: "Website Development",
        image: "/Web/cassia 1.jpeg",
        description: "A modern, responsive website for Cassia with elegant design.",
        details: "Built with performance in mind, this website delivers smooth user experience, optimized speed, and a modern UI. Features include responsive design, CMS integration, and SEO optimization.",
        link: "https://cassia-interior-and-projects.vercel.app",
        extendedWriteup: "Cassia had a strong brand and serious work to show. What they needed was a site that was as excellent as the spaces they build. Somewhere that let the projects speak, guided visitors naturally toward getting in touch, and communicated the precision behind everything they do. We built around the portfolio and the story, making sure nothing got in the way of either."
      },
      {
        id: 13,
        title: "Goldenville Schools",
        category: "Website Development",
        image: "/Web/Goldenville 1.jpeg",
        description: "Premium website for Goldenville with a focus on educational excellence.",
        details: "Designed and developed a comprehensive school website that reflects Goldenville's leadership in education. Features include program showcases, admissions info, and a modern, trustworthy design.",
        link: "https://goldenvilleschools.com",
        extendedWriteup: "Goldenville runs two schools under one name. A Montessori primary and a secondary college — and they needed a digital home that could hold both without one swallowing the other. Parents needed to land on the site, understand what each school stood for, and find their way to an admission inquiry without getting lost. We built a platform with a clear architecture that let each brand speak in its own voice, while keeping the journey from discovery to inquiry simple and intuitive."
      },
      {
        id: 14,
        title: "Uduua",
        category: "Website Development",
        image: "/Web/Uduua 1.jpeg",
        description: "A sophisticated digital marketplace platform for Uduua with seamless user experience.",
        details: "Developed a custom website solution that captures Uduua's brand essence while delivering exceptional performance and user engagement. Features include responsive design, optimized performance, and modern UI/UX.",
        link: "https://lovohcreate.vercel.app/uduua",
        extendedWriteup: "Uduua is a marketplace built for fast-growing brands and the buyers who want to find them at retail or in bulk. The site needed to speak to two very different people at the same time. A shopper looking for something worth buying, and a brand looking for somewhere worth being. We designed a platform that serves both without feeling like it's trying to do too much, with a clean product experience and a clear path for brands to get listed and get moving."
      },
    ],
  };

  const categories = ["Branding", "Digital Campaign", "Website Development"];
  
  // Service descriptions for each category – investment language & CTA
  const serviceDescriptions = {
    "Branding": {
      description: "When it comes to investment, our project costs are determined by the scope and depth of the brand work your business requires. Every engagement begins with a clearly scoped proposal covering brand strategy, identity design, guidelines, and all the deliverables your brand needs to show up consistently. We remain available after every project to make sure your brand is being applied the right way.",
      ctaText: "Let's Talk About Your Project →",
    },
    "Digital Campaign": {
      description: "When it comes to investment, our project costs are determined by the scope, duration, and creative requirements of your campaign. Every engagement begins with a clearly scoped proposal covering campaign strategy, creative direction, content production, and delivery across the platforms that matter to your audience. We remain available throughout and after every campaign to make sure the work keeps performing.",
      ctaText: "Let's Talk About Your Project →",
    },
    "Website Development": {
      description: "When it comes to investment, our project costs are determined by the technical complexity and features your business requires. Every engagement begins with a clearly scoped proposal covering project architecture, UI/UX design, development, deployment, and post-launch support. We remain available for 30 days after every launch to make sure your transition into the digital space is seamless.",
      ctaText: "Let's Talk About Your Project →",
    }
  };

  // Get cover image for each category (first image from each category)
  const getCategoryCover = (category) => {
    const firstWork = worksData[category][0];
    return firstWork ? firstWork.image : null;
  };

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [selectedImageForDownload, setSelectedImageForDownload] = useState(null);
  const [bgIndex, setBgIndex] = useState(0);
  
  // State for grouped slider view
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  
  const worksGridRef = useRef(null);

  // Hero background images (campus1.jpg - campus6.jpg)
  const heroBackgrounds = [
    "/campus1.jpg",
    "/campus2.jpg",
    "/campus3.jpg",
    "/campus4.jpg",
    "/campus5.jpg",
    "/campus6.jpg",
  ];

  // Background auto change
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev === heroBackgrounds.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, [heroBackgrounds.length]);

  // Auto-scroll to works grid when a category is selected
  useEffect(() => {
    if (selectedCategory && worksGridRef.current) {
      setTimeout(() => {
        worksGridRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedWork(null);
    setSelectedGroup(null);
    setCurrentGroupIndex(0);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedWork(null);
    setSelectedGroup(null);
  };

  // Utility: get base title for Digital Campaign grouping
  const getBaseTitle = (title) => {
    return title.replace(/\s+\d+$/, '').replace(/\s+Extended$/i, '').trim();
  };

  // Group Digital Campaign works
  const groupDigitalCampaigns = (works) => {
    const groupsMap = new Map();
    works.forEach(work => {
      const base = getBaseTitle(work.title);
      if (!groupsMap.has(base)) {
        groupsMap.set(base, []);
      }
      groupsMap.get(base).push(work);
    });
    const groups = [];
    groupsMap.forEach((items, baseTitle) => {
      items.sort((a, b) => a.id - b.id);
      groups.push({
        baseTitle,
        items,
        representativeImage: items[0].image,
        description: items[0].description,
      });
    });
    return groups;
  };

  // Compute display works or groups based on selected category
  const getDisplayItems = () => {
    if (!selectedCategory) return null;
    if (selectedCategory === "Digital Campaign") {
      return groupDigitalCampaigns(worksData[selectedCategory]);
    }
    return worksData[selectedCategory];
  };

  // Function to add watermark to image and download
  const addWatermarkAndDownload = async (imageUrl, title) => {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      ctx.drawImage(img, 0, 0);
      
      ctx.font = `${Math.max(20, Math.floor(img.width / 15))}px "Arial", "Helvetica", sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.textAlign = "center";
      
      const watermarkText = "LovohCreate";
      const textX = canvas.width / 2;
      const textY = canvas.height - 50;
      
      ctx.fillText(watermarkText, textX, textY);
      
      ctx.shadowColor = "transparent";
      
      ctx.font = `${Math.max(14, Math.floor(img.width / 25))}px "Arial", "Helvetica", sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.textAlign = "center";
      
      for (let i = -3; i <= 3; i++) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(watermarkText, i * 150, i * 100);
        ctx.restore();
      }
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_lovohcreate.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/jpeg", 0.95);
      
    } catch (error) {
      console.error("Error adding watermark:", error);
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewFullImage = (work) => {
    setSelectedImageForDownload(work);
  };

  const handleDownloadFromModal = (work) => {
    addWatermarkAndDownload(work.image, work.title);
    setSelectedImageForDownload(null);
  };

  // Group slider handlers
  const openGroupSlider = (group) => {
    setSelectedGroup(group.items);
    setCurrentGroupIndex(0);
  };

  const closeGroupSlider = () => {
    setSelectedGroup(null);
    setCurrentGroupIndex(0);
  };

  const goToPrev = (e) => {
    e.stopPropagation();
    if (!selectedGroup) return;
    setCurrentGroupIndex((prev) => (prev === 0 ? selectedGroup.length - 1 : prev - 1));
  };

  const goToNext = (e) => {
    e.stopPropagation();
    if (!selectedGroup) return;
    setCurrentGroupIndex((prev) => (prev === selectedGroup.length - 1 ? 0 : prev + 1));
  };

  const downloadCurrentGroupImage = (e) => {
    e.stopPropagation();
    if (!selectedGroup) return;
    const currentItem = selectedGroup[currentGroupIndex];
    addWatermarkAndDownload(currentItem.image, currentItem.title);
  };

  // Render works grid
  const displayItems = getDisplayItems();
  const isDigitalCampaign = selectedCategory === "Digital Campaign";

  return (
    <>
      <Header />

      <main className="bg-[#f7f8f4] min-h-screen">
        {/* HERO - Full Screen with background slideshow */}
        <section className="relative h-screen flex items-center overflow-hidden">
          {heroBackgrounds.map((bgImage, index) => (
            <img
              key={index}
              src={bgImage}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === bgIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.18em] text-white/80 font-semibold mb-4">
                Our Work
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white">
                Selected
                <span className="block text-[#ebed17]">Projects</span>
              </h1>

              <p className="mt-6 text-lg text-white/90 leading-relaxed">
                We create meaningful, scalable solutions that drive real results.
              </p>

              <div className="mt-8 space-y-3">
                <p className="text-white/80 leading-relaxed hidden sm:block">
                  From concept to execution, we partner with businesses to build digital experiences 
                  that resonate, perform, and scale. Every project is a collaboration aimed at 
                  delivering measurable impact.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#ebed17] rounded-full"></span>
                    <span className="text-sm text-white/80">150+ Projects Delivered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#ebed17] rounded-full"></span>
                    <span className="text-sm text-white/80">50+ Happy Clients</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#ebed17] rounded-full"></span>
                    <span className="text-sm text-white/80">6 Years of Excellence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Category Gallery - Cover Photos Grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] mb-3 sm:mb-4">
                Explore Our Work
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">
                Browse through our portfolio categories and discover our creative solutions
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {categories.map((category, index) => (
                <div
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`group cursor-pointer ${
                    index === 2 && "col-span-2 md:col-span-1 mx-auto w-full max-w-[280px] md:max-w-none"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500">
                    <img
                      src={getCategoryCover(category)}
                      alt={category}
                      className="w-full h-48 sm:h-64 md:h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-[#ebed17] font-semibold mb-1 sm:mb-2">
                        Portfolio
                      </p>
                      <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white leading-tight">
                        {category}
                      </h3>
                      <div className="w-8 sm:w-12 h-0.5 bg-[#ebed17] mt-2 sm:mt-3 group-hover:w-12 sm:group-hover:w-24 transition-all duration-300" />
                    </div>
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-xs sm:text-base font-semibold tracking-wider border-2 border-white/80 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full backdrop-blur-sm">
                        View Projects
                      </span>
                    </div>
                  </div>
                  
                  <p className="mt-2 sm:mt-4 text-gray-600 text-center text-xs sm:text-sm">
                    {worksData[category].length} Projects
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Selected Category Works Grid */}
        {selectedCategory && displayItems && (
          <section 
            ref={worksGridRef}
            className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white/50 border-t border-gray-100"
          >
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 sm:mb-10">
                <button
                  onClick={handleBackToCategories}
                  className="group flex items-center gap-2 text-gray-500 hover:text-[#254899] transition-colors mb-4 sm:mb-6 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Categories</span>
                </button>
                
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] mb-2 sm:mb-3">
                    {selectedCategory}
                  </h2>
                </div>

                <div className="max-w-4xl mx-auto mt-4 mb-8 text-center">
                  <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
                    {serviceDescriptions[selectedCategory]?.description}
                  </p>
                  <Link
                    to="/start-project"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#254899] text-white font-semibold rounded-full hover:bg-[#1d3a7a] transition-all duration-300 text-sm"
                  >
                    {serviceDescriptions[selectedCategory]?.ctaText}
                  </Link>
                  <p className="text-gray-500 text-sm mt-6 pt-5 border-t border-gray-200">
                    See what we've built for some of our clients below.
                  </p>
                </div>
              </div>

              {/* Works Grid - 2 per row on mobile, 3 per row on desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {isDigitalCampaign
                  ? displayItems.map((group, idx) => (
                      <div
                        key={idx}
                        onClick={() => openGroupSlider(group)}
                        className="cursor-pointer group"
                      >
                        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500">
                          <img
                            src={group.representativeImage}
                            alt={group.baseTitle}
                            className="w-full h-40 sm:h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                            <div className="p-3 sm:p-4 md:p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              <p className="text-xs sm:text-sm font-light opacity-90">
                                View {group.items.length} assets
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] sm:text-xs mt-2 sm:mt-4 uppercase text-[#254899]/70 font-semibold tracking-wider">
                          Digital Campaign
                        </p>
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#111827] mt-0.5 sm:mt-1 group-hover:text-[#254899] transition-colors line-clamp-2">
                          {group.baseTitle}
                        </h3>
                      </div>
                    ))
                  : displayItems.map((work) => (
                      <div
                        key={work.id}
                        onClick={() => setSelectedWork(work)}
                        className="cursor-pointer group"
                      >
                        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500">
                          {work.link && (
                            <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              Live
                            </div>
                          )}
                          <img
                            src={work.image}
                            alt={work.title}
                            className="w-full h-40 sm:h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                            <div className="p-3 sm:p-4 md:p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              <p className="text-xs sm:text-sm font-light opacity-90">
                                {work.link ? "Click to view website" : "Click to view details"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] sm:text-xs mt-2 sm:mt-4 uppercase text-[#254899]/70 font-semibold tracking-wider">
                          {work.category}
                        </p>
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#111827] mt-0.5 sm:mt-1 group-hover:text-[#254899] transition-colors line-clamp-2">
                          {work.title}
                        </h3>
                      </div>
                    ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL for Single Project Details (non-grouped items) */}
      {selectedWork && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 px-4 overflow-y-auto py-8">
          <div className="bg-white max-w-3xl w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative animate-[fadeIn_0.3s_ease]">
            
            <button
              onClick={() => setSelectedWork(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-black/60 hover:bg-black/80 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 text-sm sm:text-base"
            >
              ✕
            </button>

            <div className="relative bg-gray-900">
              <img
                src={selectedWork.image}
                alt={selectedWork.title}
                className="w-full h-auto max-h-[50vh] object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewFullImage(selectedWork);
                  setSelectedWork(null);
                }}
                className="absolute bottom-4 left-4 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all duration-300 backdrop-blur-sm text-xs sm:text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                View Full Image
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewFullImage(selectedWork);
                  setSelectedWork(null);
                }}
                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              {selectedWork.link && (
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                  Live Website
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <p className="text-[10px] sm:text-xs uppercase text-[#254899]/70 font-semibold tracking-wider mb-1 sm:mb-2">
                {selectedWork.category}
              </p>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#111827]">
                {selectedWork.title}
              </h2>

              <p className="mt-3 sm:mt-4 text-gray-600 leading-relaxed text-sm sm:text-base">
                {selectedWork.description}
              </p>

              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed italic">
                  "{selectedWork.extendedWriteup || selectedWork.details}"
                </p>
              </div>

              {selectedWork.link && (
                <a
                  href={selectedWork.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit Live Website
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULL IMAGE MODAL for Single Work */}
      {selectedImageForDownload && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 px-4 overflow-y-auto py-8">
          <div className="bg-white max-w-5xl w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative animate-[fadeIn_0.3s_ease]">
            <button
              onClick={() => setSelectedImageForDownload(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-black/60 hover:bg-black/80 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 text-sm sm:text-base"
            >
              ✕
            </button>

            <div className="bg-gray-900 flex items-center justify-center p-4">
              <img
                src={selectedImageForDownload.image}
                alt={selectedImageForDownload.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-[#111827] text-center mb-2">
                {selectedImageForDownload.title}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm text-center mb-6">
                View the full image in its original aspect ratio
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleDownloadFromModal(selectedImageForDownload)}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download with Watermark
                </button>
                
                <button
                  onClick={() => setSelectedImageForDownload(null)}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
              
              <p className="text-gray-400 text-xs text-center mt-4">
                Watermark will be applied to protect the image
              </p>
            </div>
          </div>
        </div>
      )}

      {/* GROUP SLIDER MODAL for Digital Campaign grouped items */}
      {selectedGroup && selectedGroup.length > 0 && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 px-4 overflow-hidden">
          <div className="relative w-full max-w-5xl h-full flex flex-col justify-center">
            {/* Close button */}
            <button
              onClick={closeGroupSlider}
              className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 text-lg"
            >
              ✕
            </button>

            {/* Main image display */}
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <img
                src={selectedGroup[currentGroupIndex].image}
                alt={selectedGroup[currentGroupIndex].title}
                className="max-h-[80vh] max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Navigation arrows */}
            {selectedGroup.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition duration-300 z-10"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition duration-300 z-10"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Info bar at bottom: title, download button, slide counter */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-white px-4 sm:px-8">
              <div className="text-center sm:text-left mb-3 sm:mb-0">
                <h3 className="text-lg sm:text-xl font-bold">
                  {selectedGroup[currentGroupIndex].title}
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  {selectedGroup[currentGroupIndex].description}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {currentGroupIndex + 1} / {selectedGroup.length}
                </p>
              </div>
              <button
                onClick={downloadCurrentGroupImage}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-5 py-2 rounded-full transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add line-clamp utility */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <Footer />
    </>
  );
};

export default Work;