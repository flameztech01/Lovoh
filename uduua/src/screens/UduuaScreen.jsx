// screens/UduuaScreen.jsx
import React from 'react';
import Header from '../components/Header';
import UduuaHero from '../components/UduuaHero';
import UduuaPartners from '../components/UduuaPartners';
import WhyChooseUduua from '../components/WhyChooseUduua';
import UduuaProductDisplay from '../components/UduuaProductDisplay';
import UduuaValueStrip from '../components/UduuaValueStrip';
import UduuaFeaturedProducts from '../components/UduuaFeaturedProducts';
import Footer from '../components/Footer';

const UduuaScreen = () => {
  return (
    <div>
      <Header />

      {/* Home */}
      <div id="home">
        <UduuaHero />
      </div>

      {/* Brands */}
      <div id="brands">
        <UduuaPartners />
      </div>

      {/* Value Strip – no ID, stays as is */}
      <UduuaValueStrip />

      {/* Catalogue */}
      <div id="catalogue">
        <UduuaProductDisplay />
      </div>

      {/* Why Choose Uduua */}
      <div id="why-uduua">
        <WhyChooseUduua />
      </div>

      {/* Featured Products – no ID, stays as is */}
      <UduuaFeaturedProducts />

      {/* Contact */}
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
};

export default UduuaScreen;