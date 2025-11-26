import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../User-Css/Home-css/Home.css'; 
import QuoteSection from '../Home-page/QuoteSection';
import AboutSection from '../Home-page/About';
import BlogCardsSection from '../Home-page/BlogCardsSection';

const Home = () => {
  const slides = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/2730217/pexels-photo-2730217.jpeg',
      title: 'உள்ளே அமைதியைக் கண்டறியவும்',
      subtitle: 'நினைவாற்றல் மற்றும் ஆன்மீக வளர்ச்சிக்கான பயணம்',
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/819733/pexels-photo-819733.jpeg',

      title: 'பூமியைத் தழுவுங்கள்',
      subtitle: 'இயற்கையுடன் இணைந்திருங்கள், உங்கள் ஆன்மாவை குணப்படுத்துங்கள்.',
    },
    {
      image: 'https://images.pexels.com/photos/2730212/pexels-photo-2730212.jpeg',
      id: 3,
      title: 'உங்கள் ஆன்மாவை எழுப்புங்கள்',
      subtitle: 'நனவான வாழ்க்கைக்கான தினசரி ஞானம்',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <>
    <section className="hero-carousel">
      <div className="carousel-slide" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {slides.map((slide) => (
          <div key={slide.id} className="carousel-item">
            <img src={slide.image} alt={slide.title} className="carousel-image" />
            <div className="carousel-overlay">
              <h1 className="carousel-title">{slide.title}</h1>
              <p className="carousel-subtitle">{slide.subtitle}</p>
              <Link to="/blogs" className="carousel-btn">
                {/* Explore Blogs */}
                வலைப்பதிவுகளை ஆராயுங்கள்
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="carousel-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${currentIndex === index ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
      <QuoteSection/>
      <AboutSection/>
      {/* <BlogCardsSection/> */}
    </>

  );
};

export default Home;