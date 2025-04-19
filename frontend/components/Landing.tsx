'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Anton } from 'next/font/google'

// Anton font for headings
const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

  
export default function LandingPage() {
    // Add preloader states
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [glitchText, setGlitchText] = useState(false)
    const heroRef = useRef<HTMLDivElement>(null)
    const [logoHover, setLogoHover] = useState(false)
    const [audioPlaying, setAudioPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [splashVisible, setSplashVisible] = useState(true);
  
    // Simulate loading progress
    useEffect(() => {
      // Simulate loading resources
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress > 100) progress = 100;
        
        setLoadingProgress(progress);
        
        if (progress === 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
          }, 500); // Short delay before hiding preloader
        }
      }, 150);
  
      // Optional: Check if video, audio and other resources are actually loaded
      const videoElem = document.querySelector('video');
      if (videoElem) {
        videoElem.addEventListener('loadeddata', () => {
          setLoadingProgress(prev => Math.max(prev, 70));
        });
      }
  
      return () => clearInterval(interval);
    }, []);
  
    // Randomize glitch effect
    useEffect(() => {
      const glitchInterval = setInterval(() => {
        setGlitchText(true)
        setTimeout(() => setGlitchText(false), 200)
      }, 3000)
      
      return () => clearInterval(glitchInterval)
    }, [])
  
    // Function to enter site and play audio
    const enterSite = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.4; // Set initial volume to 40%
        audioRef.current.play()
          .then(() => {
            setAudioPlaying(true);
            setSplashVisible(false);
          })
          .catch(error => {
            console.log("Audio play failed:", error);
            setSplashVisible(false);
          });
      } else {
        setSplashVisible(false);
      }
    };
    
    // Clean up audio when component unmounts
    useEffect(() => {
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
    }, []);
  
    // Toggle audio function
    const toggleAudio = () => {
      if (!audioRef.current) return;
      
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play()
          .catch(error => {
            console.log("Audio play failed:", error);
          });
      }
      
      setAudioPlaying(!audioPlaying);
    };
    
    return (
      <main className="min-h-screen bg-black text-white overflow-hidden pt-20">
        {/* Preloader */}
        {loading && (
          <div className="fixed inset-0 bg-black z-[110] flex flex-col items-center justify-center">
            {/* Chain Arena Logo (Static) */}
            <div className={`${anton.className} text-4xl sm:text-5xl mb-12 opacity-80`}>
              <span className="text-white">CHAIN</span>
              <span className="text-red-600">ARENA</span>
            </div>
            
            {/* Loading indicator */}
            <div className="w-64 h-1 bg-gray-800 relative mb-6 overflow-hidden">
              <div 
                className="h-full bg-red-600 absolute top-0 left-0 transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
              {/* Glitch effect on progress bar */}
              <div 
                className="h-full bg-cyan-400 absolute top-0 left-0 mix-blend-overlay opacity-50"
                style={{ 
                  width: `${loadingProgress * 0.7}%`, 
                  transform: 'translateX(10px)',
                  filter: 'blur(4px)'
                }}
              ></div>
            </div>
            
            {/* Loading Text */}
            <div className="font-mono text-sm text-gray-400 tracking-widest flex items-center">
              <span className="mr-2">LOADING</span>
              <span className="text-red-500">{loadingProgress}%</span>
              <span className="animate-pulse ml-1 text-red-500">_</span>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex">
              <div className="w-2 h-5 bg-red-600 animate-pulse mx-1"></div>
              <div className="w-2 h-8 bg-red-500 animate-pulse mx-1" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-3 bg-red-700 animate-pulse mx-1" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
  
        {/* Splash Screen - only show if preloader is done */}
        {!loading && splashVisible && (
          <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
            <div className={`${anton.className} text-5xl sm:text-6xl md:text-7xl mb-8 glitch-text ${glitchText ? 'active' : ''}`} data-text="CHAIN ARENA">
              <span className="text-white">CHAIN</span>
              <span className="text-red-600">ARENA</span>
            </div>
            <p className="cyber-text text-lg sm:text-xl mx-auto max-w-md mb-10 text-gray-400 text-center">
              Enter the ultimate blockchain gaming platform
            </p>
            <button 
              onClick={enterSite}
              className="cyber-glitch-btn relative overflow-hidden font-mono text-base font-semibold uppercase tracking-wider px-8 py-3"
            >
              <span className="cyber-glitch-btn-text">ENTER SITE</span>
              <span className="cyber-glitch-btn-glitch"></span>
            </button>
          </div>
        )}
   

      {/* Hero Section with Video Background */}
      <section 
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/70 z-10"></div> {/* Overlay to darken video */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 z-20"></div> {/* Grid pattern over video */}
          
          {/* Video element */}
          <div className="w-full h-full">
            <video 
              src="/videos/gaming-background.mp4"
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              style={{ 
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          </div>
          
          {/* Glitch effects overlay */}
          <div className="absolute inset-0 glitch-overlay z-20 opacity-20"></div>
          
          {/* Scan line animation */}
          <div className="absolute inset-0 overflow-hidden z-30">
            <div className="scan-line"></div>
          </div>
        </div>

        {/* Hero content - MOVED HIGHER with mt-[-10vh] */}
        <div className="container mx-auto px-4 z-40 text-center relative mt-[-10vh]">
          <h1 
            className={`${anton.className} text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-4`}
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
          >
            <span className="text-white">CHAIN</span>
            <span className={`ml-1 transition-all duration-300 ${
              logoHover ? 'text-red-400 shadow-red-400/50 shadow-glow' : 'text-red-600'
            }`}>ARENA</span>
          </h1>
          
          <p className="cyber-text text-lg sm:text-xl md:text-2xl mx-auto max-w-3xl mb-6 text-gray-300">
            The ultimate blockchain gaming platform for competitive players. 
            Join tournaments, form teams, and compete for crypto rewards.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              className="cyber-glitch-btn w-64 relative overflow-hidden font-mono text-sm sm:text-base font-semibold uppercase tracking-wider"
              onClick={() => {
                // Try to play audio when user interacts with buttons too
                if (audioRef.current && !audioPlaying) {
                  audioRef.current.play()
                    .then(() => setAudioPlaying(true))
                    .catch(e => console.log("Button audio play failed:", e));
                }
              }}
            >
              <span className="cyber-glitch-btn-text flex items-center justify-center">
                START PLAYING
              </span>
              <span className="cyber-glitch-btn-glitch"></span>
            </button>
            
            <Link 
              href="/tournaments" 
              className="sign-in-btn w-64 relative overflow-hidden font-mono text-sm sm:text-base font-semibold uppercase tracking-wider
                px-6 py-3 text-white bg-red-600 border border-red-600
                hover:bg-red-500 hover:shadow-md hover:shadow-red-500/30 
                transition-all duration-300 flex items-center justify-center"
              style={{ clipPath: "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)" }}
              onClick={() => {
                // Try to play audio when user clicks links too
                if (audioRef.current && !audioPlaying) {
                  audioRef.current.play()
                    .then(() => setAudioPlaying(true))
                    .catch(e => console.log("Link audio play failed:", e));
                }
              }}
            >
              VIEW TOURNAMENTS
            </Link>
          </div>
        </div>
        
        {/* Bottom decorative elements */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <div className="w-2 h-12 bg-red-600 animate-pulse mx-2"></div>
          <div className="w-1 h-8 bg-red-500 animate-pulse mx-2" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-3 h-16 bg-red-700 animate-pulse mx-2" style={{ animationDelay: '0.8s' }}></div>
        </div>
      </section>

      {/* Features Section - Changed from fixed to normal section */}
      <section className="py-24 bg-black border-t border-red-900/30">
        <div className="container mx-auto px-4">
          <h2 className={`${anton.className} text-3xl sm:text-4xl md:text-5xl mb-12 text-center text-red-600`}>
            FEATURES
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto max-w-6xl">
            {/* Tournament Feature */}
            <div className="feature-card border border-red-900/30 bg-black/80 p-6 backdrop-blur-sm relative h-full flex flex-col">
              <div className="absolute -top-5 -left-5 w-10 h-10 bg-red-600 flex items-center justify-center">
                <span className="font-mono font-bold">01</span>
              </div>
              <h3 className="font-mono text-xl mb-4 text-red-500">TOURNAMENTS</h3>
              <p className="text-gray-400 mb-auto">Join competitive gaming tournaments with real crypto prizes. Compete in daily, weekly, and monthly events across multiple games.</p>
              <div className="h-1 w-full bg-red-900/30 relative mt-6">
                <div className="h-full w-2/3 bg-red-600"></div>
              </div>
            </div>
            
            {/* Teams Feature */}
            <div className="feature-card border border-red-900/30 bg-black/80 p-6 backdrop-blur-sm relative h-full flex flex-col">
              <div className="absolute -top-5 -left-5 w-10 h-10 bg-red-600 flex items-center justify-center">
                <span className="font-mono font-bold">02</span>
              </div>
              <h3 className="font-mono text-xl mb-4 text-red-500">TEAMS</h3>
              <p className="text-gray-400 mb-auto">Form esports teams, recruit players, and compete together. Team management system with performance analytics and role assignments.</p>
              <div className="h-1 w-full bg-red-900/30 relative mt-6">
                <div className="h-full w-3/4 bg-red-600"></div>
              </div>
            </div>
            
            {/* Blockchain Feature */}
            <div className="feature-card border border-red-900/30 bg-black/80 p-6 backdrop-blur-sm relative h-full flex flex-col">
              <div className="absolute -top-5 -left-5 w-10 h-10 bg-red-600 flex items-center justify-center">
                <span className="font-mono font-bold">03</span>
              </div>
              <h3 className="font-mono text-xl mb-4 text-red-500">BLOCKCHAIN</h3>
              <p className="text-gray-400 mb-auto">Built on Solana for lightning-fast transactions and low fees. Win rewards, trade NFTs, and track all your assets securely on-chain.</p>
              <div className="h-1 w-full bg-red-900/30 relative mt-6">
                <div className="h-full w-1/2 bg-red-600"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clear divider between sections */}
      <div className="relative h-24 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent"></div>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45">
          <div className="bg-red-600/30 w-8 h-8 transform rotate-45"></div>
        </div>
      </div>

      {/* Stats Section with Improved Alignment */}
      <section className="py-16 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        
        <div className="container mx-auto px-4 z-10 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 mx-auto max-w-6xl">
            <div className="text-center flex flex-col items-center justify-center">
              <div className={`${anton.className} text-3xl sm:text-4xl md:text-5xl text-red-600 glitch-counter`} data-text="100K+">100K+</div>
              <p className="font-mono text-sm mt-2 text-gray-400">ACTIVE PLAYERS</p>
            </div>
            <div className="text-center flex flex-col items-center justify-center">
              <div className={`${anton.className} text-3xl sm:text-4xl md:text-5xl text-red-600 glitch-counter`} data-text="5K+">5K+</div>
              <p className="font-mono text-sm mt-2 text-gray-400">TOURNAMENTS</p>
            </div>
            <div className="text-center flex flex-col items-center justify-center">
              <div className={`${anton.className} text-3xl sm:text-4xl md:text-5xl text-red-600 glitch-counter`} data-text="$2M+">$2M+</div>
              <p className="font-mono text-sm mt-2 text-gray-400">PRIZES AWARDED</p>
            </div>
            <div className="text-center flex flex-col items-center justify-center">
              <div className={`${anton.className} text-3xl sm:text-4xl md:text-5xl text-red-600 glitch-counter`} data-text="12K+">12K+</div>
              <p className="font-mono text-sm mt-2 text-gray-400">TEAMS REGISTERED</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Improved Alignment */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`${anton.className} text-3xl sm:text-5xl md:text-6xl mb-6 text-white leading-tight`}>
              READY TO <span className="text-red-600">DOMINATE</span> THE ARENA?
            </h2>
            <p className="text-gray-400 mb-10 text-lg max-w-2xl mx-auto">
              Join thousands of players already competing in the Chain Arena ecosystem. 
              Connect your wallet, form your team, and start playing today.
            </p>
            
            <button 
              className="cyber-glitch-btn relative overflow-hidden font-mono text-base font-semibold uppercase tracking-wider mx-auto"
              onClick={() => {
                // Try to play audio when user interacts with buttons too
                if (audioRef.current && !audioPlaying) {
                  audioRef.current.play()
                    .then(() => setAudioPlaying(true))
                    .catch(e => console.log("Button audio play failed:", e));
                }
              }}
            >
              <span className="cyber-glitch-btn-text flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                CONNECT_WALLET
              </span>
              <span className="cyber-glitch-btn-glitch"></span>
            </button>
          </div>
        </div>
      </section>

      {/* Audio player */}
      <audio 
        ref={audioRef}
        src="/audio/cyberpunk-background.mp3" 
        loop 
      />

      {/* Audio control button - floating in bottom corner */}
      <button 
        onClick={toggleAudio}
        className="fixed bottom-8 right-8 z-50 bg-black/70 hover:bg-red-900/70 rounded-full p-3 backdrop-blur-sm border border-red-600/50 transition-all duration-300 shadow-lg shadow-red-600/30"
        aria-label={audioPlaying ? "Mute music" : "Play music"}
      >
        {audioPlaying ? (
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 7.22L9.603 10H6v4h3.603L13 16.78V7.22zM8.889 16H5a1 1 0 01-1-1V9a1 1 0 011-1h3.889l5.294-4.332a.5.5 0 01.817.387v15.89a.5.5 0 01-.817.387L8.89 16z" />
            <path d="M15.536 12l1.732-1.732a.75.75 0 00-1.06-1.06L14.475 10.94l-1.732-1.732a.75.75 0 10-1.06 1.06L13.414 12l-1.732 1.732a.75.75 0 101.06 1.06l1.733-1.732 1.732 1.732a.75.75 0 101.06-1.06L15.536 12z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 7.22L9.603 10H6v4h3.603L13 16.78V7.22zM8.889 16H5a1 1 0 01-1-1V9a1 1 0 011-1h3.889l5.294-4.332a.5.5 0 01.817.387v15.89a.5.5 0 01-.817.387L8.89 16z" />
            <path d="M17.418 11.143a.75.75 0 01.176 1.046 5.13 5.13 0 01-1.381 1.548.75.75 0 01-.934-1.174 3.63 3.63 0 00.977-1.096.75.75 0 011.162-.324z" />
            <path d="M18.774 8.245a.75.75 0 01.175 1.046 8.43 8.43 0 01-2.851 2.874.75.75 0 01-.848-1.236 6.93 6.93 0 002.342-2.36.75.75 0 011.182-.324z" />
            <path d="M20.073 5.536a.75.75 0 01.176 1.046 11.47 11.47 0 01-4.25 4.12.75.75 0 01-.718-1.316 9.97 9.97 0 003.698-3.58.75.75 0 011.094-.27z" />
          </svg>
        )}
      </button>
    </main>
  )
}