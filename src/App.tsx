/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Mail, Instagram, Play, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { get, set } from 'idb-keyval';
import { VideoPlayer } from './components/VideoPlayer';

const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string, key?: React.Key }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroImage, setHeroImage] = useState(import.meta.env.BASE_URL + '8.jpg');
  
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadHighResImage = async () => {
      try {
        const cached = await get('highres_hero');
        if (cached) {
          setHeroImage(cached);
          return;
        }

        const response = await fetch(import.meta.env.BASE_URL + '8.jpg');
        const blob = await response.blob();
        const reader = new FileReader();
        
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64data = reader.result as string;
            const base64 = base64data.split(',')[1];
            resolve(base64);
          };
        });
        reader.readAsDataURL(blob);
        const base64Data = await base64Promise;

        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: blob.type || 'image/jpeg',
                },
              },
              {
                text: 'Upscale and enhance this image. Make it high resolution, sharp, highly detailed, cinematic, photorealistic. Keep the exact same subject and composition.',
              },
            ],
          },
        });

        for (const part of result.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const newImageUrl = `data:image/jpeg;base64,${part.inlineData.data}`;
            setHeroImage(newImageUrl);
            await set('highres_hero', newImageUrl);
            break;
          }
        }
      } catch (error) {
        console.error('Error enhancing image automatically:', error);
      }
    };

    loadHighResImage();
  }, []);

  return (
    <div className="bg-white text-neutral-900 min-h-screen selection:bg-neutral-200 selection:text-neutral-900">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-neutral-100 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <a href="#" className="text-lg font-semibold tracking-tight text-neutral-800">STUDIO.</a>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-neutral-600">
            <a href="#featured" className="hover:text-neutral-900 transition-colors">Featured</a>
            <a href="#portfolio" className="hover:text-neutral-900 transition-colors">Portfolio</a>
            <a href="#about" className="hover:text-neutral-900 transition-colors">About</a>
            <a href="#contact" className="hover:text-neutral-900 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-neutral-50">
        <motion.div 
          style={{ opacity: heroOpacity, y: heroY }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={heroImage} 
            alt="Hero background" 
            className="w-full h-full object-cover transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white"></div>
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="font-bold tracking-tighter leading-[1.1]"
          >
            <span className="text-7xl md:text-8xl lg:text-9xl block mb-2">Portfolio</span>
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-white/70 blur-lg rounded-2xl scale-105"></span>
              <span className="relative text-5xl md:text-7xl lg:text-8xl text-neutral-600 px-2">Yuun Kwon.</span>
            </span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-8 flex justify-center"
          >
            <p className="relative inline-block text-lg md:text-xl text-neutral-600 font-medium text-center">
              <span className="absolute inset-0 bg-white/70 blur-lg rounded-2xl scale-105"></span>
              <span className="relative px-6 py-2 block">
                Translating ideas into cinematic experiences. <br />
                A curated collection of moments, motion, and light.
              </span>
            </p>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
        >
          <span className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-neutral-300 overflow-hidden">
            <motion.div 
              animate={{ y: [0, 48] }} 
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-full h-1/2 bg-neutral-900" 
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Works */}
      <section id="featured" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-16">Featured Works</h2>
        </FadeIn>

        <div className="space-y-32">
          {/* Featured Item 1 */}
          <div className="group cursor-pointer">
            <FadeIn>
              <VideoPlayer src={import.meta.env.BASE_URL + '6.mp4'} poster={import.meta.env.BASE_URL + '쯧.jpg'} />
            </FadeIn>
            <FadeIn delay={0.2} className="mt-8 flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-medium tracking-tight">포항제철중에서</h3>
                <p className="text-neutral-500 mt-2">Pohang Jecheol Middle School / 2025</p>
              </div>
              <ArrowRight className="w-6 h-6 text-neutral-300 group-hover:text-neutral-900 transition-colors duration-300 -rotate-45 group-hover:rotate-0" />
            </FadeIn>
          </div>

          {/* Featured Item 2 */}
          <div className="group cursor-pointer">
            <FadeIn>
              <VideoPlayer 
                src={import.meta.env.BASE_URL + 'KakaoTalk_20260302_015844975.mp4'}
                thumbnailTime={16}
              />
            </FadeIn>
            <FadeIn delay={0.2} className="mt-8 flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-medium tracking-tight">Urban Rhythm</h3>
                <p className="text-neutral-500 mt-2">Music Video / 2024</p>
              </div>
              <ArrowRight className="w-6 h-6 text-neutral-300 group-hover:text-neutral-900 transition-colors duration-300 -rotate-45 group-hover:rotate-0" />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Portfolio Gallery */}
      <section id="portfolio" className="py-32 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex justify-between items-end mb-16">
              <h2 className="text-4xl font-medium tracking-tight">Selected Works</h2>
              <button className="text-sm font-medium border-b border-neutral-900 pb-1 hover:text-neutral-500 hover:border-neutral-500 transition-colors">
                View All
              </button>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
            {[
              { title: "Minimalist Living", category: "Commercial", img: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=1000&auto=format&fit=crop" },
              { title: "Echoes", category: "Short Film", img: "https://images.unsplash.com/photo-1518131672697-613becd4fab5?q=80&w=1000&auto=format&fit=crop" },
              { title: "Motion & Space", category: "Art Direction", img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop" },
              { title: "Night Drive", category: "Music Video", img: "https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=1000&auto=format&fit=crop" }
            ].map((item, index) => (
              <FadeIn key={index} delay={index % 2 === 0 ? 0 : 0.2}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200 rounded-lg mb-6">
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-xl font-medium">{item.title}</h3>
                  <p className="text-neutral-500 mt-1 text-sm">{item.category}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100">
              <img 
                src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1000&auto=format&fit=crop" 
                alt="Portrait" 
                className="w-full h-full object-cover grayscale"
                referrerPolicy="no-referrer"
              />
            </div>
          </FadeIn>
          <div className="space-y-8">
            <FadeIn delay={0.2}>
              <h2 className="text-xs uppercase tracking-widest text-neutral-400">About</h2>
            </FadeIn>
            <FadeIn delay={0.3}>
              <h3 className="text-3xl md:text-4xl font-medium leading-snug tracking-tight">
                I believe in the power of visual storytelling to evoke emotion and inspire action.
              </h3>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="text-neutral-500 leading-relaxed">
                With over a decade of experience in cinematography and direction, I focus on creating clean, impactful, and cinematic visuals. My approach is rooted in minimalism—stripping away the unnecessary to reveal the core message of every project.
              </p>
            </FadeIn>
            <FadeIn delay={0.5}>
              <p className="text-neutral-500 leading-relaxed">
                Whether it's a high-end commercial or an intimate documentary, I strive to bring a unique perspective and meticulous attention to detail to every frame.
              </p>
            </FadeIn>
            <FadeIn delay={0.6}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/512px-Apple_logo_black.svg.png" alt="Signature" className="h-8 opacity-20 mt-8" referrerPolicy="no-referrer" />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">Discover my <br/> story.</h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-neutral-400 mb-12 max-w-xl mx-auto leading-relaxed">
              Crafting cinematic narratives through light and motion, I am currently open to creative collaborations and freelance projects worldwide.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <a 
              href="mailto:gwonyuun@gmail.com" 
              className="inline-flex items-center space-x-2 bg-white text-neutral-900 px-8 py-4 rounded-full font-medium hover:bg-neutral-200 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>gwonyuun@gmail.com</span>
            </a>
          </FadeIn>
          
          <FadeIn delay={0.4} className="mt-32 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
            <p>© 2026 STUDIO. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="https://instagram.com/ux_.one94" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center space-x-2">
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
