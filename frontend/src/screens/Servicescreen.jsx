import React from 'react'
import Header from '../components/Header.jsx'
import Servicepagehero from '../components/Servicepagehero.jsx'
import Servicecategories from '../components/Servicecategories.jsx'
import Serviceprocess from '../components/Serviceprocess.jsx'
import Casestudies from '../components/Casestudies.jsx'
import ServiceFAQ from '../components/ServiceFAQ.jsx'
import ServiceCTA from '../components/ServiceCTA.jsx'
import Footer from '../components/Footer.jsx'

const Servicescreen = () => {
  return (
    <div>
        <Header />
        <Servicepagehero />
        <Servicecategories />
        <Serviceprocess />
        <Casestudies />
        <ServiceFAQ />
        <ServiceCTA />
        <Footer />
    </div>
  )
}

export default Servicescreen
