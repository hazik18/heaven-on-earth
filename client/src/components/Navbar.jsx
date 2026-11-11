import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown } from 'lucide-react';
import api from '../api';

const heritageLinks = [
  { label: 'Downtown Heritage Walk', to: '/heritage/downtown-heritage-walk' },
  { label: 'Kashmir CraftSafari', to: '/heritage/kashmir-craftsafari' },
  { label: 'Monuments', to: '/heritage/monuments' },
  { label: 'Sufi Circuit', to: '/heritage/sufi-circuit' },
  { label: 'Arts & Music', to: '/heritage/arts-and-music' },
];

const natureLinks = [
  { label: 'Eco Trail', to: '/nature/eco-trail' },
  { label: 'Birding', to: '/nature/birding' },
  { label: 'Wildlife', to: '/nature/wildlife' },
  { label: 'Apple Trail', to: '/nature/apple-trail' },
  { label: 'Fossil Trail', to: '/nature/fossil-trail' },
  { label: 'Floral Trail', to: '/nature/floral-trail' },
];


const photoshootLinks = [
  { label: 'Pre-Wedding Photoshoot', to: '/photoshoot/pre-wedding' },
  { label: 'Photographer\'s Paradise', to: '/photoshoot/photographers-paradise' },
];

const adventureLinks = [
  { label: 'Ladakh Route Catalogue', to: '/ladakh-routes' },
  { label: 'Kashmir Himalayan Circuit', to: '/activities?category=himalayan-circuit' },
  { label: 'Offbeat', to: '/activities?category=offbeat' },
  { label: 'Trekking', to: '/trekking' },
  { label: 'Skiing', to: '/activities?category=skiing' },
  { label: 'Heli Skiing', to: '/activities?category=heli-skiing' },
  { label: 'Paragliding', to: '/activities?category=paragliding' },
  { label: 'Rock Climbing', to: '/activities?category=climbing' },
  { label: 'Cycling & Mountain Biking', to: '/activities?category=cycling' },
  { label: 'River Rafting', to: '/activities?category=rafting' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [heritageOpen, setHeritageOpen] = useState(false);
  const [adventureOpen, setAdventureOpen] = useState(false);
  const [natureOpen, setNatureOpen] = useState(false);
  const [mobileHeritageOpen, setMobileHeritageOpen] = useState(false);
  const [mobileAdventureOpen, setMobileAdventureOpen] = useState(false);
  const [mobileNatureOpen, setMobileNatureOpen] = useState(false);
  const [photoshootOpen, setPhotoshootOpen] = useState(false);
  const [mobilePhotoshootOpen, setMobilePhotoshootOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const heritageRef = useRef(null);
  const adventureRef = useRef(null);
  const natureRef = useRef(null);
  const photoshootRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
    setHeritageOpen(false);
    setAdventureOpen(false);
    setNatureOpen(false);
    setMobileHeritageOpen(false);
    setMobileAdventureOpen(false);
    setMobileNatureOpen(false);
    setPhotoshootOpen(false);
    setMobilePhotoshootOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (heritageRef.current && !heritageRef.current.contains(e.target)) setHeritageOpen(false);
      if (adventureRef.current && !adventureRef.current.contains(e.target)) setAdventureOpen(false);
      if (natureRef.current && !natureRef.current.contains(e.target)) setNatureOpen(false);
      if (photoshootRef.current && !photoshootRef.current.contains(e.target)) setPhotoshootOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/hotels?search=${encodeURIComponent(searchQuery.trim())}`);
      closeSearch();
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const [hotels, destinations] = await Promise.all([
          api.getHotels(`search=${encodeURIComponent(searchQuery.trim())}`).catch(() => []),
          api.getDestinations().catch(() => []),
        ]);
        const q = searchQuery.trim().toLowerCase();
        const matchedDests = destinations.filter(d =>
          d.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)
        ).map(d => ({ type: 'destination', name: d.name, slug: d.slug, image: d.image }));
        const matchedHotels = (Array.isArray(hotels) ? hotels : []).slice(0, 5).map(h => ({
          type: 'hotel', name: h.name, slug: h.slug, image: h.image, price: h.startingPrice, destination: h.destination?.name
        }));
        const combined = [...matchedDests.slice(0, 3), ...matchedHotels.slice(0, 5)];
        setSuggestions(combined);
        setShowDropdown(combined.length > 0 || true);
      } catch {
        setSuggestions([]);
        setShowDropdown(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const goToSuggestion = (item) => {
    if (item.type === 'destination') {
      navigate(`/hotels?destination=${item.slug}`);
    } else {
      navigate(`/hotels/${item.slug}`);
    }
    closeSearch();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-white/10 w-full">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <img src="/Asset 5@300x.png" alt="Kashmir Offbeat" className="h-10 w-auto brightness-0 invert" />
              <span className="text-lg font-bold tracking-tight hidden sm:inline text-white">
                KASHMIR<span className="text-primary">OFFBEAT</span>
              </span>
            </Link>

            {/* Main Navigation */}
            <div className="hidden lg:flex items-center space-x-4 font-medium text-[13px] text-white">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>

              {/* Heritage dropdown */}
              <div ref={heritageRef} className="relative" onMouseEnter={() => setHeritageOpen(true)} onMouseLeave={() => setHeritageOpen(false)}>
                <button
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  Heritage
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${heritageOpen ? 'rotate-180' : ''}`} />
                </button>
                {heritageOpen && (
                  <div className="absolute top-full left-0 pt-2 w-56 z-50">
                  <div className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden py-1">
                    <Link to="/heritage" className="block px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50">All Heritage</Link>
                    <div className="h-px bg-slate-100 mx-3 mb-1" />
                    {heritageLinks.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-[#FF8C00] transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  </div>
                )}
              </div>

              {/* Adventure dropdown */}
              <div ref={adventureRef} className="relative" onMouseEnter={() => setAdventureOpen(true)} onMouseLeave={() => setAdventureOpen(false)}>
                <button
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  Adventure
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${adventureOpen ? 'rotate-180' : ''}`} />
                </button>
                {adventureOpen && (
                  <div className="absolute top-full left-0 pt-2 w-64 z-50">
                  <div className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden py-1">
                    <Link to="/activities" className="block px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50">All Activities</Link>
                    <div className="h-px bg-slate-100 mx-3 mb-1" />
                    {adventureLinks.map(link => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-[#FF8C00] transition-colors"
                        >
                          {link.label}
                        </Link>
                    ))}
                  </div>
                  </div>
                )}
              </div>

              {/* Nature dropdown */}
              <div ref={natureRef} className="relative" onMouseEnter={() => setNatureOpen(true)} onMouseLeave={() => setNatureOpen(false)}>
                <button
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  Nature
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${natureOpen ? 'rotate-180' : ''}`} />
                </button>
                {natureOpen && (
                  <div className="absolute top-full left-0 pt-2 w-48 z-50">
                  <div className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden py-1">
                    <Link to="/nature" className="block px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50">All Trails</Link>
                    <div className="h-px bg-slate-100 mx-3 mb-1" />
                    {natureLinks.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-[#FF8C00] transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  </div>
                )}
              </div>

              <Link to="/border-tourism" className="hover:text-primary transition-colors">Border Tourism</Link>
              <Link to="/ladakh-routes" className="hover:text-primary transition-colors">Ladakh Routes</Link>

              {/* Photoshoot dropdown */}
              <div ref={photoshootRef} className="relative" onMouseEnter={() => setPhotoshootOpen(true)} onMouseLeave={() => setPhotoshootOpen(false)}>
                <button
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  Photoshoot
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${photoshootOpen ? 'rotate-180' : ''}`} />
                </button>
                {photoshootOpen && (
                  <div className="absolute top-full left-0 pt-2 w-56 z-50">
                  <div className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden py-1">
                    {photoshootLinks.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-[#FF8C00] transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  </div>
                )}
              </div>

              <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={openSearch}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white"
              >
                <span className="material-icons text-[18px]">search</span>
                <span className="text-sm hidden lg:inline">Search</span>
              </button>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                >
                  <span className="material-icons text-[18px]">admin_panel_settings</span>
                  <span className="hidden lg:inline">Admin</span>
                </Link>
              )}

              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-sm text-white">Hi, {user.name}</span>
                  <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-all">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="hidden md:inline-block bg-gradient-to-r from-[#FF8C00] to-[#FFA500] hover:shadow-xl text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-[#FF8C00]/20">
                  Sign In
                </Link>
              )}

              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-white">
                <span className="material-icons">{menuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4 space-y-1 text-white">
              <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-primary">Home</Link>

              {/* Heritage mobile accordion */}
              <div>
                <button onClick={() => setMobileHeritageOpen(o => !o)} className="flex items-center justify-between w-full py-2 hover:text-primary">
                  <span>Heritage</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileHeritageOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileHeritageOpen && (
                  <div className="pl-4 pb-1 space-y-1 border-l border-white/20 ml-1">
                    <Link to="/heritage" onClick={() => setMenuOpen(false)} className="block py-1.5 text-sm text-slate-300 hover:text-primary">All Heritage</Link>
                    {heritageLinks.map(link => (
                      <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="block py-1.5 text-sm text-slate-300 hover:text-primary">{link.label}</Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Adventure mobile accordion */}
              <div>
                <button onClick={() => setMobileAdventureOpen(o => !o)} className="flex items-center justify-between w-full py-2 hover:text-primary">
                  <span>Adventure</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAdventureOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileAdventureOpen && (
                  <div className="pl-4 pb-1 space-y-1 border-l border-white/20 ml-1">
                    <Link to="/activities" onClick={() => setMenuOpen(false)} className="block py-1.5 text-sm text-slate-300 hover:text-primary">All Activities</Link>
                    {adventureLinks.map(link => (
                        <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="block py-1.5 text-sm text-slate-300 hover:text-primary">{link.label}</Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Nature mobile accordion */}
              <div>
                <button onClick={() => setMobileNatureOpen(o => !o)} className="flex items-center justify-between w-full py-2 hover:text-primary">
                  <span>Nature</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileNatureOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileNatureOpen && (
                  <div className="pl-4 pb-1 space-y-1 border-l border-white/20 ml-1">
                    <Link to="/nature" onClick={() => setMenuOpen(false)} className="block py-1.5 text-sm text-slate-300 hover:text-primary">All Trails</Link>
                    {natureLinks.map(link => (
                      <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="block py-1.5 text-sm text-slate-300 hover:text-primary">{link.label}</Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/border-tourism" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-primary">Border Tourism</Link>
              <Link to="/ladakh-routes" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-primary">Ladakh Routes</Link>

              {/* Photoshoot mobile accordion */}
              <div>
                <button onClick={() => setMobilePhotoshootOpen(o => !o)} className="flex items-center justify-between w-full py-2 hover:text-primary">
                  <span>Photoshoot</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobilePhotoshootOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobilePhotoshootOpen && (
                  <div className="pl-4 pb-1 space-y-1 border-l border-white/20 ml-1">
                    {photoshootLinks.map(link => (
                      <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="block py-1.5 text-sm text-slate-300 hover:text-primary">{link.label}</Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/packages" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-primary">Packages</Link>
              <Link to="/hotels" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-primary">Hotels</Link>
              <Link to="/homestays" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-primary">Homestays</Link>
              <Link to="/houseboats" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-primary">Houseboats</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-primary">About</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-primary">Contact</Link>
              <div className="border-t border-white/10 mt-3 pt-3 space-y-1">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-primary font-bold">
                        <span className="material-icons text-[18px]">admin_panel_settings</span> Admin Panel
                      </Link>
                    )}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-300">Hi, {user.name}</span>
                      <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg text-sm transition-all">
                        <span className="material-icons text-[16px]">logout</span> Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-primary font-bold">
                    <span className="material-icons text-[18px]">login</span> Sign In
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-start justify-center pt-20">
          <div ref={searchRef} className="w-full max-w-2xl mx-6">
            <form onSubmit={handleSearch} className="bg-white border-2 border-gray-200 rounded-2xl p-2 shadow-2xl">
              <div className="flex items-center gap-3 px-4 py-2">
                <span className="material-icons text-primary text-[24px]">search</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hotels, destinations..."
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 text-lg placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  className="p-2 hover:bg-gray-100 rounded-lg text-slate-600 hover:text-slate-900"
                >
                  <span className="material-icons text-[20px]">close</span>
                </button>
              </div>
            </form>

            {/* Suggestions */}
            {showDropdown && searchQuery.trim().length >= 2 && (
              <div className="mt-4 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
                {suggestions.length > 0 ? (
                  suggestions.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => goToSuggestion(item)}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-200 last:border-0"
                    >
                      {item.image ? (
                        <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="material-icons text-primary">{item.type === 'destination' ? 'place' : 'hotel'}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-slate-900 font-medium">{item.name}</p>
                        <p className="text-sm text-slate-600">
                          {item.type === 'destination' ? 'Destination' : `Hotel${item.destination ? ` · ${item.destination}` : ''}`}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center">
                    <span className="material-icons text-slate-600 text-5xl mb-3 block">search_off</span>
                    <p className="text-slate-600">No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
