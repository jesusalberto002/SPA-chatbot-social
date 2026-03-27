import { Facebook, Twitter, Instagram } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"
import { FloatingElements } from "@/components/floating-elements"
import { InteractiveButton } from "@/components/interactive-button"
import { ValueCard } from "@/components/value-card"
import { ProductCard } from "@/components/product-card"
import { Navigation } from "@/components/navigation"
import { useNavigate } from "react-router-dom"
import { href } from "react-router-dom"
import { cn } from "@/lib/utils"

import SubscriptionPage from "./SubscriptionPage"

export default function FrontPage() {

  const navigate = useNavigate() 

  const handleStartNowClick = () => {
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <FloatingElements />
      <Navigation isFrontPage={true} />

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 1. Background Image Div */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/landingPage/Untitled design (9).png")', // <-- UPDATE THIS PATH to your image
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>

        {/* 2. Dimming Overlay Div */}
        <div className="absolute inset-0 bg-black/60 z-10"></div> 

        {/* Decorative background (generic, no trademark) */}
        <div className="absolute inset-0 opacity-10 z-20 pointer-events-none">
          <div className="w-[min(85vw,720px)] h-[min(85vw,720px)] rounded-full bg-gradient-to-br from-gray-600/40 to-gray-900/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-3xl animate-float" />
        </div>

        {/* 4. Original Content (z-index updated) */}
        <AnimatedSection className="relative z-30 text-center px-4 max-w-6xl mx-auto" animation="fadeIn">
          {/* <AnimatedSection
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 animate-pulse-glow"
            animation="scaleIn"
            delay={200}
          >
            <img
              src="/logo-on-dark-bg.svg"
              alt="App logo"
              width={150}
              height={50}
              className="flex-shrink-0"
              loading="lazy"
            />
          </AnimatedSection> */}
          <AnimatedSection animation="slideUp" delay={400}>
            <p className="text-lg mb-4 text-gray-300 tracking-wide">YOU'RE NOT ALONE</p>
          </AnimatedSection>
          <AnimatedSection animation="slideUp" delay={600}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-gradient">
              A SAFE
              <br />
              PLACE TO
              <br />
              REFLECT
              <br />
              TALK &
              <br />
              <span className="text-gray-400">GROW</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection animation="scaleIn" delay={800}>
            <InteractiveButton className="bg-white text-black hover:bg-gray-200 text-lg px-12 py-6 rounded-full font-semibold tracking-wide" 
            onClick={() => handleStartNowClick()}>
              START NOW
            </InteractiveButton>
          </AnimatedSection>
        </AnimatedSection>
      </section>

      {/* Services Section */}
      <section
  	  id="services"
  	  className="relative py-32 overflow-hidden" // Section padding
  	>
        {/* Background Image for Services */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/landingPage/Untitled design (11).png")', // <-- Main section BG image
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed' 
          }}
        ></div>
        
        {/* Dimming Overlay for Section */}
        <div className="absolute inset-0 bg-purple-900/80 z-10"></div>

  	  <div className="container relative z-20 mx-auto px-4">
  		<div className="grid lg:grid-cols-2 gap-12 items-center">
  		  <AnimatedSection animation="slideLeft">
  			<div className="mb-8">
  			  <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
  				OUR
  				<br />
  				SERVICES
  			  </h2>
  			  <p className="text-2xl text-purple-300 mb-8 font-semibold">
              Whenever you need to talk, we’re here — day or night. 
              Join others who understand what you’re going through in our supportive community groups, 
              or take a quiet moment to reflect and find calm on your own terms.</p>
{/*   			  <InteractiveButton className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-semibold">
  				VIEW HERE
  			  </InteractiveButton> */}
  			</div>
  		  </AnimatedSection>
  		  <AnimatedSection animation="slideRight" delay={200}>
  			<div className="grid grid-cols-2 gap-6">
  			  <div className="space-y-6">
                {/* Card 1 - Image is now the background */}
  				<div 
                  className="relative rounded-3xl h-56 hover-lift hover-glow overflow-hidden" 
                  style={{
                    backgroundImage: 'url("/landingPage/Untitled design (8).png")', // <-- Replace with your image
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 z-10"></div> {/* Dimming overlay */}
                  <div className="relative z-20 p-6 flex flex-col justify-end h-full">
                    {/* <h3 className="text-white text-lg font-bold">Therapy Sessions</h3> */}
                  </div>
                </div>
                {/* Card 2 - Image is now the background */}
  				<div 
                  className="relative rounded-3xl h-40 hover-lift hover-glow overflow-hidden"
                  style={{
                    backgroundImage: 'url("/landingPage/Untitled design (10).png")', // <-- Replace with your image
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 z-10"></div>
                  <div className="relative z-20 p-6 flex flex-col justify-end h-full">
                    {/* <h3 className="text-white text-lg font-bold">Self Reflection</h3> */}
                  </div>
                </div>
  			  </div>
  			  <div className="space-y-6 pt-12">
                {/* Card 3 - Image is now the background */}
  				<div 
                  className="relative rounded-3xl h-40 hover-lift hover-glow overflow-hidden"
                  style={{
                    backgroundImage: 'url("/landingPage/Untitled design (13).png")', // <-- Replace with your image
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 z-10"></div>
                  <div className="relative z-20 p-6 flex flex-col justify-end h-full">
                    {/* <h3 className="text-white text-lg font-bold">Group Therapy</h3> */}
                  </div>
                </div>
                {/* Card 4 - Image is now the background */}
  				<div 
                  className="relative rounded-3xl h-56 hover-lift hover-glow overflow-hidden"
                  style={{
                    backgroundImage: 'url("/landingPage/Untitled design (14).png")', // <-- Replace with your image
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 z-10"></div>
                  <div className="relative z-20 p-6 flex flex-col justify-end h-full">
                    {/* <h3 className="text-white text-lg font-bold">Individual Counseling</h3> */}
                  </div>
                </div>
  			  </div>
  			</div>
  		  </AnimatedSection>
  		</div>
  	  </div>
  	</section>

    {/* Values Section */}
    <section id="values" className="py-20 bg-gradient-to-br from-black via-gray-900 to-black">
    <div className="container mx-auto px-4">
      <AnimatedSection animation="slideUp">
      <div className="mb-12">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">VALUES</h2>
      </div>
      </AnimatedSection>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedSection animation="scaleIn" delay={0}>
        <ValueCard
          title="COMPASSION"
          image="/landingPage/Untitled design (18).png"
          gradient="bg-gradient-to-br from-blue-200 to-blue-300"
          textColor="text-orange-600"
          delay={0}
          hoverText="We approach every interaction with empathy, kindness, and a deep understanding of the human experience."
        />
        </AnimatedSection>
        <AnimatedSection animation="scaleIn" delay={100}>
        <ValueCard
          title="INNOVATION"
          image="/landingPage/Untitled design (33).png"
          gradient="bg-gradient-to-br from-purple-300 to-purple-400"
          textColor="text-white"
          delay={100}
          hoverText="We pioneer new ways to use technology, making mental wellness more effective and engaging for everyone."
        />
        </AnimatedSection>
        <AnimatedSection animation="scaleIn" delay={200}>
        <ValueCard
          title="ACCESSIBILITY"
          image="/landingPage/Untitled design (30).png"
          gradient="bg-gradient-to-br from-yellow-400 to-orange-500"
          textColor="text-white"
          delay={200}
          hoverText="We believe quality mental health support should be available to all, regardless of location or background."
        />
        </AnimatedSection>
        <AnimatedSection animation="scaleIn" delay={300}>
        <ValueCard
          title="INCLUSIVITY"
          image="/landingPage/Untitled design (40).png"
          gradient="bg-gradient-to-br from-orange-400 to-red-500"
          textColor="text-white"
          delay={300}
          hoverText="We build a safe and welcoming space for every individual, celebrating all identities and perspectives."
        />
        </AnimatedSection>
        <AnimatedSection animation="scaleIn" delay={400}>
        <ValueCard
          title="CONFIDENTIALITY"
          image="/landingPage/Untitled design (16).png"
          gradient="bg-gradient-to-br from-red-400 to-red-600"
          textColor="text-white"
          delay={400}
          hoverText="Your privacy is our priority. We are committed to protecting your data and ensuring a secure environment."
        />
        </AnimatedSection>
        <AnimatedSection animation="scaleIn" delay={500}>
        <ValueCard
          title="QUALITY"
          image="/landingPage/Untitled design (25).png"
          gradient="bg-gradient-to-br from-blue-300 to-purple-400"
          textColor="text-purple-600"
          delay={500}
          hoverText="We are dedicated to excellence, from our AI models to our user experience, ensuring you receive the best support."
        />
        </AnimatedSection>
        <AnimatedSection animation="scaleIn" delay={600}>
        <ValueCard
          title="TRANSPARENCY"
          image="/landingPage/Untitled design (22).png"
          gradient="bg-gradient-to-br from-yellow-200 to-yellow-400"
          textColor="text-orange-600"
          delay={600}
          hoverText="We operate with honesty and clarity, so you always understand how our platform works for you."
        />
        </AnimatedSection>
      </div>
    </div>
  </section>

    <section 
      className="bg-blue-950/50 backdrop-blur py-32 bg-gradient-to-br from-black via-gray-900 to-black text-white"
      style={{ // <-- Corrected: Inlined style object needs double curly braces
        backgroundImage: `url('/landingPage/Untitled design (4).png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay', // Blends with the gradient
        position: 'relative' // Needed for blending
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* <AnimatedSection animation="slideLeft"> */}
          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              THERAPY
              <br />
              REIMAGINED
            </h2>
            <p className="text-lg text-gray-300 mb-6 tracking-wide">
              THE FUTURE OF MENTAL HEALTH
              <br />
              WELLNESS AND FUTURISTIC
              <br />
              THERAPY
            </p>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-lg">
              THE FOUNDATION OF ADVANCED MENTAL
              <br />
              WELL-BEING IN THE PALM OF YOUR HANDS
              <br />
              WITHOUT ANY JUDGEMENT OR STRESS.
            </p>
            {/* <InteractiveButton className="bg-white text-black hover:bg-gray-200 text-lg px-12 py-6 rounded-full font-semibold tracking-wide"> */}
            <button className="bg-white text-black hover:bg-gray-200 text-lg px-12 py-6 rounded-full font-semibold tracking-wide transition-colors">
              START NOW
            </button>
            {/* </InteractiveButton> */}
          </div>
          {/* </AnimatedSection> */}
          
          {/* <AnimatedSection animation="slideRight" delay={200}> */}
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="space-y-4">
              <div className="rounded-3xl h-48 hover-lift card-tilt group relative overflow-hidden">
                <img
                  src={"/landingPage/Untitled design (23).png"}
                  alt="Therapy session"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              {/* Card 2 */}
              <div className="rounded-3xl h-48 hover-lift card-tilt group relative overflow-hidden">
                <img
                  src={"/landingPage/Untitled design (26).png"}
                  alt="Mental health support"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="space-y-4">
              <div className="rounded-3xl h-48 hover-lift card-tilt group relative overflow-hidden">
                <img
                  src={"/landingPage/Untitled design (27).png"}
                  alt="Group support"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              {/* Card 4 */}
              <div className="rounded-3xl h-48 hover-lift card-tilt group relative overflow-hidden">
                <img
                  src={"/landingPage/Untitled design (44).png"}
                  alt="Individual counseling"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
          </div>
          {/* </AnimatedSection> */}
        </div>
      </div>
    </section>

      {/* Products Section */}
      <section
    id="products"
    // 1. Class changes: removed gradient, added relative/overflow, matched padding
    className="relative py-32 overflow-hidden"
  >
    {/* 2. Added Background Image (with parallax 'fixed') */}
    <div
      className="absolute inset-0 z-0"
      style={{
        // Using an abstract purple image
        backgroundImage: 'url("/landingPage/Untitled design (11).png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    ></div>
    
    {/* 3. Added Dimming Overlay */}
    <div className="absolute inset-0 bg-purple-900/80 z-10"></div>

    {/* 4. Promoted main content container to z-20 */}
    <div className="container relative z-20 mx-auto md:px-4">
      <AnimatedSection animation="slideUp">
        <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 text-white px-4 md:px-0">
          OUR PRODUCTS
        </h2>
      </AnimatedSection>
      
      {/* This is the scrolling container for mobile / grid for desktop */}
      <div className={cn(
        "flex flex-row overflow-x-auto gap-6 px-4",
        "snap-x snap-mandatory overscroll-x-contain",
        "py-6", // Padding for hover animation room
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]", // Hides scrollbar
        "md:grid md:grid-cols-2 md:gap-8 md:p-0 md:overflow-visible", // Desktop grid
        "max-w-4xl md:mx-auto" // Desktop centering
      )}>
        
        {/* BRONZE CARD */}
        <AnimatedSection 
          animation="scaleIn" 
          delay={0}
          className="flex-shrink-0 w-[90vw] max-w-md md:w-full snap-center"
        >
          <ProductCard
            title="BRONZE"
            image="/landingPage/Untitled design (43).png"
            gradient="bg-gradient-to-br from-yellow-900 via-orange-700 to-yellow-950"
            imageGradient="bg-gradient-to-br from-yellow-800 via-orange-600 to-yellow-900"
            textColor="text-white"
            delay={0}
          />
        </AnimatedSection>
        
        {/* PLATINUM CARD */}
        <AnimatedSection 
          animation="scaleIn" 
          delay={200}
          className="flex-shrink-0 w-[90vw] max-w-md md:w-full snap-center"
        >
          <ProductCard
            title="PLATINUM"
            image="/landingPage/Untitled design (42).png"
            gradient="bg-gradient-to-br from-slate-500 via-gray-300 to-slate-800"
            imageGradient="bg-gradient-to-br from-gray-200 via-slate-100 to-gray-300"
            textColor="text-gray-900"
            delay={400}
          />
        </AnimatedSection>

      </div>
    </div>
  </section>

      {/* About Section */}
      <section
        id="about"
        className="py-40 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 animate-gradient"
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="slideLeft">
              <div>
                <h2 className="text-6xl md:text-8xl font-bold mb-8 text-white leading-tight">ABOUT US</h2>
                <div className="space-y-6 text-white">
                  <p className="text-lg leading-relaxed">
                    This demo showcases how technology can support mental well-being. It is presented by a small
                    team focused on a more accessible and supportive mental health
                    landscape.
                  </p>
                  <p className="text-lg leading-relaxed">
                    The demo is an AI-powered experience designed to illustrate personalized mental health support. Our
                    mission is to make high-quality mental health resources available to everyone, regardless of their
                    location, income, or background.
                  </p>
                </div>
                {/* <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <InteractiveButton className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-semibold">
                    SEE OUR PRODUCTS
                  </InteractiveButton>
                  <InteractiveButton
                    variant="outline"
                    className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 rounded-full font-semibold"
                  >
                    GET IN TOUCH
                  </InteractiveButton>
                </div> */}
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slideRight" delay={200}>
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl max-w-md hover-lift">
                  <img
                    src={"/landingPage/Untitled design (24).png"}
                    alt="Person in wheelchair playing basketball"
                    width={400}
                    height={400}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="scaleIn">
            <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden hover-lift">
              <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-12 flex flex-col justify-center relative animate-gradient">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/90 to-blue-600/90"></div>
                <div className="relative z-10">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    CONTACT AND
                    <br />
                    SUPPORT
                  </h2>
                  <p className="text-xl text-white font-semibold">COMMUNITY DEMO</p>
                </div>
              </div>
              <div className="bg-gray-900 p-12 flex flex-col justify-center">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-400 mb-4">EMAIL</h3>
                    <p className="text-white text-lg">support@example.com</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-400 mb-6">SOCIAL</h3>
                    <div className="flex space-x-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-300 cursor-pointer hover:scale-110 hover-glow">
                        <Facebook className="w-6 h-6 text-black" />
                      </div>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-300 cursor-pointer hover:scale-110 hover-glow">
                        <Twitter className="w-6 h-6 text-black" />
                      </div>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-300 cursor-pointer hover:scale-110 hover-glow">
                        <Instagram className="w-6 h-6 text-black" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0 hover:scale-105 transition-transform duration-300">
              <img src="/logo-on-dark-bg.svg" alt="" width={32} height={32} className="h-8 w-auto opacity-90" />
              <span className="text-xl font-bold text-white">Wellness demo</span>
            </div>
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Demo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}