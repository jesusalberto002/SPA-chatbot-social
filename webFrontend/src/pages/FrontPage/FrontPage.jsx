import { Facebook, Twitter, Instagram } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"
import { FloatingElements } from "@/components/floating-elements"
import { InteractiveButton } from "@/components/interactive-button"
import { ValueCard } from "@/components/value-card"
import { ProductCard } from "@/components/product-card"
import { Navigation } from "@/components/navigation"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

export default function FrontPage() {
  const navigate = useNavigate()

  const handleStartNowClick = () => {
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <FloatingElements />
      <Navigation isFrontPage={true} />

      {/* Hero */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900"
      >
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[min(80vw,600px)] h-[min(80vw,600px)] rounded-full bg-indigo-600/30 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[min(70vw,500px)] h-[min(70vw,500px)] rounded-full bg-teal-600/20 blur-3xl" />
        </div>

        <AnimatedSection className="relative z-30 text-center px-4 max-w-4xl mx-auto" animation="fadeIn">
          <AnimatedSection animation="slideUp" delay={400}>
            <p className="text-sm md:text-base mb-4 text-indigo-300 tracking-[0.2em] uppercase font-semibold">
              Interactive product demo
            </p>
          </AnimatedSection>
          <AnimatedSection animation="slideUp" delay={600}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="text-gradient">Explore the experience</span>
              <br />
              <span className="text-slate-200">without real patient data</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection animation="slideUp" delay={700}>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              This preview uses mock content and sample accounts so you can click through chats, community, and
              settings safely. Nothing here is medical advice or a live service.
            </p>
          </AnimatedSection>
          <AnimatedSection animation="scaleIn" delay={800}>
            <InteractiveButton
              className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-12 py-6 rounded-full font-semibold tracking-wide"
              onClick={() => handleStartNowClick()}
            >
              Open demo login
            </InteractiveButton>
          </AnimatedSection>
        </AnimatedSection>
      </section>

      {/* Highlights — was “Services” */}
      <section id="services" className="relative py-32 overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-indigo-950">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.35),transparent_50%)]" />
        <div className="container relative z-20 mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="slideLeft">
              <div className="mb-8">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
                  What you can try
                </h2>
                <p className="text-xl text-purple-200/95 mb-4 font-medium leading-relaxed">
                  Walk through the same screens a full build would ship—using placeholder copy and seeded demo users.
                </p>
                <p className="text-lg text-purple-300/80 leading-relaxed">
                  Use <span className="text-white font-semibold">Demo access</span> on the login page to skip typing
                  credentials, or sign in with any test account your host provides.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slideRight" delay={200}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="relative rounded-3xl h-56 overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-900 shadow-xl shadow-emerald-900/30" />
                  <div className="relative rounded-3xl h-40 overflow-hidden bg-gradient-to-br from-amber-500 to-orange-800 shadow-lg shadow-orange-900/20" />
                </div>
                <div className="space-y-6 pt-12">
                  <div className="relative rounded-3xl h-40 overflow-hidden bg-gradient-to-br from-sky-500 to-blue-900 shadow-lg shadow-blue-900/20" />
                  <div className="relative rounded-3xl h-56 overflow-hidden bg-gradient-to-br from-fuchsia-600 to-purple-900 shadow-xl shadow-purple-900/30" />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section id="values" className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="slideUp">
            <div className="mb-12 text-center lg:text-left">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">Demo principles</h2>
              <p className="text-slate-400 max-w-2xl mx-auto lg:mx-0 text-lg">
                Placeholder pillars for this mock—hover a card to read the blurb.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedSection animation="scaleIn" delay={0}>
              <ValueCard
                title="CLARITY"
                gradient="bg-gradient-to-br from-blue-500 to-indigo-700"
                textColor="text-white"
                delay={0}
                hoverText="Labels and flows are simplified so reviewers can focus on UX, not fine print."
              />
            </AnimatedSection>
            <AnimatedSection animation="scaleIn" delay={100}>
              <ValueCard
                title="SAFETY"
                gradient="bg-gradient-to-br from-violet-500 to-purple-800"
                textColor="text-white"
                delay={100}
                hoverText="No real PHI in this environment—treat all data as fictional."
              />
            </AnimatedSection>
            <AnimatedSection animation="scaleIn" delay={200}>
              <ValueCard
                title="SPEED"
                gradient="bg-gradient-to-br from-amber-400 to-orange-600"
                textColor="text-white"
                delay={200}
                hoverText="Fast paths like one-tap demo login help stakeholders get to the product quickly."
              />
            </AnimatedSection>
            <AnimatedSection animation="scaleIn" delay={300}>
              <ValueCard
                title="FEEDBACK"
                gradient="bg-gradient-to-br from-rose-500 to-red-700"
                textColor="text-white"
                delay={300}
                hoverText="Built to invite critique: layout, IA, and tone are all fair game."
              />
            </AnimatedSection>
            <AnimatedSection animation="scaleIn" delay={400}>
              <ValueCard
                title="ITERATION"
                gradient="bg-gradient-to-br from-cyan-500 to-blue-800"
                textColor="text-white"
                delay={400}
                hoverText="Expect rough edges—this stack is for evaluation, not certification."
              />
            </AnimatedSection>
            <AnimatedSection animation="scaleIn" delay={500}>
              <ValueCard
                title="OPENNESS"
                gradient="bg-gradient-to-br from-lime-500 to-emerald-800"
                textColor="text-white"
                delay={500}
                hoverText="Source and architecture can be discussed alongside the UI walkthrough."
              />
            </AnimatedSection>
            <AnimatedSection animation="scaleIn" delay={600}>
              <ValueCard
                title="CONTEXT"
                gradient="bg-gradient-to-br from-pink-500 to-fuchsia-800"
                textColor="text-white"
                delay={600}
                hoverText="Copy is generic on purpose so you can imagine your own brand voice."
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Feature grid — was therapy / stock imagery */}
      <section className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,58,138,0.4)_0%,transparent_45%,rgba(15,118,110,0.25)_100%)]" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
                Mock screens,
                <br />
                real interactions
              </h2>
              <p className="text-lg text-slate-300 mb-4 tracking-wide">
                Styling, routing, and API wiring behave like production—only the dataset is fake.
              </p>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-lg">
                Use this section to narrate what reviewers should pay attention to: performance, accessibility, or
                integration points. Numbers below are illustrative only.
              </p>
              <button
                type="button"
                onClick={handleStartNowClick}
                className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-10 py-4 rounded-full font-semibold tracking-wide transition-colors"
              >
                Go to login
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-3xl h-48 bg-gradient-to-br from-indigo-600/80 to-slate-900 border border-white/10 shadow-lg" />
                <div className="rounded-3xl h-48 bg-gradient-to-br from-teal-600/80 to-slate-900 border border-white/10 shadow-lg" />
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl h-48 bg-gradient-to-br from-violet-600/80 to-slate-900 border border-white/10 shadow-lg" />
                <div className="rounded-3xl h-48 bg-gradient-to-br from-amber-600/70 to-slate-900 border border-white/10 shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="relative py-32 overflow-hidden bg-gradient-to-b from-purple-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(88,28,135,0.35),transparent_70%)]" />
        <div className="container relative z-20 mx-auto md:px-4">
          <AnimatedSection animation="slideUp">
            <h2 className="text-4xl md:text-6xl font-bold text-center mb-6 text-white px-4 md:px-0">
              Plan tiers (sample)
            </h2>
            <p className="text-center text-slate-400 max-w-xl mx-auto mb-12 px-4">
              Pricing UI is shown for layout only—no charges run in this demo unless configured by the host.
            </p>
          </AnimatedSection>

          <div
            className={cn(
              "flex flex-row overflow-x-auto gap-6 px-4",
              "snap-x snap-mandatory overscroll-x-contain",
              "py-6",
              "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
              "md:grid md:grid-cols-2 md:gap-8 md:p-0 md:overflow-visible",
              "max-w-4xl md:mx-auto",
            )}
          >
            <AnimatedSection animation="scaleIn" delay={0} className="flex-shrink-0 w-[90vw] max-w-md md:w-full snap-center">
              <ProductCard
                title="BRONZE"
                image={null}
                gradient="bg-gradient-to-br from-yellow-900 via-amber-800 to-yellow-950"
                imageGradient="bg-gradient-to-br from-amber-700 via-yellow-800 to-amber-950"
                textColor="text-white"
                delay={0}
              />
            </AnimatedSection>

            <AnimatedSection animation="scaleIn" delay={200} className="flex-shrink-0 w-[90vw] max-w-md md:w-full snap-center">
              <ProductCard
                title="PLATINUM"
                image={null}
                gradient="bg-gradient-to-br from-slate-600 via-slate-500 to-slate-800"
                imageGradient="bg-gradient-to-br from-slate-400 via-zinc-300 to-slate-600"
                textColor="text-gray-900"
                delay={400}
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-40 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="slideLeft">
              <div>
                <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white leading-tight">About this build</h2>
                <div className="space-y-6 text-slate-300">
                  <p className="text-lg leading-relaxed">
                    This is a standalone demo for portfolios and stakeholder reviews. Features are wired to a sandbox
                    backend with seeded users and placeholder content.
                  </p>
                  <p className="text-lg leading-relaxed">
                    It is not a substitute for professional care. Any resemblance to a production wellness product is
                    intentional for UI/UX evaluation only.
                  </p>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slideRight" delay={200}>
              <div className="flex justify-center">
                <div className="w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br from-cyan-500/90 via-blue-600 to-indigo-800 shadow-2xl shadow-blue-900/40 flex items-center justify-center p-10 border border-white/10">
                  <p className="text-center text-white/95 text-lg font-medium leading-relaxed">
                    Visual placeholder — no stock photography in this demo landing.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="scaleIn">
            <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden hover-lift border border-slate-800">
              <div className="bg-gradient-to-br from-cyan-600 to-blue-800 p-12 flex flex-col justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/95 to-blue-800/95" />
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    Questions about the demo?
                  </h2>
                  <p className="text-lg text-cyan-100 font-medium">
                    Reach out through the channels your host listed—this form is static in the preview.
                  </p>
                </div>
              </div>
              <div className="bg-slate-900 p-12 flex flex-col justify-center">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-cyan-400 mb-4">EMAIL</h3>
                    <p className="text-white text-lg">demo-contact@example.com</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-cyan-400 mb-6">SOCIAL</h3>
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

      <footer className="bg-black border-t border-slate-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0 hover:scale-105 transition-transform duration-300">
              <img src="/logo-on-dark-bg.svg" alt="" width={32} height={32} className="h-8 w-auto opacity-90" />
              <span className="text-xl font-bold text-white">Product demo</span>
            </div>
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Demo preview. Not a live service.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
