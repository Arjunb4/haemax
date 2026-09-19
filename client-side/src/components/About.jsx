import React from 'react'
import { Link } from 'react-router-dom'
import './About.css'

import aboutImg from '../assets/aboutImg.png'
function About() {
  return (
    <div className='hero'>
        <div className='ki'>
            <p className='title'>About Us</p>
            <div className='section'>
                <img src={aboutImg}/>
                <div className='para'>
                    Haemax is dedicated to providing safe and reliable blood transfusion services. Our mission is to bridge the gap between donors and patients, ensuring timely availability of blood for emergencies, surgeries, and medical treatments. With a strong network of donors and advanced storage facilities, we strive to serrve communities with excellence.
                </div>
            </div>
        </div>
        <div className='section5'>
            <p>Explore donations available near me and hosptials to receive blood near me</p>
            <Link to='/explore'><button>Explore Now</button></Link>
        </div>
    </div>
  )
}

export default About