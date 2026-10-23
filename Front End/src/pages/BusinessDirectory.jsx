import Combobox from '../components/ui/Combobox';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowRight, FaMapMarkerAlt, FaSearch, FaSlidersH, FaStore } from 'react-icons/fa';
import BusinessAvatar from '../components/BusinessAvatar';
import { useBusinesses } from '../hooks/useApiQueries';
import './BusinessDirectory.css';

const BUSINESS_TYPES = [
  'plumbing', 'electrical', 'cleaning', 'painting', 'gardening', 'repair',
  'transport', 'security', 'education', 'food', 'beauty', 'health',
  'construction', 'maintenance', 'other',
];

const labelize = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ') : 'Other service';

const BusinessCard = ({ business, onOpen }) => {
  const primaryService = business.services?.[0]?.name || labelize(business.businessType);
  const isDemo = business.tags?.includes('AAA_DEMO_SEED_V2');
  const verified = Boolean(business.verification?.isVerified) && !isDemo;
  const statusText = isDemo ? 'Fictional demo listing' : verified ? 'Verified business' : 'Unverified business';

  return (
    <article className="aa-directory-card">
      <div className="aa-directory-card-top">
        <BusinessAvatar
          businessName={business.businessName}
          imageUrl={business.images?.logo}
          size="medium"
          className="aa-directory-avatar"
        />
        <span className={`aa-status ${isDemo ? 'aa-status--demo' : verified ? 'aa-status--verified' : 'aa-status--unverified'}`}>
          {statusText}
        </span>
      </div>
      <div className="aa-directory-card-body">
        <p className="aa-directory-category">{labelize(business.businessType)}</p>
        <h2>{business.businessName || 'Unnamed business'}</h2>
        <p className="aa-directory-service">{primaryService}</p>
        <p className="aa-directory-location"><FaMapMarkerAlt aria-hidden="true" /> {business.location?.city || 'City not listed'}</p>
        <p className="aa-directory-description">{business.description || 'Service details are not available yet.'}</p>
      </div>
      <button type="button" className="aa-directory-open" onClick={() => onOpen(business)}>
        View business details <FaArrowRight aria-hidden="true" />
      </button>
    </article>
  );
};

const BusinessDirectory = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get('city') || '';
  const type = searchParams.get('type') || '';
  const search = searchParams.get('q') || '';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const { data, isLoading: loading, error: queryError, refetch } = useBusinesses({
    status: 'active', city, businessType: type, search, limit: 24, page,
  });
  const businesses = data?.businesses || [];
  const total = data?.pagination?.totalBusinesses || 0;
  const totalPages = Math.max(1, data?.pagination?.totalPages || 1);
  const hasFilters = Boolean(search || city || type);

  const setFilter = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page');
      return next;
    });
  };
  const setPage = (nextPage) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (nextPage <= 1) next.delete('page');
      else next.set('page', String(nextPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const onOpenProfile = (business) => {
    const slug = String(business.businessName || '')
      .toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const category = String(business.businessType || 'other').toLowerCase().replace(/[^a-z0-9]/g, '');
    navigate(`/business/${category}/${slug}`);
  };

  return (
    <div className="aa-directory-page">
      <section className="aa-directory-hero">
        <div className="aa-container">
          <span className="aa-eyebrow">Explore AAA directory</span>
          <h1>Find a business that fits your needs.</h1>
          <p>Discover businesses across Pakistan. Compare their services, location and verification status before making a decision.</p>
        </div>
      </section>

      <div className="aa-container aa-directory-layout aa-directory-layout--split">
        <aside className="aa-directory-sidebar"><section className="aa-directory-filter-panel" aria-label="Filter businesses">
          <div className="aa-directory-filter-heading"><FaSlidersH aria-hidden="true" /><h2>Refine your search</h2></div>
          <div className="aa-directory-fields">
            <label><span className="aa-field-label">Business or service</span>
              <span className="aa-directory-search-wrap"><FaSearch aria-hidden="true" />
                <input className="aa-field" type="search" placeholder="e.g. electrician" value={search} onChange={e => setFilter('q', e.target.value)} />
              </span>
            </label>
            <label><span className="aa-field-label">City</span>
              <input className="aa-field" type="search" placeholder="e.g. Lahore" value={city} onChange={e => setFilter('city', e.target.value)} />
            </label>
            <label><span className="aa-field-label">Category</span>
              <Combobox className="aa-field" value={type} onChange={e => setFilter('type', e.target.value)}>
                <option value="">All categories</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{labelize(t)}</option>)}
              </Combobox>
            </label>
            {hasFilters && <button type="button" className="aa-directory-clear" onClick={() => setSearchParams({})}>Clear filters</button>}
          </div>
        </section>

        </aside>
        <main className="aa-directory-results">
        <div className="aa-directory-results-heading"><span className="aa-directory-results-eyebrow">THE DIRECTORY</span><h2>Available businesses</h2><p>Filter by category, city or service to narrow your options.</p></div>
        <div className="aa-results-bar" aria-live="polite" aria-atomic="true">
          <div><strong>{loading ? 'Searching…' : `${total.toLocaleString()} active ${total === 1 ? 'listing' : 'listings'}`}</strong><span> · Browse local service businesses</span></div>
          <span>Demo listings are labeled</span>
        </div>

        {queryError ? (
          <div className="aa-empty" role="alert"><h3>We couldn't load the directory</h3><p>{queryError.message || 'Check your connection and try again.'}</p><button className="aa-btn aa-btn--outline" type="button" onClick={() => refetch()}>Try again</button></div>
        ) : loading ? (
          <div className="aa-directory-grid" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="aa-directory-skeleton" aria-hidden="true" />)}
            <span className="sr-only">Loading businesses</span>
          </div>
        ) : businesses.length ? (
          <div className="aa-directory-grid">{businesses.map(b => <BusinessCard key={b._id} business={b} onOpen={onOpenProfile} />)}</div>
        ) : (
          <div className="aa-empty"><FaStore size={28} aria-hidden="true" /><h3>No businesses match your search</h3><p>Try another category, city or search term.</p><button className="aa-btn aa-btn--outline" type="button" onClick={() => setSearchParams({})}>Reset search</button></div>
        )}

        {!queryError && !loading && totalPages > 1 && (
          <nav className="aa-pagination" aria-label="Business directory pages">
            <button type="button" className="aa-btn aa-btn--outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page <strong>{page}</strong> of {totalPages}</span>
            <button type="button" className="aa-btn aa-btn--outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </nav>
        )}
        </main>
      </div>
    </div>
  );
};

export default BusinessDirectory;
