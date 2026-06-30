// screens/BiizzedScreen.jsx
import React from "react";
import Header from "../components/Header";
import BiizzedHero from "../components/BiizzedHero";
import BiizzedCategoryBar from "../components/BiizzedCategoryBar";
import BiizzedArticlesGrid from "../components/BiizzedArticlesGrid";
import BiizzedArticles from "../components/BiizzedArticles";
import BiizzedNewsletter from "../components/BiizzedNewsletter";
import Footer from "../components/Footer";

const BiizzedScreen = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Home */}
      <div id="home">
        <BiizzedHero />
      </div>

      {/* Category bar – not linked, stays as is */}
      <BiizzedCategoryBar />

      {/* Articles */}
      <div id="articles">
        <BiizzedArticles />
      </div>

      {/* Magazine */}
      <div id="magazine">
        <BiizzedArticlesGrid />
      </div>

      {/* Newsletter – not linked, stays as is */}
      <BiizzedNewsletter />

      {/* Contact */}
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
};

export default BiizzedScreen;