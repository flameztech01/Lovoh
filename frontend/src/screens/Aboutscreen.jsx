import React from 'react'
import Header from '../components/Header.jsx'
import Abouthero from '../components/Abouthero.jsx'
import Ourstory from '../components/Ourstory.jsx'
import Missionvision from '../components/Missionvision.jsx'
import Values from '../components/Values.jsx'
import Aboutteam from '../components/Aboutteam.jsx'
import Whychooseus from '../components/Whychooseus.jsx'
import Footer from '../components/Footer.jsx'

const Aboutscreen = () => {
  return (
    <div>
        <Header />
        <Abouthero />
        <Ourstory />
        <Missionvision />
        <Values />
        <Aboutteam />
        <Whychooseus />
      <Footer />
    </div>
  )
}

export default Aboutscreen
