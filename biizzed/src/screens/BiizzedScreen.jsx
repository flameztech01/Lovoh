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
      <BiizzedHero />
      <BiizzedCategoryBar />
      <BiizzedArticles />
      <BiizzedArticlesGrid />
      <BiizzedNewsletter />
      <Footer />
    </div>
  );
};

export default BiizzedScreen;