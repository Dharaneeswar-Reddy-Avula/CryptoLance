import {
  Briefcase,
  Github,
  Twitter,
  MessageCircle,
  FileText,
  HelpCircle,
  ArrowUpRight,
  Globe,
  Shield,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="relative w-full  py-8 px-4 overflow-hidden z-50">
      {/* Wavy decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/8 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/8 rounded-full blur-2xl"></div>
        <svg
          className="absolute top-0 left-0 w-full h-16 text-gray-800/20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            fill="currentColor"
            opacity=".25"
          ></path>
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 rounded-lg p-1.5 shadow-md">
                  <Briefcase className="w-full h-full text-white" />
                </div>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 rounded-lg blur opacity-30"></div>
              </div>
              <span className="text-lg font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                CryptoLance
              </span>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed text-xs">
              The world's first truly decentralized freelance platform. Connect,
              collaborate, and get paid instantly with cryptocurrency.
            </p>
            <div className="flex space-x-2">
              <SocialIcon
                type="github"
                href="https://github.com/cryptolance"
                icon={<Github className="w-4 h-4" />}
              />
              <SocialIcon
                type="twitter"
                href="https://twitter.com/cryptolance"
                icon={<Twitter className="w-4 h-4" />}
              />
              <SocialIcon
                type="discord"
                href="https://discord.gg/cryptolance"
                icon={<MessageCircle className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Platform Links */}
          <FooterLinks
            title="Platform"
            icon={<Globe className="w-4 h-4" />}
            links={[
              {
                name: "Browse Jobs",
                href: "/browse-jobs",
                description: "Find opportunities",
              },
              {
                name: "Post a Job",
                href: "/post-job",
                description: "Hire talent",
              },
              {
                name: "Find Freelancers",
                href: "/freelancers",
                description: "Discover talent",
              },
              {
                name: "How It Works",
                href: "#how-it-works",
                description: "Learn process",
              },
            ]}
          />

          {/* Categories Links */}
          <FooterLinks
            title="Categories"
            icon={<Briefcase className="w-4 h-4" />}
            links={[
              {
                name: "Web Development",
                href: "/categories/web-dev",
                description: "Full-stack",
              },
              {
                name: "Smart Contracts",
                href: "/categories/smart-contracts",
                description: "Blockchain",
              },
              {
                name: "UI/UX Design",
                href: "/categories/design",
                description: "Creative work",
              },
              {
                name: "Content Writing",
                href: "/categories/writing",
                description: "Quality content",
              },
            ]}
          />

          {/* Support Links */}
          <FooterLinks
            title="Support"
            icon={<HelpCircle className="w-4 h-4" />}
            links={[
              {
                name: "Help Center",
                href: "/help",
                description: "Get help",
                icon: <HelpCircle className="w-3 h-3" />,
              },
              {
                name: "Documentation",
                href: "/docs",
                description: "Guides",
                icon: <FileText className="w-3 h-3" />,
              },
              {
                name: "Community",
                href: "/community",
                description: "Join us",
                icon: <Users className="w-3 h-3" />,
              },
              {
                name: "Contact Us",
                href: "/contact",
                description: "Reach out",
              },
            ]}
          />
        </div>

        {/* Bottom section */}
        <div className="relative pt-8 border-t border-gray-800/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-400 text-xs">
                &copy; {new Date().getFullYear()}{" "}
                <span className="font-bold font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                  CryptoLance
                </span>{" "}
                All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1 flex items-center justify-center sm:justify-start gap-1">
                <Shield className="w-2.5 h-2.5" />
                Built on blockchain technology.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <FooterLink href="/privacy" label="Privacy" />
              <FooterLink href="/terms" label="Terms" />
              <FooterLink href="/security" label="Security" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white rounded-full shadow-lg shadow-purple-500/20 transition-all duration-300 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        } hover:scale-110 hover:shadow-xl`}
        aria-label="Scroll to top"
      >
        <ArrowUpRight className="w-4 h-4 transform rotate-45" />
      </button>
    </footer>
  );
};

export default Footer;

function FooterLinks({ title, icon, links }) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gray-800/40 rounded-md group-hover:bg-purple-500/20 transition-all duration-300">
          <span className="text-purple-400 group-hover:text-purple-300 transition-colors">
            {icon}
          </span>
        </div>
        <h3 className="font-semibold text-sm text-white group-hover:text-purple-100 transition-colors">
          {title}
        </h3>
      </div>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={link.href}
              className="group/link flex items-start gap-2 p-1.5 rounded-md hover:bg-gray-800/20 transition-all duration-300 -ml-1.5"
            >
              {link.icon && (
                <span className="text-gray-500 group-hover/link:text-purple-400 transition-colors mt-0.5 flex-shrink-0">
                  {link.icon}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-gray-300 group-hover/link:text-white transition-colors font-medium block text-xs">
                  {link.name}
                </span>
                {link.description && (
                  <span className="text-gray-500 text-xs block mt-0.5 group-hover/link:text-gray-400 transition-colors">
                    {link.description}
                  </span>
                )}
              </div>
              <ArrowUpRight className="w-2.5 h-2.5 text-gray-600 group-hover/link:text-purple-400 transition-all duration-300 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterLink({ href, label }) {
  return (
    <a
      href={href}
      className="text-gray-400 hover:text-purple-300 transition-colors duration-300 relative group"
    >
      {label}
      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
    </a>
  );
}

function SocialIcon({ type, href, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative p-2 bg-gray-800/40 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-purple-500/20"
    >
      <span className="text-gray-400 group-hover:text-white transition-colors duration-300 relative z-10">
        {icon}
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 rounded-lg transition-all duration-300"></div>
    </a>
  );
}
