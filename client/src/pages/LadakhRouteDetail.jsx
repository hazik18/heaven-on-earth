import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import mockRoutes from '../data/routes.mock.json';
import { buildWhatsAppUrl, buildEmailUrl } from '../utils/whatsapp';
import { DetailPageSkeleton } from '../components/Skeleton';
import InteractiveRouteMap from '../components/InteractiveRouteMap';

const CATEGORY_LABELS = {
  highway: 'Highway Approach',
  lake_valley: 'Leh Circuit – Lakes & Valleys',
  offbeat: 'Offbeat & High-Altitude'
};

const HIGHLIGHT_ICONS = [
  'landscape',
  'explore',
  'temple_buddhist',
  'photo_camera',
  'terrain',
  'water'
];

const ensureApprox = (val) => {
  if (!val || typeof val !== 'string') return val || '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  return /^approx\./i.test(trimmed) ? trimmed : `approx. ${trimmed}`;
};

// Simple markdown bold formatter for itinerary_summary
function renderFormattedSummary(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

// Parse highlight string "Title — Description" into { title, body }
function splitHighlight(item) {
  if (!item) return { title: '', body: '' };
  const sepMatch = item.split(/\s+[—–-]\s+/);
  if (sepMatch.length > 1) {
    return {
      title: sepMatch[0].trim(),
      body: sepMatch.slice(1).join(' — ').trim()
    };
  }
  return { title: item, body: '' };
}

export default function LadakhRouteDetail() {
  const { slug } = useParams();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openDayIdx, setOpenDayIdx] = useState(0);
  const [activeInfoTab, setActiveInfoTab] = useState('permits');
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    groupSize: { adults: 2, children: 0, infants: 0 },
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRoute();
    setCurrentImageIndex(0);
    setOpenDayIdx(0);
  }, [slug]);

  const loadRoute = async () => {
    setLoading(true);
    try {
      const data = await api.getRoute(slug);
      if (data && data.slug) {
        const mockMatch = mockRoutes.find((r) => r.slug === slug);
        if (mockMatch && String(data._id || data.id || '').startsWith('route-')) {
          setRoute(mockMatch);
        } else {
          setRoute(data);
        }
      } else {
        const fallback = mockRoutes.find((r) => r.slug === slug) || null;
        setRoute(fallback);
      }
    } catch {
      const fallback = mockRoutes.find((r) => r.slug === slug) || null;
      setRoute(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleEnquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createEnquiry({
        ...enquiryForm,
        enquiryType: 'route',
        message: `[Ladakh Route: ${route.title}] ${enquiryForm.message}`
      });
      alert('Enquiry submitted successfully! Our Ladakh route team will contact you soon.');
      setShowEnquiry(false);
      setEnquiryForm({
        name: '',
        email: '',
        phone: '',
        travelDate: '',
        groupSize: { adults: 2, children: 0, infants: 0 },
        message: ''
      });
    } catch (err) {
      alert(err.message || 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DetailPageSkeleton />;
  if (!route) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9fb] gap-4 px-4 text-center">
        <span className="text-slate-500 font-light tracking-widest uppercase text-xs">
          Route not found
        </span>
        <Link
          to="/ladakh-routes"
          className="text-xs font-bold uppercase tracking-widest text-[#FF8C00] hover:underline"
        >
          ← Back to Ladakh Route Catalogue
        </Link>
      </div>
    );
  }

  const gallery =
    route.images && route.images.length > 0
      ? route.images
      : [
          'https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?auto=compress&cs=tinysrgb&w=1600'
        ];

  const relatedRoutes = mockRoutes
    .filter((r) => r.slug !== route.slug && r.category === route.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900 page-enter">
      <main className="pt-6 sm:pt-10 pb-16 sm:pb-28 flex flex-col items-center px-4 sm:px-6">
        {/* Editorial Header */}
        <div className="w-full max-w-6xl mb-6 sm:mb-8 text-center">
          <Link
            to="/ladakh-routes"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-600 hover:text-slate-800 transition-colors mb-3 sm:mb-4"
          >
            <span className="material-icons text-sm">arrow_back</span> Back to Ladakh Route Catalogue
          </Link>
          <span className="font-sans uppercase tracking-widest text-[10px] text-[#FF8C00] font-bold mb-1.5 sm:mb-2 block">
            {CATEGORY_LABELS[route.category] || route.category} · {ensureApprox(route.approx_duration)}
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
            {route.title}
          </h1>
        </div>

        {/* Mandatory Acclimatisation Rule Callout Box */}
        <div className="w-full max-w-6xl mb-6 sm:mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <span className="material-icons text-amber-600 text-xl">warning_amber</span>
          </div>
          <div className="flex-1">
            <span className="font-sans text-xs uppercase tracking-widest text-amber-800 font-bold block mb-1">
              Mandatory Acclimatisation Rule (&gt;5,000 m Passes)
            </span>
            <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">
              We strictly advise spending a minimum of <strong>2 nights in Leh (approx. 3,500 m)</strong> for acclimatisation before undertaking high-altitude passes above <strong>5,000 m</strong> (including Khardung La, Chang La, Tanglang La, Shinku La, and Umling La). Ascend gradually, hydrate well, and never ignore symptoms of Acute Mountain Sickness (AMS).
            </p>
          </div>
        </div>

        {/* Balanced Bento Grid: Left 7 Cols (Gallery + Key Passes Card) | Right 5 Cols (Overview + Specs + CTAs) */}
        <article className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Left Column — 7 cols */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
            {/* Main Hero Image */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg bg-slate-200">
              <img
                src={gallery[currentImageIndex]}
                alt={route.title}
                className="w-full aspect-[4/3] sm:aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((p) => (p === 0 ? gallery.length - 1 : p - 1))
                    }
                    className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-md transition-all"
                  >
                    <span className="material-icons text-lg sm:text-2xl">chevron_left</span>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((p) => (p === gallery.length - 1 ? 0 : p + 1))
                    }
                    className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-md transition-all"
                  >
                    <span className="material-icons text-lg sm:text-2xl">chevron_right</span>
                  </button>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 flex flex-wrap gap-1.5 sm:gap-2">
                <span
                  className={`px-2.5 py-1 rounded-md font-sans text-[10px] uppercase tracking-widest font-bold ${
                    route.permits_required
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-green-100 text-green-900'
                  }`}
                >
                  {route.permits_required
                    ? 'EDF / PAP Permit Required'
                    : 'No Highway Permit Required'}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-md font-sans text-[10px] uppercase tracking-widest font-bold">
                  Best Season: {route.best_season}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx
                        ? 'border-[#FF8C00] ring-2 ring-[#FF8C00]/30 shadow-sm'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Key Mountain Passes & Elevations Card */}
            {route.key_passes?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3.5 sm:mb-4">
                  <span className="material-icons text-[#FF8C00] text-lg">landscape</span>
                  <span className="font-sans text-xs uppercase tracking-widest text-slate-600 font-bold">
                    Key Mountain Passes & Elevations
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                  {route.key_passes.map((pass, i) => (
                    <div
                      key={i}
                      className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 sm:p-3.5 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="material-icons text-blue-600 text-base">terrain</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans text-xs font-bold text-slate-900">
                          {pass.name}
                        </p>
                        <p className="font-sans text-xs font-semibold text-blue-700 mt-0.5">
                          {ensureApprox(pass.altitude)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — 5 cols */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm flex flex-col justify-between gap-6">
            <div className="space-y-5 sm:space-y-6">
              {/* Origin → Destination & Route Overview */}
              <header>
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-3.5 py-2 inline-flex items-center gap-2 mb-3.5 sm:mb-4 max-w-full">
                  <span className="material-icons text-[#FF8C00] text-sm shrink-0">place</span>
                  <span className="font-sans text-xs uppercase tracking-widest text-slate-800 font-bold break-words">
                    {route.from_location} → {route.to_location}
                  </span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2.5 sm:mb-3">
                  Route Overview
                </h2>
                <p className="text-slate-700 text-sm md:text-base leading-relaxed">
                  {renderFormattedSummary(route.itinerary_summary)}
                </p>
              </header>

              {/* Route Specifications (1 col on very small phones, 2x2 on sm+) */}
              <div>
                <span className="font-sans text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 block">
                  Route Specifications
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {[
                    {
                      icon: 'straighten',
                      label: 'Distance',
                      val: ensureApprox(route.approx_distance)
                    },
                    {
                      icon: 'schedule',
                      label: 'Travel Time',
                      val: ensureApprox(route.approx_duration)
                    },
                    {
                      icon: 'directions_car',
                      label: 'Mode',
                      val: route.mode || 'Car / Bike / 4x4'
                    },
                    {
                      icon: 'wb_sunny',
                      label: 'Best Season',
                      val: route.best_season
                    }
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="bg-orange-50/70 border border-orange-100 rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5"
                    >
                      <span className="material-icons text-[#FF8C00] text-lg mt-0.5 shrink-0">
                        {s.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="font-sans text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                          {s.label}
                        </p>
                        <p className="font-sans text-xs sm:text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                          {s.val}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {route.approx_cost && (
                  <div className="mt-2.5 sm:mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-3.5 flex items-center gap-3">
                    <span className="material-icons text-emerald-600 text-xl shrink-0">
                      payments
                    </span>
                    <div>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-emerald-700 font-bold">
                        Estimated Cost
                      </p>
                      <p className="font-sans text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                        {ensureApprox(route.approx_cost)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons (Stack cleanly on mobile phones, 2 cols on sm+) */}
            <div className="pt-5 border-t border-slate-200">
              <a
                href={buildWhatsAppUrl(`Ladakh Route: ${route.title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta mb-3 no-underline text-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="shrink-0"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>PLAN THIS ROUTE ON WHATSAPP</span>
                <span className="material-icons text-lg hidden sm:inline">arrow_right_alt</span>
              </a>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <a
                  href={buildEmailUrl(`Ladakh Route: ${route.title}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta no-underline"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    padding: '12px 14px'
                  }}
                >
                  <span className="material-icons text-base">email</span>
                  EMAIL QUERY
                </a>
                <button
                  type="button"
                  onClick={() => setShowEnquiry(true)}
                  className="btn-cta"
                  style={{
                    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                    padding: '12px 14px'
                  }}
                >
                  <span className="material-icons text-base">send</span>
                  BOOK / PERMIT
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Full-Width Multi-Column Route Highlights Section */}
        {route.highlights?.length > 0 && (
          <section className="w-full max-w-6xl mt-8 sm:mt-12 bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <span className="material-icons text-[#FF8C00] text-lg">stars</span>
              <span className="font-sans text-xs uppercase tracking-widest text-slate-500 font-bold">
                Key Landmarks & Experiences
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mb-5 sm:mb-6">
              Route Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {route.highlights.map((h, i) => {
                const { title, body } = splitHighlight(h);
                const iconName = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length];
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-orange-50/60 border border-orange-100 rounded-xl hover:border-orange-200 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-orange-200 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="material-icons text-[#FF8C00] text-xl">{iconName}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm md:text-base leading-snug">
                        {title}
                      </h4>
                      {body && (
                        <p className="text-slate-600 text-xs md:text-sm mt-1 leading-relaxed">
                          {body}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Interactive Route Map & Elevation Profile Preview */}
        <InteractiveRouteMap route={route} />

        {/* Day-Wise Itinerary Section */}
        {route.itinerary?.length > 0 && (
          <section className="w-full max-w-6xl mt-8 sm:mt-12 bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <span className="material-icons text-[#FF8C00] text-lg">route</span>
              <span className="font-sans text-xs uppercase tracking-widest text-slate-500 font-bold">
                Day by Day Breakdown
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">
              Suggested Route Itinerary
            </h3>

            <div className="space-y-3.5 sm:space-y-4">
              {route.itinerary.map((day, i) => {
                const isOpen = openDayIdx === i;
                return (
                  <div
                    key={i}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenDayIdx(isOpen ? -1 : i)}
                      className="w-full flex items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:px-6 sm:py-4 bg-slate-50 hover:bg-orange-50/50 text-left transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FF8C00] text-white flex items-center justify-center font-sans font-bold text-xs sm:text-sm shrink-0 shadow-sm mt-0.5 sm:mt-0">
                          D{day.day || i + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-serif text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-snug">
                            {day.title}
                          </h4>
                          <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-1 text-xs text-slate-500">
                            {day.distance && <span>{ensureApprox(day.distance)}</span>}
                            {day.duration && <span>· {ensureApprox(day.duration)}</span>}
                            {day.altitude && <span>· {ensureApprox(day.altitude)}</span>}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`material-icons text-slate-500 transition-transform duration-200 shrink-0 mt-1 sm:mt-0 ${
                          isOpen ? 'rotate-180 text-[#FF8C00]' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>

                    {isOpen && (
                      <div className="p-4 sm:px-6 sm:py-5 bg-white border-t border-slate-100">
                        <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-4">
                          {day.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {day.distance && (
                            <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                              <span className="material-icons text-xs text-orange-500">
                                straighten
                              </span>
                              {ensureApprox(day.distance)}
                            </span>
                          )}
                          {day.altitude && (
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                              <span className="material-icons text-xs text-blue-500">
                                landscape
                              </span>
                              {ensureApprox(day.altitude)}
                            </span>
                          )}
                          {day.duration && (
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                              <span className="material-icons text-xs text-slate-500">
                                schedule
                              </span>
                              {ensureApprox(day.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Mandatory Permit Notice Box & Logistics Tabs */}
        <section className="w-full max-w-6xl mt-8 sm:mt-12 bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-icons text-[#FF8C00] text-lg">verified_user</span>
                <span className="font-sans text-xs uppercase tracking-widest text-slate-500 font-bold">
                  Mandatory Route Regulations
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Permit Notice Box & Travel Logistics
              </h2>
            </div>

            {/* Tabs for Permits vs Acclimatisation & Checkposts */}
            <div className="flex flex-col sm:flex-row gap-2">
              {[
                { id: 'permits', label: 'Permit Notice (Indian & Foreigner)' },
                { id: 'acclimatisation', label: 'Acclimatisation & High Passes' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveInfoTab(tab.id)}
                  className={`px-4 py-2.5 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all text-center ${
                    activeInfoTab === tab.id
                      ? 'bg-[#FF8C00] text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeInfoTab === 'permits' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Distinct Warning Block 1: Indian Tourists (EDF) */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-[#FF8C00] text-xl">assignment_ind</span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                      Indian Tourists (EDF Permit)
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      route.permits_required
                        ? 'bg-orange-200 text-orange-900'
                        : 'bg-green-200 text-green-900'
                    }`}
                  >
                    {route.permits_required ? 'EDF Required' : 'No Permit Needed'}
                  </span>
                </div>
                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed mb-3">
                  {route.permit_details?.indian ||
                    (route.permits_required
                      ? 'Environment Development Fee (EDF / Inner Line Permit) is mandatory for Indian tourists on this route.'
                      : 'No Inner Line / EDF highway permit is required for Indian tourists on this route.')}
                </p>
                <div className="bg-white/90 border border-orange-200 rounded-xl p-3.5 sm:p-4 text-xs text-slate-700 space-y-1.5">
                  <p>
                    <strong>Official Portal:</strong> Apply online via{' '}
                    <a
                      href="https://lahdclehpermit.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF8C00] font-bold underline"
                    >
                      lahdclehpermit.in
                    </a>
                  </p>
                  <p>
                    <strong>Estimated Fee:</strong> <strong>approx. ₹400–600 per person</strong> (includes Environment Fee approx. ₹400 + Red Cross approx. ₹20/day + Wildlife Protection Fee approx. ₹10/day).
                  </p>
                  <p>
                    <strong>Checkpost Requirement:</strong> Carry 4–6 self-attested printed copies of the permit and valid government photo ID.
                  </p>
                </div>
              </div>

              {/* Distinct Warning Block 2: Foreign Nationals (PAP) */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-blue-600 text-xl">public</span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                      Foreign Nationals (PAP Rules)
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      route.permits_required
                        ? 'bg-blue-200 text-blue-900'
                        : 'bg-green-200 text-green-900'
                    }`}
                  >
                    {route.permits_required ? 'PAP Mandatory' : 'Standard Registration'}
                  </span>
                </div>
                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed mb-3">
                  {route.permit_details?.foreigner ||
                    'Foreign nationals (including OCI/PIO cardholders) require a Protected Area Permit (PAP) for inner Ladakh circuits.'}
                </p>
                <div className="bg-white/90 border border-blue-200 rounded-xl p-3.5 sm:p-4 text-xs text-slate-700 space-y-1.5">
                  <p>
                    <strong>Mandatory Booking Channel:</strong> Protected Area Permits (PAP) cannot be self-issued online and <strong>must be booked via a registered local operator like Kashmir Offbeat</strong>.
                  </p>
                  <p>
                    <strong>Documents Required:</strong> Clear copies of Passport, valid Indian Visa, and group itinerary (minimum 2+ persons for PAP zones).
                  </p>
                  <p>
                    <strong>Need Permit Assistance?</strong> Tap <em>"Plan This Route on WhatsApp"</em> above and our Leh desk will process your PAP before arrival.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-icons text-amber-600">health_and_safety</span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                  48-Hour (2 Nights in Leh) Acclimatisation Protocol
                </h3>
              </div>
              <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">
                Whether arriving by air into Leh (approx. 3,500 m) or overland via highway, spending <strong>at least 2 full nights in Leh</strong> before crossing passes above <strong>5,000 m</strong> is essential to prevent Acute Mountain Sickness (AMS), HAPE, and HACE.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
                <div className="bg-white rounded-xl p-4 border border-amber-200">
                  <p className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                    Day 1–2: Rest in Leh (approx. 3,500 m)
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Avoid physical exertion on Day 1. On Day 2, stick to gentle local sightseeing (Leh Palace, Shanti Stupa, Thiksey, or Sham Valley at lower elevation).
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-amber-200">
                  <p className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                    Brief Summit Stops (&lt;15 mins)
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    On passes exceeding 5,000 m (Khardung La, Chang La, Tanglang La, Shinku La, Umling La), limit your stop at the pass crest to 10–15 minutes.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-amber-200">
                  <p className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                    Emergency Readiness
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Carry a pulse oximeter, portable oxygen cylinder, and consult a physician regarding Diamox (Acetazolamide) prophylaxis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Mandatory Practical Logistics Footer */}
        <section className="w-full max-w-6xl mt-8 sm:mt-12 bg-slate-900 text-white rounded-2xl p-5 sm:p-8 md:p-10 shadow-lg">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="material-icons text-[#FF8C00] text-lg">info</span>
            <span className="font-sans text-xs uppercase tracking-widest text-orange-300 font-bold">
              Practical Logistics Footer
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-white mb-5 sm:mb-6">
            Fuel, Connectivity & Cash Advisory Beyond Leh / Kargil / Diskit
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3">
                <span className="material-icons text-[#FF8C00] text-xl">local_gas_station</span>
                <h4 className="font-bold text-white text-sm uppercase tracking-wider">
                  Limited Fuel Availability
                </h4>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Fuel stations are sparse beyond <strong>Leh, Karu, Kargil, Diskit, Tangtse, and Padum</strong>. Always fill a full tank before departing Leh, Kargil, or Diskit and carry spare jerrycans for extended loops like Hanle, Umling La, Tso Moriri, and Zanskar.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3">
                <span className="material-icons text-[#FF8C00] text-xl">cell_tower</span>
                <h4 className="font-bold text-white text-sm uppercase tracking-wider">
                  BSNL Mobile Network Reliance
                </h4>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Outside prepaid SIMs do not work in Ladakh. While postpaid Airtel and Jio work in Leh, Kargil, and Diskit, remote sectors (Changthang, Pangong, Tso Moriri, Hanle, Zanskar) rely primarily on <strong>BSNL postpaid connectivity</strong>. Download offline maps in advance.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3">
                <span className="material-icons text-[#FF8C00] text-xl">account_balance_wallet</span>
                <h4 className="font-bold text-white text-sm uppercase tracking-wider">
                  Carry Cash Past Leh / Kargil / Diskit
                </h4>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                ATMs and digital UPI payments are frequently offline past <strong>Leh, Kargil, and Diskit</strong>. Carry sufficient <strong>physical Indian Rupees (INR) cash</strong> for homestays, camps, meals, tyre repair shops, and checkpost fees.
              </p>
            </div>
          </div>
        </section>

        {/* Related Routes in Same Category */}
        {relatedRoutes.length > 0 && (
          <section className="w-full max-w-6xl mt-10 sm:mt-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 sm:mb-6">
              <div>
                <span className="font-sans text-xs uppercase tracking-widest text-[#FF8C00] font-bold block mb-1">
                  Explore More
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-slate-900">
                  Related Ladakh Routes
                </h3>
              </div>
              <Link
                to="/ladakh-routes"
                className="text-xs font-bold uppercase tracking-widest text-[#FF8C00] hover:underline"
              >
                View All 11 Routes →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {relatedRoutes.map((rel) => (
                <Link
                  key={rel.slug}
                  to={`/ladakh-routes/${rel.slug}`}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#FF8C00]">
                      {ensureApprox(rel.approx_distance)} · {ensureApprox(rel.approx_duration)}
                    </span>
                    <h4 className="font-serif text-lg sm:text-xl font-bold text-slate-900 mt-1 group-hover:text-[#FF8C00] transition-colors">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {rel.from_location} → {rel.to_location}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Best Season: {rel.best_season}</span>
                    <span className="text-[#FF8C00]">View Route →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Enquiry Modal — Mobile & Tablet Friendly */}
      {showEnquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  Enquire / Permit Assistance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{route.title}</p>
              </div>
              <button
                onClick={() => setShowEnquiry(false)}
                className="p-1.5 hover:bg-[#eceef0] rounded-md transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleEnquiry} className="space-y-4">
              <div>
                <label className="font-sans text-[10px] uppercase tracking-widest font-bold text-slate-600 block mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  className="w-full bg-[#eceef0] border-none rounded-md px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest font-bold text-slate-600 block mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                    className="w-full bg-[#eceef0] border-none rounded-md px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest font-bold text-slate-600 block mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    className="w-full bg-[#eceef0] border-none rounded-md px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest font-bold text-slate-600 block mb-1">
                    Travel Date
                  </label>
                  <input
                    type="date"
                    value={enquiryForm.travelDate}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, travelDate: e.target.value })}
                    className="w-full bg-[#eceef0] border-none rounded-md px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest font-bold text-slate-600 block mb-1">
                    Group Size (Adults)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={enquiryForm.groupSize.adults}
                    onChange={(e) =>
                      setEnquiryForm({
                        ...enquiryForm,
                        groupSize: { ...enquiryForm.groupSize, adults: Number(e.target.value) }
                      })
                    }
                    className="w-full bg-[#eceef0] border-none rounded-md px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="font-sans text-[10px] uppercase tracking-widest font-bold text-slate-600 block mb-1">
                  Message / Permit & Vehicle Requirements *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us your travel dates, nationality (for EDF/PAP permits), and preferred vehicle (SUV / Tempo Traveller / Bike)..."
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                  className="w-full bg-[#eceef0] border-none rounded-md px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-3.5 sm:py-4 rounded-md font-sans text-xs uppercase tracking-[0.2em] font-bold hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Route Enquiry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
