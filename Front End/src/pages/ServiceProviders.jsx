import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BusinessAvatar from '../components/BusinessAvatar';
import { useBusinesses } from '../hooks/useApiQueries';
import './ServiceProviders.css';

// Legacy numeric links are still used on parts of the site; map them to MongoDB business types.
const LEGACY_TYPES = {
  '1': 'plumbing', '2': 'electrical', '3': 'food', '4': 'cleaning',
  '5': 'transport', '6': 'maintenance', '7': 'gardening', '8': 'other',
  '9': 'other', '10': 'transport', '11': 'food', '12': 'health',
};
const TYPES = new Set([
  'plumbing', 'electrical', 'cleaning', 'painting', 'gardening', 'repair',
  'transport', 'security', 'education', 'food', 'beauty', 'health',
  'construction', 'maintenance', 'other',
]);
const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

const ServiceProviders = () => {
  const { serviceId } = useParams();
  const type = LEGACY_TYPES[serviceId] || (TYPES.has(serviceId) ? serviceId : 'other');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useBusinesses({ status: 'active', businessType: type, page, limit: 24 });
  const businesses = (data?.businesses || []).filter((business) =>
    `${business.businessName} ${business.location?.city || ''} ${business.location?.area || ''}`
      .toLowerCase().includes(search.toLowerCase()));
  const pages = data?.pagination?.totalPages || 1;

  return (
    <div className="service-providers-container">
      <h1>{type.charAt(0).toUpperCase() + type.slice(1)} Service Providers</h1>
      <p>Listings from the live AAA business directory. Unverified and demo listings are not endorsed providers.</p>
      <input aria-label="Search providers" placeholder="Search business or city" value={search}
        onChange={(e) => setSearch(e.target.value)} style={{ padding: 12, width: '100%', maxWidth: 420, margin: '16px 0' }} />
      {isLoading && <p>Loading providers from database...</p>}
      {error && <p role="alert">Unable to load providers: {error.message}</p>}
      {!isLoading && !error && businesses.length === 0 && <p>No providers found for this category.</p>}
      <div className="providers-grid">
        {businesses.map((business) => {
          const demo = business.tags?.includes('AAA_DEMO_SEED_V2');
          return (
            <article className="provider-card" key={business._id}>
              <BusinessAvatar businessName={business.businessName} imageUrl={business.images?.logo} size="medium" />
              <h3>{business.businessName}</h3>
              <p>{business.location?.city || 'Location not provided'}</p>
              <p>{business.description}</p>
              <p>{demo ? 'Fictional demo listing' : business.verification?.isVerified ? 'Verified business' : 'Unverified business'}</p>
              <Link className="view-profile-btn" to={`/business/${business.businessType}/${slugify(business.businessName)}`}>
                View business details
              </Link>
            </article>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, margin: 20 }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
};

export default ServiceProviders;
