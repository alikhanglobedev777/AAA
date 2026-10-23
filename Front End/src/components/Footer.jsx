import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const groups = [
  { title:'Explore', links:[['Browse businesses','/businesses'],['Services','/services'],['Service categories','/service-categories'],['About AAA','/about']] },
  { title:'For businesses', links:[['Register a business','/service-provider-signup'],['Business login','/business/login'],['Business dashboard','/business/dashboard']] },
  { title:'Support', links:[['Help center','/help-center'],['FAQs','/faq'],['Contact','/contact'],['Report a concern','/complaint']] },
  { title:'Legal', links:[['Privacy policy','/privacy-policy'],['Terms and conditions','/terms-conditions']] }
];

export default function Footer() {
  return (
    <footer className="aaa-footer-v2">
      <div className="aaa-footer-v2__main">
        <div className="aaa-footer-v2__intro">
          <Link to="/home" className="aaa-footer-v2__brand"><span>A</span> AAA Services</Link>
          <h2>Local services.<br/>Clearer choices.</h2>
          <p>Browse services and business profiles, compare information, and check verification status before making a decision.</p>
          <Link to="/businesses" className="aaa-footer-v2__cta">Explore the directory <FaArrowRight aria-hidden="true"/></Link>
        </div>
        <div className="aaa-footer-v2__columns">
          {groups.map(group=>(
            <nav key={group.title} aria-label={group.title} className="aaa-footer-v2__group">
              <h3>{group.title}</h3>
              <ul>{group.links.map(([label,href])=><li key={href}><Link to={href}>{label}</Link></li>)}</ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="aaa-footer-v2__bottom"><span>© {new Date().getFullYear()} AAA Services Directory</span><span><FaMapMarkerAlt aria-hidden="true"/> Serving communities across Pakistan</span><span>Business verification is shown on individual listings.</span></div>
    </footer>
  );
}