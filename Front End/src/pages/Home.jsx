import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaExternalLinkAlt, FaSearch, FaMapMarkerAlt, FaCheckCircle, FaRegCompass, FaBolt, FaWrench, FaBroom, FaPaintRoller, FaTruck, FaTools, FaHome } from 'react-icons/fa';
import { useBusinesses } from '../hooks/useApiQueries';
import BusinessAvatar from '../components/BusinessAvatar';
import './Home.css';

const categories = [
  { name:'Plumbing', type:'plumbing', icon:FaWrench, note:'Pipes, fixtures & drains' },
  { name:'Electrical', type:'electrical', icon:FaBolt, note:'Installation & wiring' },
  { name:'Cleaning', type:'cleaning', icon:FaBroom, note:'Homes & offices' },
  { name:'Painting', type:'painting', icon:FaPaintRoller, note:'Interior & exterior' },
  { name:'Transport', type:'transport', icon:FaTruck, note:'Moving & delivery' },
  { name:'Maintenance', type:'maintenance', icon:FaTools, note:'Repairs & servicing' }
];
const businessUrl = (business) => {
  const category = String(business.businessType || 'other').toLowerCase().replace(/[^a-z0-9]/g,'');
  const slug = String(business.businessName || '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-');
  return '/business/' + category + '/' + slug;
};

export default function Home() {
  const [term,setTerm] = useState('');
  const [city,setCity] = useState('');
  const navigate = useNavigate();
  const { data, isLoading, error } = useBusinesses({status:'active',limit:6});
  const businesses = data?.businesses || [];
  const total = data?.pagination?.totalBusinesses;

  const submitSearch = (event) => {
    event.preventDefault();
    const qs = new URLSearchParams();
    if (term.trim()) qs.set('q',term.trim());
    if (city.trim()) qs.set('city',city.trim());
    navigate('/businesses' + (qs.size ? '?' + qs.toString() : ''));
  };

  return (
    <div className="aaa-home">
      <section className="aaa-home__hero">
        <div className="aaa-home__shell aaa-home__hero-grid">
          <div className="aaa-home__intro">
            <span className="aaa-home__kicker"><FaRegCompass aria-hidden="true"/> The local services directory</span>
            <h1>Find skilled help.<br/><span>Make a confident choice.</span></h1>
            <p className="aaa-home__lede">Explore businesses by service, location, and verification status—without sifting through endless listings.</p>
            <form className="aaa-home__search" onSubmit={submitSearch} aria-label="Find local services">
              <label className="aaa-home__search-field">
                <span>What do you need?</span>
                <div><FaSearch aria-hidden="true"/><input type="search" value={term} onChange={e=>setTerm(e.target.value)} placeholder="e.g. plumber, electrician"/></div>
              </label>
              <label className="aaa-home__search-field">
                <span>Where?</span>
                <div><FaMapMarkerAlt aria-hidden="true"/><input value={city} onChange={e=>setCity(e.target.value)} placeholder="City or area"/></div>
              </label>
              <button className="aaa-home__search-btn" type="submit">Search <FaArrowRight aria-hidden="true"/></button>
            </form>
            <div className="aaa-home__hero-footer"><span className="aaa-home__bullet"/> {typeof total==='number' ? total.toLocaleString() + ' directory listings' : 'Explore local listings'} <span className="aaa-home__hero-divider"/> <Link to="/service-categories">Browse all categories <FaArrowRight aria-hidden="true"/></Link></div>
          </div>
          <aside className="aaa-home__panel" aria-labelledby="aaa-home-panel-title">
            <div className="aaa-home__panel-heading"><span className="aaa-home__panel-icon"><FaHome aria-hidden="true"/></span><span>Start exploring</span></div>
            <h2 id="aaa-home-panel-title">Popular service needs</h2>
            <p>Choose a category to find businesses offering that service.</p>
            <div className="aaa-home__quick-categories">
              {categories.slice(0,4).map(cat=><Link key={cat.type} to={'/businesses?type='+cat.type} className="aaa-home__quick-category">
                <cat.icon aria-hidden="true"/><span>{cat.name}</span><FaExternalLinkAlt aria-hidden="true"/>
              </Link>)}
            </div>
            <div className="aaa-home__panel-foot"><FaCheckCircle aria-hidden="true"/> Always check a business's verification status.</div>
          </aside>
        </div>
      </section>

      <section className="aaa-home__section aaa-home__shell" aria-labelledby="aaa-categories-title">
        <div className="aaa-home__section-heading">
          <div><span className="aaa-home__eyebrow">Find your service</span><h2 id="aaa-categories-title">Browse by category</h2><p>Direct access to the services you need most.</p></div>
          <Link className="aaa-home__text-link" to="/service-categories">All categories <FaArrowRight aria-hidden="true"/></Link>
        </div>
        <div className="aaa-home__category-grid">
          {categories.map(cat=><Link key={cat.type} className="aaa-home__category" to={'/businesses?type='+cat.type}>
            <span className="aaa-home__category-icon"><cat.icon aria-hidden="true"/></span>
            <span className="aaa-home__category-title">{cat.name}</span>
            <span className="aaa-home__category-note">{cat.note}</span>
            <FaExternalLinkAlt className="aaa-home__category-arrow" aria-hidden="true"/>
          </Link>)}
        </div>
      </section>

      <section className="aaa-home__section aaa-home__shell" aria-labelledby="aaa-listings-title">
        <div className="aaa-home__section-heading">
          <div><span className="aaa-home__eyebrow">From the directory</span><h2 id="aaa-listings-title">Explore service businesses</h2><p>Current listings from the directory. Verification status is shown separately.</p></div>
          <Link className="aaa-home__text-link" to="/businesses">View directory <FaArrowRight aria-hidden="true"/></Link>
        </div>
        {isLoading ? <div className="aaa-home__state" role="status">Loading businesses…</div>
        : error ? <div className="aaa-home__state" role="alert">Unable to load listings at the moment. <Link to="/businesses">Try the directory</Link></div>
        : businesses.length ? <div className="aaa-home__listing-grid">
          {businesses.slice(0,6).map(b=>{
            const demo = b.tags?.includes('AAA_DEMO_SEED_V2');
            const verified = !demo && Boolean(b.verification?.isVerified);
            return <article key={b._id} className="aaa-home__listing">
              <div className="aaa-home__listing-head"><BusinessAvatar businessName={b.businessName} imageUrl={b.images?.logo} size="medium"/><span className="aaa-home__listing-status">{demo?'Demo listing':verified?'Verified':'Unverified'}</span></div>
              <div className="aaa-home__listing-meta">{String(b.businessType||'Service').replace(/-/g,' ')}</div>
              <h3>{b.businessName || 'Business listing'}</h3>
              <p className="aaa-home__listing-location"><FaMapMarkerAlt aria-hidden="true"/> {b.location?.city||'Location not listed'}</p>
              <p className="aaa-home__listing-desc">{b.description||'View this business for service details and contact information.'}</p>
              <Link to={businessUrl(b)} className="aaa-home__listing-link">Business details <FaArrowRight aria-hidden="true"/></Link>
            </article>;
          })}
        </div>:<div className="aaa-home__state">No listings available yet. <Link to="/service-categories">Explore categories</Link></div>}
      </section>

      <section className="aaa-home__section aaa-home__bottom">
        <div className="aaa-home__shell aaa-home__bottom-grid">
          <div><span className="aaa-home__eyebrow">For business owners</span><h2>Put your services in front of the right people.</h2><p>Create a business profile, describe your services, and manage customer inquiries from one place.</p></div>
          <Link className="aaa-home__bottom-action" to="/service-provider-signup">List your business <FaArrowRight aria-hidden="true"/></Link>
        </div>
      </section>
    </div>
  );
}