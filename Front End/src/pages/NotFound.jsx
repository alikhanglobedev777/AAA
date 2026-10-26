import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="aaa-not-found" aria-labelledby="aaa-not-found-title">
      <div className="aaa-not-found__card">
        <div className="aaa-not-found__number" aria-hidden="true">404</div>
        <h1 id="aaa-not-found-title">We couldn't find that page.</h1>
        <p>This link may have moved. Explore the directory to find the services you're looking for.</p>
        <Link className="btn btn-primary" to="/businesses">Explore businesses</Link>
      </div>
    </section>
  );
}
