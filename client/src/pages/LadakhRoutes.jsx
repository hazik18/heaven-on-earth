import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import mockRoutes from '../data/routes.mock.json';
import FilterBar from '../components/FilterBar';
import ListingCard from '../components/ListingCard';

const CATEGORY_META = {
  '': {
    label: 'All Ladakh Routes',
    badge: 'Complete Catalogue',
    icon: 'alt_route',
    description: 'Explore all 11 Trans-Himalayan highways, high-altitude lake circuits, and offbeat passes across Ladakh and Zanskar.'
  },
  highway: {
    label: 'A. Highway Approaches',
    badge: 'Highway Approaches',
    icon: 'add_road',
    description: 'Trans-Himalayan overland gateways connecting Srinagar and Manali to Leh via Zoji La, Baralacha La, Tanglang La, and the Zanskar Shinku La corridor.'
  },
  lake_valley: {
    label: 'B. Leh Circuit – Lakes & Valleys',
    badge: 'Lakes & Valleys',
    icon: 'water',
    description: 'Classic high-altitude circuits from Leh across Khardung La and Chang La to Nubra Valley, Turtuk, Pangong Tso, and Tso Moriri.'
  },
  offbeat: {
    label: 'C. Offbeat & High-Altitude',
    badge: 'Offbeat & High-Altitude',
    icon: 'landscape',
    description: 'Remote frontiers including Hanle Dark Sky Reserve, Umling La (approx. 5,798 m), Zanskar (Padum), Sham Valley, and Leh Monastery circuits.'
  }
};

const ensureApprox = (val) => {
  if (!val || typeof val !== 'string') return val || '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  return /^approx\./i.test(trimmed) ? trimmed : `approx. ${trimmed}`;
};

export default function LadakhRoutes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState(initialCategory);
  const [filterPermits, setFilterPermits] = useState('');
  const [activeLogisticsTab, setActiveLogisticsTab] = useState('permits');

  useEffect(() => {
    const catParam = searchParams.get('category') || '';
    setFilterCategory(catParam);
  }, [searchParams]);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const data = await api.getRoutes();
      if (Array.isArray(data) && data.length > 0 && !String(data[0]._id || data[0].id || '').startsWith('route-')) {
        setRoutes(data);
      } else {
        setRoutes(mockRoutes);
      }
    } catch {
      setRoutes(mockRoutes);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (val) => {
    setFilterCategory(val);
    const next = new URLSearchParams(searchParams);
    if (val) next.set('category', val);
    else next.delete('category');
    setSearchParams(next);
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      if (filterCategory && r.category !== filterCategory) return false;
      if (filterPermits === 'required' && !r.permits_required) return false;
      if (filterPermits === 'none' && r.permits_required) return false;
      return true;
    });
  }, [routes, filterCategory, filterPermits]);

  const groupedSections = useMemo(() => {
    if (filterCategory) {
      return [{ key: filterCategory, meta: CATEGORY_META[filterCategory] || CATEGORY_META[''], items: filteredRoutes }];
    }
    return ['highway', 'lake_valley', 'offbeat']
      .map((key) => ({
        key,
        meta: CATEGORY_META[key],
        items: filteredRoutes.filter((r) => r.category === key)
      }))
      .filter((g) => g.items.length > 0);
  }, [filteredRoutes, filterCategory]);

  return (
    <div className="min-h-screen bg-gray-50 page-enter">
      {/* Hero Header — matches existing site hero pattern */}
      <div className="relative py-14 sm:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?auto=compress&cs=tinysrgb&w=2400)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/70" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-white">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-orange-300 font-bold mb-2 sm:mb-3">
            Kashmiroffbeat · Trans-Himalayan Overland Guide
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 drop-shadow-lg">
            Ladakh Route Catalogue
          </h1>
          <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl">
            Complete route guide to highway approaches, high-altitude lakes, and offbeat passes across Ladakh & Zanskar.
          </p>
        </div>
      </div>

      {/* Category Quick Tabs */}
      <div className="sticky top-[52px] z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto gap-2 py-2.5 sm:py-3 scrollbar-hide">
            {[
              { id: '', label: 'All Routes (11)' },
              { id: 'highway', label: 'A. Highway Approaches' },
              { id: 'lake_valley', label: 'B. Lakes & Valleys' },
              { id: 'offbeat', label: 'C. Offbeat & High-Altitude' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleCategoryChange(tab.id)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  filterCategory === tab.id
                    ? 'bg-[#FF8C00] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Mandatory Acclimatisation Advisory Banner */}
        <div className="mb-6 sm:mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <span className="material-icons text-amber-600 text-2xl">health_and_safety</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Mandatory Acclimatisation Rule
              </span>
            </div>
            <p className="text-slate-800 text-sm leading-relaxed">
              Travellers must complete a minimum of <strong>2 nights of acclimatisation in Leh (approx. 3,500 m)</strong> before undertaking high-altitude passes above <strong>5,000 m</strong> (such as Khardung La, Chang La, Tanglang La, Shinku La, or Umling La).
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={[
            {
              key: 'category',
              icon: 'alt_route',
              placeholder: 'All Categories',
              options: [
                { value: '', label: 'All Categories' },
                { value: 'highway', label: 'Highway Approaches' },
                { value: 'lake_valley', label: 'Lakes & Valleys' },
                { value: 'offbeat', label: 'Offbeat & High-Altitude' }
              ]
            },
            {
              key: 'permits',
              icon: 'verified_user',
              placeholder: 'All Permit Types',
              options: [
                { value: '', label: 'All Permit Rules' },
                { value: 'required', label: 'EDF / PAP Permit Required' },
                { value: 'none', label: 'No Permit Required' }
              ]
            }
          ]}
          values={{ category: filterCategory, permits: filterPermits }}
          onChange={(key, val) => {
            if (key === 'category') handleCategoryChange(val);
            if (key === 'permits') setFilterPermits(val);
          }}
          onClear={() => {
            handleCategoryChange('');
            setFilterPermits('');
          }}
          count={filteredRoutes.length}
        />

        {/* Route Listings by Category */}
        {loading ? (
          <div className="text-center py-20 text-slate-600">Loading Ladakh routes...</div>
        ) : filteredRoutes.length === 0 ? (
          <div className="text-center py-20 text-slate-600">No routes found matching your filters.</div>
        ) : (
          <div className="space-y-14">
            {groupedSections.map((group) => (
              <section key={group.key}>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-icons text-[#FF8C00] text-lg">{group.meta.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FF8C00]">
                      {group.meta.badge}
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900">
                    {group.meta.label}
                  </h2>
                  <p className="text-slate-600 text-sm mt-1 max-w-3xl">{group.meta.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((route) => {
                    const topPass = route.key_passes?.[0];
                    const passTag = topPass
                      ? `${topPass.name} (${ensureApprox(topPass.altitude)})`
                      : route.mode;
                    const permitTag = route.permits_required ? 'EDF / PAP Required' : 'No Permit Required';

                    return (
                      <div key={route._id || route.id || route.slug} className="flex flex-col">
                        <ListingCard
                          to={`/ladakh-routes/${route.slug}`}
                          image={
                            route.images?.[0] ||
                            'https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?auto=compress&cs=tinysrgb&w=1200'
                          }
                          title={route.title}
                          description={`${route.from_location} → ${route.to_location} · ${ensureApprox(
                            route.approx_distance
                          )} · ${ensureApprox(route.approx_duration)} · Best Season: ${route.best_season}`}
                          tags={[ ensureApprox(route.approx_distance), permitTag, passTag ]}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Essential Permits & Practical Logistics Tabs */}
        <section className="mt-12 sm:mt-16 bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#FF8C00] block mb-1">
                Essential Route Advisories
              </span>
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                Permits, Acclimatisation & Practical Logistics
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:flex gap-2">
              {[
                { id: 'permits', label: 'Permit Rules (EDF / PAP)' },
                { id: 'logistics', label: 'Fuel, Network & Cash' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveLogisticsTab(t.id)}
                  className={`px-4 py-2.5 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all text-center ${
                    activeLogisticsTab === t.id
                      ? 'bg-[#FF8C00] text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {activeLogisticsTab === 'permits' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-icons text-[#FF8C00]">badge</span>
                  <h4 className="font-serif text-xl font-bold text-slate-900">
                    Indian Tourists — EDF Online Permit
                  </h4>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Indian nationals visiting inner areas (Nubra Valley, Pangong Tso, Tso Moriri, Hanle, Umling La, Zanskar) must obtain the <strong>Environment Development Fee (EDF)</strong> online via{' '}
                  <a
                    href="https://lahdclehpermit.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF8C00] font-bold underline"
                  >
                    lahdclehpermit.in
                  </a>{' '}
                  (costing <strong>approx. ₹400–600 per person</strong>). Carry 4–6 self-attested printed copies along with original government ID for submission at checkposts.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-icons text-blue-600">public</span>
                  <h4 className="font-serif text-xl font-bold text-slate-900">
                    Foreign Nationals — Protected Area Permit (PAP)
                  </h4>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Foreign nationals (including OCI/PIO cardholders) require a <strong>Protected Area Permit (PAP)</strong> for restricted valleys and lakes. PAP cannot be applied for individually and <strong>must be booked via a registered local operator like Kashmir Offbeat</strong> with valid passport and Indian visa copies.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons text-[#FF8C00]">local_gas_station</span>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Limited Fuel Stations</h4>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Reliable fuel pumps are concentrated at <strong>Leh, Karu, Kargil, Diskit (Nubra), Tangtse, and Padum</strong>. Long stretches past Leh/Kargil/Diskit (such as Sarchu, Pangong, Tso Moriri, and Hanle) have no regular petrol stations — always top up early and carry reserve fuel for remote loops.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons text-[#FF8C00]">cell_tower</span>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">BSNL Postpaid Network</h4>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Prepaid SIM cards from outside J&K/Ladakh do not work in the region. Only <strong>postpaid connections (BSNL, Airtel, Jio)</strong> registered outside J&K function in Leh/Kargil, while remote valleys (Changthang, Hanle, Zanskar) rely primarily on <strong>BSNL postpaid</strong> or satellite phones.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons text-[#FF8C00]">payments</span>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Cash Past Leh / Kargil / Diskit</h4>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  ATMs and UPI connectivity are unreliable or unavailable past <strong>Leh, Kargil, and Diskit</strong>. Always withdraw sufficient <strong>physical cash in Leh or Kargil</strong> to cover homestays, dhabas, emergency mechanics, and checkpost fees in remote sectors.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

