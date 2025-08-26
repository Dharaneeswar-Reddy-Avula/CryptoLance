import React from "react";
import HowItWorksSection from "../Components/main/HowItWorks";
import HeroSection from "../Components/main/HeroSection";
import MarketSection from "../Components/main/marketSection/MarketSection";
import Navbar from "../Components/Navbar";
import ActiveFreelancers from "../Components/main/ActiveFreelancers";
import Footer from "../Components/Footer";
import TestimonialsSection from "../Components/main/Testimonals";
import PopularCategories from "../Components/main/PopularCategories";
import Chatbot from "../Components/Chatbot";
import WalletConnect from "../Components/walletConnection/WalletConnect";
const Home = () => {
  return (
    <div className="p-4">
      {" "}
      {/* <Navbar />
      <HeroSection />
      <MarketSection />
      <ActiveFreelancers /> */}
      {/* <PopularCategories /> */}
      {/* <HowItWorksSection /> */}
      {/* <TestimonialsSection /> */}
      {/* <Chatbot />
      <Footer /> */}
      <WalletConnect />
    </div>
  );
};

export default Home;
