// {/* <section className="py-20 bg-black relative overflow-hidden">
// <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

// {/* Animated background elements */}
// <div className="absolute inset-0 overflow-hidden">
//   <div className="absolute h-px w-32 bg-red-600/50 animate-float-slow top-1/4 left-1/4"></div>
//   <div className="absolute h-px w-48 bg-red-600/30 animate-float-medium top-2/3 right-1/5"></div>
//   <div className="absolute h-32 w-px bg-red-600/40 animate-float-fast bottom-1/4 right-1/3"></div>
//   <div className="absolute h-16 w-px bg-red-600/20 animate-float-reverse bottom-1/2 left-1/3"></div>
// </div>

// <div className="container mx-auto px-4 z-10 relative">
//   <h2 className={`${anton.className} text-3xl sm:text-4xl md:text-5xl mb-16 text-center`}>
//     <span className="text-white">BY THE</span> <span className="text-red-600">NUMBERS</span>
//   </h2>

//   <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 mx-auto max-w-6xl">
//     {/* Stats Card 1 */}
//     <div className="relative group">
//       <div className="stats-card bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 text-center transition-all duration-500
//                     hover:border-red-600/70 hover:shadow-xl hover:shadow-red-600/10 rounded-sm">
//         <div className="w-16 h-16 mx-auto mb-4 relative">
//           <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping-slow opacity-70"></div>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
//             </svg>
//           </div>
//         </div>
        
//         <div className={`${anton.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-red-600 counter-value`} 
//              data-target="125000">100K+</div>
//         <p className="font-mono text-sm mt-2 text-gray-400 uppercase tracking-wider">ACTIVE PLAYERS</p>
        
//         {/* Decorative corner accents */}
//         <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//         <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//       </div>
//     </div>
    
//     {/* Stats Card 2 */}
//     <div className="relative group">
//       <div className="stats-card bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 text-center transition-all duration-500
//                     hover:border-red-600/70 hover:shadow-xl hover:shadow-red-600/10 rounded-sm">
//         <div className="w-16 h-16 mx-auto mb-4 relative">
//           <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping-slow opacity-70 animation-delay-300"></div>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//           </div>
//         </div>
        
//         <div className={`${anton.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-red-600 counter-value`} 
//              data-target="7500">7.5K+</div>
//         <p className="font-mono text-sm mt-2 text-gray-400 uppercase tracking-wider">TOURNAMENTS COMPLETED</p>
        
//         {/* Decorative corner accents */}
//         <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//         <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//       </div>
//     </div>
    
//     {/* Stats Card 3 */}
//     <div className="relative group">
//       <div className="stats-card bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 text-center transition-all duration-500
//                     hover:border-red-600/70 hover:shadow-xl hover:shadow-red-600/10 rounded-sm">
//         <div className="w-16 h-16 mx-auto mb-4 relative">
//           <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping-slow opacity-70 animation-delay-600"></div>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//         </div>
        
//         <div className={`${anton.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-red-600 counter-value`}
//              data-target="3200000">$3.2M+</div>
//         <p className="font-mono text-sm mt-2 text-gray-400 uppercase tracking-wider">PRIZES AWARDED</p>
        
//         {/* Decorative corner accents */}
//         <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//         <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//       </div>
//     </div>
    
//     {/* Stats Card 4 */}
//     <div className="relative group">
//       <div className="stats-card bg-black/40 backdrop-blur-sm border border-red-900/30 p-6 text-center transition-all duration-500
//                     hover:border-red-600/70 hover:shadow-xl hover:shadow-red-600/10 rounded-sm">
//         <div className="w-16 h-16 mx-auto mb-4 relative">
//           <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping-slow opacity-70 animation-delay-900"></div>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
//             </svg>
//           </div>
//         </div>
        
//         <div className={`${anton.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-red-600 counter-value`}
//              data-target="1500000">1.5M+</div>
//         <p className="font-mono text-sm mt-2 text-gray-400 uppercase tracking-wider">MATCHES PLAYED</p>
        
//         {/* Decorative corner accents */}
//         <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//         <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//       </div>
//     </div>
//   </div>
// </div>
// </section> */}