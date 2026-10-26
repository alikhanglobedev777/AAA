import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRegStar, FaShieldAlt } from 'react-icons/fa';
import './ReviewPage.css';

// The authenticated /write-review/:providerId route was previously an empty
// module. Keep this URL useful while sharing the existing live review workflow
// at /reviews instead of restoring the obsolete localStorage implementation.
export default function WriteReview() {
  const navigate = useNavigate();
  return (
    <main className="aaa-review-handoff">
      <div className="aaa-review-handoff__card">
        <span className="aaa-review-handoff__icon" aria-hidden="true"><FaRegStar /></span>
        <span className="aa-eyebrow">Share your experience</span>
        <h1>Your perspective matters.</h1>
        <p>Help others make informed decisions about local services. Choose a business and leave your review using the secure review form.</p>
        <div className="aaa-review-handoff__note"><FaShieldAlt aria-hidden="true" /><span>Reviews are associated with a business profile and are subject to the platform's review process.</span></div>
        <div className="aaa-review-handoff__actions">
          <Link to="/reviews" className="btn btn-primary">Continue to review form</Link>
          <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}><FaArrowLeft aria-hidden="true" /> Go back</button>
        </div>
      </div>
    </main>
  );
}
