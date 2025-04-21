'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Anton } from 'next/font/google'
import ParticleBackground from './ParticleBackground';
import { useRouter } from 'next/navigation'

// Anton font for headings
const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

  
export default function LandingPage() {
    // Add preloader states
      const router = useRouter() // Initialize the router hook here
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [glitchText, setGlitchText] = useState(false)
    const heroRef = useRef<HTMLDivElement>(null)
    const [logoHover, setLogoHover] = useState(false)
    const [audioPlaying, setAudioPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [splashVisible, setSplashVisible] = useState(true);
    const handleSignUp = () => {
      router.push('/signup')
    }
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
    // Add this useEffect inside your LandingPage component (before the return statement)

// Counter animation for stats
useEffect(() => {
    const counters = document.querySelectorAll('.counter-value');
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };
  
    const animateCounter = (counter: Element) => {
      const target = parseInt(counter.getAttribute('data-target') || '0', 10);
      const duration = 2000; // Animation duration in ms
      const stepTime = 20; // Update interval in ms
      const initialValue = parseInt(counter.textContent?.replace(/\D/g, '') || '0', 10);
      const valueIncrement = (target - initialValue) / (duration / stepTime);
      
      let currentValue = initialValue;
      const formatValue = (value: number) => {
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M+`;
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K+`;
        }
        return `${Math.floor(value)}+`;
      };
      
      if (target > initialValue) {
        const timer = setInterval(() => {
          currentValue += valueIncrement;
          if (counter.textContent?.includes('$')) {
            counter.textContent = `$${formatValue(currentValue)}`;
          } else {
            counter.textContent = formatValue(currentValue);
          }
          
          if (currentValue >= target) {
            if (counter.textContent?.includes('$')) {
              counter.textContent = `$${formatValue(target)}`;
            } else {
              counter.textContent = formatValue(target);
            }
            clearInterval(timer);
          }
        }, stepTime);
      }
    };
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);
  
    counters.forEach(counter => {
      observer.observe(counter);
    });
  
    return () => {
      counters.forEach(counter => {
        observer.unobserve(counter);
      });
    };
  }, []);
  // Add this to your component
useEffect(() => {
    const parallaxContainers = document.querySelectorAll('.parallax-slow');
    
    const handleMouseMove = (e: MouseEvent) => {
      parallaxContainers.forEach(container => {
        const rect = (container as HTMLElement).getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate the distance from mouse to center as a percentage
        const distanceX = (e.clientX - centerX) / window.innerWidth;
        const distanceY = (e.clientY - centerY) / window.innerHeight;
        
        // Apply transform to container
        (container as HTMLElement).style.transform = `perspective(1000px) rotateY(${distanceX * 3}deg) rotateX(${-distanceY * 3}deg)`;
        
        // Apply transforms to child elements with different intensities
        const items = container.querySelectorAll('.parallax-item');
        items.forEach((item, index) => {
          const depth = 1 + index * 0.5;  // Increase depth for each element
          (item as HTMLElement).style.transform = `translateX(${distanceX * 15 * depth}px) translateY(${distanceY * 15 * depth}px)`;
        });
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
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
          <ParticleBackground />
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
                }       router.push('/signup'); 
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
              <h3 className="font-mono text-xl mb-4 text-red-500">Win Crypto & NFTs</h3>
              {/* --- Updated Description --- */}
              <p className="text-gray-400 mb-auto">
                Dominate the competition and earn verifiable rewards. Win crypto instantly to your wallet and unlock exclusive, on-chain NFT achievements for your victories.
              </p>
              {/* --- End Updated Description --- */}
              <div className="h-1 w-full bg-red-900/30 relative mt-6">
                <div className="h-full w-2/3 bg-red-600"></div>
              </div>
            </div>

            {/* Game Agnostic Feature */}
            <div className="feature-card border border-red-900/30 bg-black/80 p-6 backdrop-blur-sm relative h-full flex flex-col">
              <div className="absolute -top-5 -left-5 w-10 h-10 bg-red-600 flex items-center justify-center">
                <span className="font-mono font-bold">02</span>
              </div>
              <h3 className="font-mono text-xl mb-4 text-red-500">Compete In Any Game</h3>
              {/* --- Updated Description --- */}
              <p className="text-gray-400 mb-auto">
                Your game, our arena. ChainArena supports any competitive title, bringing diverse gaming communities together for organized play and blockchain-backed rewards.
              </p>
              {/* --- End Updated Description --- */}
              <div className="h-1 w-full bg-red-900/30 relative mt-6">
                <div className="h-full w-3/4 bg-red-600"></div>
              </div>
            </div>

            {/* Solana Feature */}
            <div className="feature-card border border-red-900/30 bg-black/80 p-6 backdrop-blur-sm relative h-full flex flex-col">
              <div className="absolute -top-5 -left-5 w-10 h-10 bg-red-600 flex items-center justify-center">
                <span className="font-mono font-bold">03</span>
              </div>
              <h3 className="font-mono text-xl mb-4 text-red-500">Solana Powered</h3>
              {/* --- Updated Description --- */}
              <p className="text-gray-400 mb-auto">
                Experience the Solana advantage: benefit from blazing speed, ultra-low fees for payouts & entries, and provably fair results recorded directly on the blockchain.
              </p>
              {/* --- End Updated Description --- */}
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

   {/* Enhanced Stats Section with Counter Animation */}
<section className="py-20 bg-black relative overflow-hidden">
  <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
  
  {/* Animated background elements */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute h-px w-32 bg-red-600/50 animate-float-slow top-1/4 left-1/4"></div>
    <div className="absolute h-px w-48 bg-red-600/30 animate-float-medium top-2/3 right-1/5"></div>
    <div className="absolute h-32 w-px bg-red-600/40 animate-float-fast bottom-1/4 right-1/3"></div>
    <div className="absolute h-16 w-px bg-red-600/20 animate-float-reverse bottom-1/2 left-1/3"></div>
  </div>
  
  <div className="container mx-auto px-4 z-10 relative">
    <h2 className={`${anton.className} text-3xl sm:text-4xl md:text-5xl mb-16 text-center`}>
      <span className="text-white">BY THE</span> <span className="text-red-600">NUMBERS</span>
    </h2>
  
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 mx-auto max-w-6xl">
      {/* Stats Card 1 */}
      <div className="relative group">
        <div className="stats-card bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 text-center transition-all duration-500
                      hover:border-red-600/70 hover:shadow-xl hover:shadow-red-600/10 rounded-sm">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping-slow opacity-70"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          
          <div className={`${anton.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-red-600 counter-value`} 
               data-target="125000">100K+</div>
          <p className="font-mono text-sm mt-2 text-gray-400 uppercase tracking-wider">ACTIVE PLAYERS</p>
          
          {/* Decorative corner accents */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
      
      {/* Stats Card 2 */}
      <div className="relative group">
        <div className="stats-card bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 text-center transition-all duration-500
                      hover:border-red-600/70 hover:shadow-xl hover:shadow-red-600/10 rounded-sm">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping-slow opacity-70 animation-delay-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <div className={`${anton.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-red-600 counter-value`} 
               data-target="7500">7.5K+</div>
          <p className="font-mono text-sm mt-2 text-gray-400 uppercase tracking-wider">TOURNAMENTS COMPLETED</p>
          
          {/* Decorative corner accents */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
      
      {/* Stats Card 3 */}
      <div className="relative group">
        <div className="stats-card bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 text-center transition-all duration-500
                      hover:border-red-600/70 hover:shadow-xl hover:shadow-red-600/10 rounded-sm">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping-slow opacity-70 animation-delay-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className={`${anton.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-red-600 counter-value`}
               data-target="3200000">$3.2M+</div>
          <p className="font-mono text-sm mt-2 text-gray-400 uppercase tracking-wider">PRIZES AWARDED</p>
          
          {/* Decorative corner accents */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
      
      {/* Stats Card 4 */}
      <div className="relative group">
        <div className="stats-card bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 text-center transition-all duration-500
                      hover:border-red-600/70 hover:shadow-xl hover:shadow-red-600/10 rounded-sm">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping-slow opacity-70 animation-delay-900"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          
          <div className={`${anton.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-red-600 counter-value`}
               data-target="1500000">1.5M+</div>
          <p className="font-mono text-sm mt-2 text-gray-400 uppercase tracking-wider">MATCHES PLAYED</p>
          
          {/* Decorative corner accents */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
    </div>
  </div>
</section>
   
 

{/* How It Works Section */}
<section className="py-24 bg-black relative overflow-hidden">
  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
  
  <div className="container mx-auto px-4 z-10 relative">
    <h2 className={`${anton.className} text-3xl sm:text-4xl md:text-5xl mb-16 text-center`}>
      HOW <span className="text-red-600">CHAIN ARENA</span> WORKS
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mx-auto max-w-6xl">
      {/* Step 1: Connect Wallet */}
      <div className="relative group">
        <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 h-full flex flex-col items-center text-center transition-all duration-300 hover:border-red-600/50 hover:shadow-lg hover:shadow-red-600/20">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-mono text-xl mb-3 text-red-500">CONNECT WALLET</h3>
          {/* --- Updated Description --- */}
          <p className="text-gray-400">
            Connect your Solana wallet – your secure gateway to enter tournaments, receive instant crypto payouts, and claim NFT achievements.
          </p>
          {/* --- End Updated Description --- */}
          <div className="absolute -top-1 -left-1 w-8 h-8 bg-red-600/80 flex items-center justify-center font-mono font-bold">
            01
          </div>
        </div>
        <div className="hidden md:block absolute top-1/2 right-0 w-[50px] h-[2px] bg-gradient-to-r from-red-600 to-transparent translate-x-[25px] group-hover:scale-x-110 transition-transform duration-300 origin-left"></div>
      </div>

      {/* Step 2: Join Tournaments */}
      <div className="relative group">
        <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 h-full flex flex-col items-center text-center transition-all duration-300 hover:border-red-600/50 hover:shadow-lg hover:shadow-red-600/20">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-mono text-xl mb-3 text-red-500">JOIN TOURNAMENTS</h3>
          {/* --- Updated Description --- */}
          <p className="text-gray-400">
            Find tournaments for your favorite games. Browse ongoing and upcoming events across various titles and register to compete.
          </p>
          {/* --- End Updated Description --- */}
          <div className="absolute -top-1 -left-1 w-8 h-8 bg-red-600/80 flex items-center justify-center font-mono font-bold">
            02
          </div>
        </div>
        <div className="hidden md:block absolute top-1/2 right-0 w-[50px] h-[2px] bg-gradient-to-r from-red-600 to-transparent translate-x-[25px] group-hover:scale-x-110 transition-transform duration-300 origin-left"></div>
      </div>

      {/* Step 3: Form Teams */}
      <div className="relative group">
        <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 h-full flex flex-col items-center text-center transition-all duration-300 hover:border-red-600/50 hover:shadow-lg hover:shadow-red-600/20">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="font-mono text-xl mb-3 text-red-500">FORM TEAMS</h3>
          {/* --- Updated Description --- */}
          <p className="text-gray-400">
            Team up for victory. Create your own squad or join an existing team to strategize and conquer team-based tournaments together.
          </p>
          {/* --- End Updated Description --- */}
          <div className="absolute -top-1 -left-1 w-8 h-8 bg-red-600/80 flex items-center justify-center font-mono font-bold">
            03
          </div>
        </div>
        <div className="hidden md:block absolute top-1/2 right-0 w-[50px] h-[2px] bg-gradient-to-r from-red-600 to-transparent translate-x-[25px] group-hover:scale-x-110 transition-transform duration-300 origin-left"></div>
      </div>

      {/* Step 4: Win Rewards */}
      <div className="relative group">
        <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 h-full flex flex-col items-center text-center transition-all duration-300 hover:border-red-600/50 hover:shadow-lg hover:shadow-red-600/20">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-mono text-xl mb-3 text-red-500">WIN REWARDS</h3>
          {/* --- Updated Description --- */}
          <p className="text-gray-400">
            Claim your spoils. Win crypto instantly sent to your wallet and unlock exclusive NFT trophies to showcase your victories on the blockchain.
          </p>
          {/* --- End Updated Description --- */}
          <div className="absolute -top-1 -left-1 w-8 h-8 bg-red-600/80 flex items-center justify-center font-mono font-bold">
            04
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

 
 

{/* Upcoming Tournaments Preview Section */}
<section className="py-24 bg-gradient-to-b from-black to-gray-900 relative">
  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent opacity-40"></div>
  
  <div className="container mx-auto px-4 z-10 relative">
    <h2 className={`${anton.className} text-3xl sm:text-4xl md:text-5xl mb-4 text-center`}>
      UPCOMING <span className="text-red-600">TOURNAMENTS</span>
    </h2>
    
    <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
      Join these upcoming competitive events and prove your skills against the best players.
      Register now to secure your spot.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto max-w-6xl">
      {/* Tournament 1 */}
      <div className="tournament-card relative group">
        <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-mono px-3 py-1 z-20">
          FEATURED
        </div>
        <div className="bg-black/60 backdrop-blur-sm border border-red-900/50 overflow-hidden relative flex flex-col h-full">
          {/* Game Image */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
            <Image 
              src="/images/games/cyberpunk-shooter.jpg" 
              alt="Cyberpunk Shooter Tournament" 
              width={400} 
              height={200} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute bottom-4 left-4 z-20">
              <h3 className={`${anton.className} text-xl sm:text-2xl text-white`}>NEON ASSAULT</h3>
              <p className="text-red-500 text-sm font-mono">5v5 Team Deathmatch</p>
            </div>
          </div>
          
          {/* Tournament Details */}
          <div className="p-4 flex-grow">
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Prize Pool</p>
                <p className="text-xl text-red-500 font-mono">₳ 5,000</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Entries</p>
                <p className="text-xl text-white font-mono">16 / 32</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Registration Deadline</p>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-white font-mono">24:13:45:12</p>
              </div>
            </div>
            
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-mono uppercase py-3 px-6 transition-all duration-300 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Join Tournament
            </button>
          </div>
          
          {/* Decorative corner */}
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l border-b border-red-600"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-r border-t border-red-600"></div>
        </div>
      </div>
      
      {/* Tournament 2 */}
      <div className="tournament-card relative group">
        <div className="bg-black/60 backdrop-blur-sm border border-red-900/30 overflow-hidden relative flex flex-col h-full">
          {/* Game Image */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
            <Image 
              src="/images/games/racing-game.jpg" 
              alt="Neo Racing Tournament" 
              width={400} 
              height={200} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute bottom-4 left-4 z-20">
              <h3 className={`${anton.className} text-xl sm:text-2xl text-white`}>NEO DRIFT</h3>
              <p className="text-red-500 text-sm font-mono">Racing Circuit</p>
            </div>
          </div>
          
          {/* Tournament Details */}
          <div className="p-4 flex-grow">
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Prize Pool</p>
                <p className="text-xl text-red-500 font-mono">₳ 2,500</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Entries</p>
                <p className="text-xl text-white font-mono">24 / 64</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Registration Deadline</p>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-white font-mono">12:07:33:52</p>
              </div>
            </div>
            
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-mono uppercase py-3 px-6 transition-all duration-300 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Join Tournament
            </button>
          </div>
          
          {/* Decorative corner */}
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l border-b border-red-600/50"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-r border-t border-red-600/50"></div>
        </div>
      </div>
      
      {/* Tournament 3 */}
      <div className="tournament-card relative group">
        <div className="bg-black/60 backdrop-blur-sm border border-red-900/30 overflow-hidden relative flex flex-col h-full">
          {/* Game Image */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
            <Image 
              src="/images/games/strategy-game.jpg" 
              alt="Strategy Tournament" 
              width={400} 
              height={200} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute bottom-4 left-4 z-20">
              <h3 className={`${anton.className} text-xl sm:text-2xl text-white`}>CYBER COMMAND</h3>
              <p className="text-red-500 text-sm font-mono">Strategy Battle</p>
            </div>
          </div>
          
          {/* Tournament Details */}
          <div className="p-4 flex-grow">
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Prize Pool</p>
                <p className="text-xl text-red-500 font-mono">₳ 3,800</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Entries</p>
                <p className="text-xl text-white font-mono">8 / 16</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Registration Deadline</p>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-white font-mono">08:22:19:05</p>
              </div>
            </div>
            
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-mono uppercase py-3 px-6 transition-all duration-300 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Join Tournament
            </button>
          </div>
          
          {/* Decorative corner */}
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l border-b border-red-600/50"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-r border-t border-red-600/50"></div>
        </div>
      </div>
    </div>
    
    {/* View All Button */}
    <div className="mt-12 text-center">
      <Link 
        href="/tournaments"
        className="inline-block border border-red-600 text-red-500 hover:text-white hover:bg-red-600/30 font-mono uppercase py-3 px-8 transition-colors duration-300"
      >
        View All Tournaments
      </Link>
    </div>
  </div>
</section>
{/* Leaderboard Preview Section */}
<section className="py-24 bg-black relative overflow-hidden">
  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
  <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(220,38,38,0.1),transparent)]"></div>
  
  <div className="container mx-auto px-4 z-10 relative">
    <h2 className={`${anton.className} text-3xl sm:text-4xl md:text-5xl mb-4 text-center`}>
      TOP <span className="text-red-600">PERFORMERS</span>
    </h2>
    
    <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
      The best players and teams from our recent tournaments.
      Will you make it to the leaderboard?
    </p>
    
    {/* Tabs */}
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex border-b border-red-900/30">
        <button className="font-mono text-sm uppercase tracking-wider py-3 px-6 focus:outline-none text-white border-b-2 border-red-600">
          Players
        </button>
        <button className="font-mono text-sm uppercase tracking-wider py-3 px-6 focus:outline-none text-gray-400 hover:text-white">
          Teams
        </button>
        <button className="font-mono text-sm uppercase tracking-wider py-3 px-6 focus:outline-none text-gray-400 hover:text-white">
          Weekly
        </button>
      </div>
    </div>
    
    {/* Leaderboard Table */}
    <div className="max-w-4xl mx-auto border border-red-900/30 bg-black/40 backdrop-blur-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-red-900/20">
            <th className="font-mono text-xs text-left py-3 px-4">#</th>
            <th className="font-mono text-xs text-left py-3 px-4">Player</th>
            <th className="font-mono text-xs text-left py-3 px-4 hidden sm:table-cell">Game</th>
            <th className="font-mono text-xs text-center py-3 px-4">Wins</th>
            <th className="font-mono text-xs text-right py-3 px-4">Earnings</th>
          </tr>
        </thead>
        <tbody>
          {/* Top player with highlight */}
          <tr className="border-t border-red-900/20 bg-red-900/10">
            <td className="py-4 px-4 font-mono text-sm text-red-500">1</td>
            <td className="py-4 px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-purple-600 mr-3 flex items-center justify-center">
                  <span className="font-bold text-white text-xs">KS</span>
                </div>
                <div>
                  <p className="font-mono text-sm text-white">KillerShade</p>
                  <p className="text-xs text-red-500">Elite</p>
                </div>
              </div>
            </td>
            <td className="py-4 px-4 font-mono text-xs text-gray-400 hidden sm:table-cell">Neon Assault</td>
            <td className="py-4 px-4 font-mono text-sm text-center text-white">32</td>
            <td className="py-4 px-4 font-mono text-sm text-right text-red-500">₳ 12,450</td>
          </tr>
          
          {/* Other players */}
          <tr className="border-t border-red-900/20 hover:bg-red-900/5">
            <td className="py-4 px-4 font-mono text-sm text-gray-500">2</td>
            <td className="py-4 px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 mr-3 flex items-center justify-center">
                  <span className="font-bold text-white text-xs">VX</span>
                </div>
                <div>
                  <p className="font-mono text-sm text-white">Vortex</p>
                  <p className="text-xs text-red-500">Pro</p>
                </div>
              </div>
            </td>
            <td className="py-4 px-4 font-mono text-xs text-gray-400 hidden sm:table-cell">Cyber Command</td>
            <td className="py-4 px-4 font-mono text-sm text-center text-white">28</td>
            <td className="py-4 px-4 font-mono text-sm text-right text-red-500">₳ 8,720</td>
          </tr>
          
          <tr className="border-t border-red-900/20 hover:bg-red-900/5">
            <td className="py-4 px-4 font-mono text-sm text-gray-500">3</td>
            <td className="py-4 px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mr-3 flex items-center justify-center">
                  <span className="font-bold text-white text-xs">NX</span>
                </div>
                <div>
                  <p className="font-mono text-sm text-white">NeoMatrix</p>
                  <p className="text-xs text-red-500">Elite</p>
                </div>
              </div>
            </td>
            <td className="py-4 px-4 font-mono text-xs text-gray-400 hidden sm:table-cell">Neo Drift</td>
            <td className="py-4 px-4 font-mono text-sm text-center text-white">24</td>
            <td className="py-4 px-4 font-mono text-sm text-right text-red-500">₳ 7,350</td>
          </tr>
          
          <tr className="border-t border-red-900/20 hover:bg-red-900/5">
            <td className="py-4 px-4 font-mono text-sm text-gray-500">4</td>
            <td className="py-4 px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mr-3 flex items-center justify-center">
                  <span className="font-bold text-white text-xs">PX</span>
                </div>
                <div>
                  <p className="font-mono text-sm text-white">Proxy</p>
                  <p className="text-xs text-red-500">Advanced</p>
                </div>
              </div>
            </td>
            <td className="py-4 px-4 font-mono text-xs text-gray-400 hidden sm:table-cell">Neon Assault</td>
            <td className="py-4 px-4 font-mono text-sm text-center text-white">22</td>
            <td className="py-4 px-4 font-mono text-sm text-right text-red-500">₳ 6,180</td>
          </tr>
          
          <tr className="border-t border-red-900/20 hover:bg-red-900/5">
            <td className="py-4 px-4 font-mono text-sm text-gray-500">5</td>
            <td className="py-4 px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 mr-3 flex items-center justify-center">
                  <span className="font-bold text-white text-xs">DE</span>
                </div>
                <div>
                  <p className="font-mono text-sm text-white">DarkEdge</p>
                  <p className="text-xs text-red-500">Pro</p>
                </div>
              </div>
            </td>
            <td className="py-4 px-4 font-mono text-xs text-gray-400 hidden sm:table-cell">Cyber Command</td>
            <td className="py-4 px-4 font-mono text-sm text-center text-white">19</td>
            <td className="py-4 px-4 font-mono text-sm text-right text-red-500">₳ 5,230</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    {/* View Full Leaderboard Link */}
    {/* <div className="mt-8 text-center">
      <Link 
        href="/leaderboards"
        className="inline-block border border-red-600 text-red-500 hover:text-white hover:bg-red-600/30 font-mono uppercase py-2 px-6 text-sm transition-colors duration-300"
      >
        View Full Leaderboard
      </Link>
    </div> */}
  </div>
</section>
      
      {/* Trust & Tech Section */}
<section className="py-24 bg-black relative overflow-hidden">
  <div className="absolute inset-0 bg-[url('/images/circuit-pattern.svg')] opacity-5"></div>
  <div className="container mx-auto px-4 z-10 relative">
    <h2 className={`${anton.className} text-3xl sm:text-4xl md:text-5xl mb-4 text-center`}>
      POWERED BY <span className="text-red-600">TECHNOLOGY</span>
    </h2>
    
    <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
      ChainArena leverages cutting-edge blockchain technology to deliver
      a secure, transparent, and rewarding gaming experience.
    </p>
    
 {/* Solana Badge with parallax effect */}
<div className="flex flex-col sm:flex-row justify-center items-center mb-16">
  <div className="parallax-slow bg-black/40 backdrop-blur-sm border border-purple-900/30 p-6 rounded-lg 
                 flex items-center transform transition-transform hover:scale-105 duration-300">
    <div className="parallax-item">
    <div className="mr-3">
  <img
    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDM5Ny43IDMxMS43Ij48bGluZWFyR3JhZGllbnQgaWQ9ImEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMzYwLjg3OSIgeTE9IjM1MS40NTUiIHgyPSIxNDEuMjEzIiB5Mj0iLTY5LjI5NCIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDMxNCkiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzAwRkZBMyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0RDMUZGRiIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdGggZmlsbD0idXJsKCNhKSIgZD0iTTY0LjYgMjM3LjljMi40LTIuNCA1LjctMy44IDkuMi0zLjhoMzE3LjRjNS44IDAgOC43IDcgNC42IDExLjFsLTYyLjcgNjIuN2MtMi40IDIuNC01LjcgMy44LTkuMiAzLjhINi41Yy01LjggMC04LjctNy00LjYtMTEuMWw2Mi43LTYyLjd6TTY0LjYgMy44QzY3LjEgMS40IDcwLjQgMCA3My44IDBoMzE3LjRjNS44IDAgOC43IDcgNC42IDExLjFsLTYyLjcgNjIuN2MtMi40IDIuNC01LjcgMy44LTkuMiAzLjhINi41Yy01LjggMC04LjctNy00LjYtMTEuMUw2NC42IDMuOHpNMzMzLjEgMTIwLjljLTIuNC0yLjQtNS43LTMuOC05LjItMy44SDYuNWMtNS44IDAtOC43IDctNC42IDExLjFsNjIuNyA2Mi43YzIuNCAyLjQgNS43IDMuOCA5LjIgMy44aDMxNy40YzUuOCAwIDguNy03IDQuNi0xMS4xbC02Mi43LTYyLjd6Ii8+PC9zdmc+"
    alt="Powered by Solana"
    width={40} 
    height={40}
  />
</div>
    </div>
    <div>
      <p className="text-white font-mono text-sm">POWERED BY</p>
      <p className="text-purple-500 font-bold text-2xl tracking-wider">SOLANA</p>
      <div className="mt-2 h-px w-full bg-gradient-to-r from-purple-900/20 via-purple-500/40 to-purple-900/20"></div>
    </div>
  </div>
</div>
    {/* Tech Benefits */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Fast */}
      <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 text-center hover:border-red-600/50 transition-all duration-300">
        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="font-mono text-xl mb-2 text-red-500">LIGHTNING FAST</h3>
        <p className="text-gray-400">Transactions processed in seconds with Solana's high-speed blockchain.</p>
      </div>
      
      {/* Low Fees */}
      <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 text-center hover:border-red-600/50 transition-all duration-300">
        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-mono text-xl mb-2 text-red-500">MINIMAL FEES</h3>
        <p className="text-gray-400">Ultra-low transaction costs mean more prize money goes directly to winners.</p>
      </div>
      
      {/* Secure */}
      <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 text-center hover:border-red-600/50 transition-all duration-300">
        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="font-mono text-xl mb-2 text-red-500">BULLETPROOF SECURITY</h3>
        <p className="text-gray-400">Advanced cryptography ensures your assets and winnings are always protected.</p>
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
              onClick={handleSignUp}
            >
              <span className="cyber-glitch-btn-text flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                 SIGN UP NOW
              </span>
              <span className="cyber-glitch-btn-glitch"></span>
            </button>
          </div>
        </div>
      </section>
{/* Community & Team Section */}
<section className="py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
  
  <div className="container mx-auto px-4 z-10 relative">
    <h2 className={`${anton.className} text-3xl sm:text-4xl md:text-5xl mb-4 text-center`}>
      OUR <span className="text-red-600">COMMUNITY</span>
    </h2>
    
    <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
      Join the growing ChainArena community of players, developers, and esports enthusiasts 
      building the future of blockchain gaming together.
    </p>
    
     
    
    {/* Social Media Links */}
    <div className="text-center mb-20">
 
      <div className="flex justify-center space-x-6">
        <a href="#" className="bg-black/40 backdrop-blur-sm border border-red-900/30 p-4 hover:border-red-600 transition-colors duration-300">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
          </svg>
        </a>
        <a href="#" className="bg-black/40 backdrop-blur-sm border border-red-900/30 p-4 hover:border-red-600 transition-colors duration-300">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
          </svg>
        </a>
        <a href="#" className="bg-black/40 backdrop-blur-sm border border-red-900/30 p-4 hover:border-red-600 transition-colors duration-300">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
        </a>
        <a href="#" className="bg-black/40 backdrop-blur-sm border border-red-900/30 p-4 hover:border-red-600 transition-colors duration-300">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        </a>
      </div>
    </div>
    
    {/* Discord Embed Preview */}
    <div className="max-w-2xl mx-auto overflow-hidden">
      <div className="bg-black/40 backdrop-blur-sm border border-red-900/30 p-2 text-center mb-4 flex items-center justify-center">
        <svg className="w-6 h-6 text-[#5865F2] mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
        </svg>
        <span className="text-white font-mono">Join our Discord - 3,500+ members</span>
      </div>
      <div className="bg-[#36393F] border border-[#202225] rounded-md overflow-hidden">
        <div className="bg-[#202225] p-3 flex items-center">
          <svg className="w-6 h-6 text-white mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
          </svg>
          <span className="text-white font-medium">ChainArena Community</span>
        </div>
        <div className="p-4 max-h-32 overflow-hidden">
          <div className="flex mb-3">
            <div className="w-8 h-8 rounded-full bg-red-600 mr-2 flex-shrink-0"></div>
            <div>
              <div className="flex items-center">
                <span className="text-red-400 font-medium text-sm">ADMIN_BOT</span>
                <span className="text-gray-500 text-xs ml-2">Today at 12:34</span>
              </div>
              <p className="text-gray-300 text-sm">Welcome to the ChainArena community! New tournament registrations are now open for Cyber Assault II!</p>
            </div>
          </div>
          <div className="flex mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-700 mr-2 flex-shrink-0"></div>
            <div>
              <div className="flex items-center">
                <span className="text-blue-400 font-medium text-sm">CryptoGamer</span>
                <span className="text-gray-500 text-xs ml-2">Today at 12:36</span>
              </div>
              <p className="text-gray-300 text-sm">Just finished the last tournament - 2nd place! Looking forward to the next one!</p>
            </div>
          </div>
        </div>
        <div className="bg-[#40444B] p-3 flex items-center">
          <input 
            type="text" 
            placeholder="You must join Discord to chat" 
            className="bg-transparent w-full text-gray-400 text-sm focus:outline-none cursor-not-allowed" 
            disabled 
          />
        </div>
      </div>
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