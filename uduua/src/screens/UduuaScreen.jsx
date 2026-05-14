//screens/UduuaScreen.jsx

import React from 'react'
import Header from '../components/Header'
import UduuaHero from '../components/UduuaHero'
import UduuaPartners from '../components/UduuaPartners'
import WhyChooseUduua from '../components/WhyChooseUduua'
import UduuaProductDisplay from '../components/UduuaProductDisplay'
import UduuaValueStrip from '../components/UduuaValueStrip'
import UduuaFeaturedProducts from '../components/UduuaFeaturedProducts'
import Footer from '../components/Footer'

const UduuaScreen = () => {
  return (
    <div>
      <Header />
      <UduuaHero />
      <UduuaPartners />
       <UduuaValueStrip />
      <UduuaProductDisplay />
         <WhyChooseUduua />
      <UduuaFeaturedProducts />
      <Footer />
    </div>
  )
}

export default UduuaScreen
