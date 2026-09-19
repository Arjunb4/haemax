import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'
import pic1 from '../assets/pic1.png'
import pic2 from '../assets/pic2.png'
import pic3 from '../assets/pic3.png'
import Background from '../components/Background'
import bldDrop from '../assets/Blooddrop.png'

function Home() {
  return (
    <>
    <Background/>
    <div className="container">
        <div className='section1'>
            <div className='des'>
                Where compassion meets action.
            </div>
                <img src={pic1}/>
        </div>
        <div className='section2'>
        <Link to='/receiversearch'><button>Find Blood</button></Link>
            <Link to='/form'><button>Register Donor</button></Link>
        </div>
        <div className="section3">
            <div className='heading'>Why Donate Blood?</div>
            <div className='content'>
                    <img className='pic'src={pic3}/>
                    <ul className='list'>
                        <li><span><img src={bldDrop}/></span>Save lives<br/>
                            <span>Just one donation can help up to three people.</span>
                        </li>
                        <li><span><img src={bldDrop}/></span>Improves your health<br/>
                            <span>Regular donation promotes good health by balancing iron levels.</span>
                        </li>
                        <li><span><img src={bldDrop}/></span>Community support<br/>
                            <span>Play a vital role in emergency preparedness.</span>
                        </li>
                    </ul>
            </div>
        </div>
        <div className="section4">
            <div className='heading'>Who can Donate?</div>
            <div className='content'>
                    <ul className='list'>
                        <li><span><img src={bldDrop}/></span>Individuals aged 18-65 years</li>
                        <li><span><img src={bldDrop}/></span>Minimum weight of 50kg</li>
                        <li><span><img src={bldDrop}/></span>Healthy individuals with no chronic diseases or infections</li>
                        <li><span><img src={bldDrop}/></span>No recent history of major surgeries,tattoos,or piercings (within 6 months)</li>
                    </ul>
                    <img className='pic' src={pic2}/>
            </div>
        </div>
        <div className='section5'>
            <p>Explore donations available near me and hosptials to receive blood near me</p>
            <Link to='/explore'><button>Explore Now</button></Link>
        </div>
        <div className="section6">
            <div className='heading'>How to donate?</div>
            <ul>
                <li><span>Register:</span>Sign up our website or visit our nearest center.</li>
                <li><span>Screening:</span>Our medical team will check your eligibility.</li>
                <li><span>Donation:</span>The process takes about 10-15 minutes.</li>
                <li><span>Recovery:</span>Enjoy light refreshment and rest before resuming activities.</li>
            </ul>
        </div>
    </div>
    </>
  )
}

export default Home
