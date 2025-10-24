import React from 'react'
import Header from '../components/Header.jsx'
import Hero from '../components/Hero.jsx'
import Hero2 from '../components/Hero2.jsx'
import ServicesHero from '../components/ServicesHero.jsx'
import Hero4 from '../components/Hero4.jsx'
import Ourwork from '../components/Ourwork.jsx'
import Experience from '../components/Experience.jsx'
import Clients from '../components/Clients.jsx'
import Getintouch from '../components/Getintouch.jsx';
import Win from '../components/Win.jsx';
import Team from '../components/Team.jsx';
import Footer from '../components/Footer.jsx'

const Homepage = () => {
  return (
    <div>
      <Header />
      
      <section id='home'>
        <Hero />
      </section>

      <Win />

        <Hero2 />

        <section id='services'>
            <ServicesHero />
        </section>

        <Hero4 />
        <section id='ourWork'>
            <Ourwork />
        </section>

        <Experience />
        <Clients />

        <Team />

        <section id='contact'>
          <Getintouch />
        </section>

        <Footer />
    </div>
  )
}

export default Homepage
