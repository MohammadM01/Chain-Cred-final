import React from 'react';
import Slider from 'react-slick';

const features = [
  {
    icon: "🛡️",
    title: "Tamper-Proof Credentials",
    description: "Verified via opBNB blockchain for authenticity.",
  },
  {
    icon: "🗄️",
    title: "Decentralized Storage",
    description: "Secure and scalable with distributed storage.",
  },
  {
    icon: "⏱️",
    title: "Instant Verification",
    description: "Verify any credential in seconds, no intermediaries.",
  },
  {
    icon: "🔒",
    title: "Fraud Prevention",
    description: "Prevent fake resumes and forged certificates with soulbound NFTs.",
  },
];

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 bg-gray-800 rounded-md shadow-md hover:shadow-yellow-400 transition-shadow h-[300px] w-[280px] flex flex-col justify-between mx-auto">
      <div className="text-5xl mb-4">{icon}</div>
      <div>
        <h3 className="text-xl font-semibold text-yellow-400 mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
}

export default function FeatureCarousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '0px',
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerPadding: '0px',
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: '80px',
        },
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-yellow-400 mb-8 text-center">Why ChainCred?</h2>
      <Slider {...settings}>
        {features.map((feature, index) => (
          <div key={index} className="px-2">
            <FeatureCard {...feature} />
          </div>
        ))}
      </Slider>
    </div>
  );
}
