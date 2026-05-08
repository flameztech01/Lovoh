// screens/BizzzedScreen.jsx
import React from "react";
import Header from "../components/Header";
import BizzzedHero from "../components/BizzzedHero";
import BizzzedCategoryBar from "../components/BizzzedCategoryBar";
import BizzzedArticlesGrid from "../components/BizzzedArticlesGrid";
import BizzzedArticles from "../components/BizzzedArticles";
import BizzzedNewsletter from "../components/BizzzedNewsletter";
import Footer from "../components/Footer";

const BizzzedScreen = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <BizzzedHero />
      <BizzzedCategoryBar />
      <BizzzedArticles />
      <BizzzedArticlesGrid />
      <BizzzedNewsletter />
      <Footer />
    </div>
  );
};

export default BizzzedScreen;