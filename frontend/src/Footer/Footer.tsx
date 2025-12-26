import { Link } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  ArrowRight,
  Globe
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] border-t border-slate-800 text-slate-400 font-sans pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP SECTION: Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-10">

          {/* 1. LEFT: Brand & Contact (Compact) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-white text-lg font-bold tracking-wide uppercase">Manjitha Guest</h3>
              <p className="text-xs text-blue-500 font-medium tracking-widest">LUXURY & COMFORT</p>
            </div>

            <div className="space-y-3 mt-4">
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-500 mt-1 shrink-0" />
                <p className="text-sm leading-relaxed">
                  No 02, Hansa Mawatha, <br />
                  Sella Road, Kataragama.
                </p>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-blue-500 mt-1 shrink-0" />
                <div className="flex flex-col text-sm">
                  <a href="tel:+94764687979" className="hover:text-white transition-colors duration-200">+94 76 468 79 79</a>
                  <a href="tel:+94772334039" className="hover:text-white transition-colors duration-200">+94 77 233 40 39</a>
                </div>
              </div>
            </div>
          </div>

          {/* 2. MIDDLE: Navigation (Clean List) */}
          <div className="flex flex-col items-start md:items-center">
            <div className="space-y-3 w-full max-w-[200px]">
              <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-2">Explore</h4>
              
              <Link to="/userpage" className="group flex items-center text-sm hover:text-blue-400 transition-all duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-blue-500 mr-2 transition-colors"></span>
                Home
              </Link>

              <Link to="/aboutus" className="group flex items-center text-sm hover:text-blue-400 transition-all duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-blue-500 mr-2 transition-colors"></span>
                About Us
              </Link>

              <Link to="/contactus" className="group flex items-center text-sm hover:text-blue-400 transition-all duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-blue-500 mr-2 transition-colors"></span>
                Contact Us
              </Link>

              <Link to="/booking" className="inline-flex items-center mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors duration-200">
                Booking Now
                <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </div>

          {/* 3. RIGHT: Slogan & Socials */}
          <div className="flex flex-col items-start lg:items-end lg:text-right space-y-5">
            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-2">Escape to Serenity</h4>
              <p className="text-sm text-slate-500 italic leading-relaxed max-w-xs lg:ml-auto">
                "Your sanctuary in Kataragama. Experience comfort, embrace luxury."
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-[#1877F2] transition-colors duration-200">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-slate-400 hover:text-[#E4405F] transition-colors duration-200">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-slate-400 hover:text-[#1DA1F2] transition-colors duration-200">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-slate-400 hover:text-[#FF0000] transition-colors duration-200">
                <Youtube size={18} />
              </a>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Globe size={12} />
            <span>© 2025 Manjitha Guest. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;