import { Link } from 'react-router-dom';
import { getContactConfig } from '../utils/whatsapp';
import { Facebook, Instagram, Youtube } from 'lucide-react';

const XIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  const { contactPhone, contactEmail } = getContactConfig();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <img src="/Asset 5@300x.png" alt="Kashmir Offbeat" className="h-10 w-auto brightness-0 invert" />
              <span className="text-xl font-bold tracking-tight text-white">KASHMIR<span className="text-primary">OFFBEAT</span></span>
            </div>
              <p className="text-whitetext-sm leading-relaxed mb-6">
              Your trusted partner for authentic Kashmir experiences. From luxury houseboats on Dal Lake to thrilling Himalayan treks, we craft unforgettable journeys in the heart of paradise.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-white">
                <span className="material-icons text-primary text-[18px]">location_on</span>
                <span>Srinagar, Jammu & Kashmir, India</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white">
                <span className="material-icons text-primary text-[18px]">phone</span>
                <span>{contactPhone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white">
                <span className="material-icons text-primary text-[18px]">email</span>
                <span>{contactEmail}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <a href="https://www.youtube.com/@kmrOffbeat" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border-2 border-slate-700 flex items-center justify-center hover:bg-[#FF8C00] hover:border-[#FF8C00] transition-all duration-300 group">
                <Youtube className="w-4 h-4 text-slate-300 group-hover:text-white" />
              </a>
              <a href="https://x.com/kash_offbeat" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border-2 border-slate-700 flex items-center justify-center hover:bg-[#FF8C00] hover:border-[#FF8C00] transition-all duration-300 group">
                <XIcon className="w-4 h-4 text-slate-300 group-hover:text-white" />
              </a>
              <a href="https://www.facebook.com/kashmiroffbeat" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border-2 border-slate-700 flex items-center justify-center hover:bg-[#FF8C00] hover:border-[#FF8C00] transition-all duration-300 group">
                <Facebook className="w-4 h-4 text-slate-300 group-hover:text-white" />
              </a>
              <a href="https://www.instagram.com/kash_offbeat" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border-2 border-slate-700 flex items-center justify-center hover:bg-[#FF8C00] hover:border-[#FF8C00] transition-all duration-300 group">
                <Instagram className="w-4 h-4 text-slate-300 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h6 className="font-bold mb-6 text-sm uppercase tracking-widest text-white">Explore</h6>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li><Link to="/ladakh-routes" className="hover:text-primary transition-colors">Ladakh Route Catalogue</Link></li>
              <li><Link to="/packages" className="hover:text-primary transition-colors">Tour Packages</Link></li>
              <li><Link to="/trekking" className="hover:text-primary transition-colors">Trekking</Link></li>
              <li><Link to="/activities" className="hover:text-primary transition-colors">Adventure Sport</Link></li>
              <li><Link to="/heritage" className="hover:text-primary transition-colors">Heritage & Culture</Link></li>
              <li><Link to="/nature" className="hover:text-primary transition-colors">Nature Trails</Link></li>
              <li><Link to="/literature" className="hover:text-primary transition-colors">Literature & Culture</Link></li>
            </ul>
          </div>

          {/* Accommodations */}
          <div>
            <h6 className="font-bold mb-6 text-sm uppercase tracking-widest text-white">Stay</h6>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li><Link to="/hotels" className="hover:text-primary transition-colors">Hotels & Resorts</Link></li>
              <li><Link to="/homestays" className="hover:text-primary transition-colors">Homestays</Link></li>
              <li><Link to="/houseboats" className="hover:text-primary transition-colors">Houseboats</Link></li>
              <li><Link to="/list-homestay" className="hover:text-primary transition-colors">List Your Property</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h6 className="font-bold mb-6 text-sm uppercase tracking-widest text-white">Company</h6>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/articles" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/submit-article" className="hover:text-primary transition-colors">Write for Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="border-t border-slate-700 pt-8 mb-8">
          <h6 className="font-bold mb-4 text-sm uppercase tracking-widest text-white">Popular Destinations</h6>
          <div className="flex flex-wrap gap-3">
            {['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg', 'Leh-Ladakh', 'Yusmarg', 'Doodhpathri', 'Gurez Valley'].map((dest) => (
              <Link
                key={dest}
                to={dest === 'Leh-Ladakh' ? '/ladakh-routes' : `/hotels?destination=${dest.toLowerCase().replace(' ', '-')}`}
                className="bg-slate-800 hover:bg-[#FF8C00] border border-slate-600 hover:border-[#FF8C00] px-4 py-2 rounded-full text-xs text-slate-300 hover:text-white transition-all"
              >
                {dest}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} Kashmir Offbeat. All Rights Reserved. | Registered in India
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link>
            <Link to="/cancellation-policy" className="hover:text-primary transition-colors">Cancellation Policy</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
