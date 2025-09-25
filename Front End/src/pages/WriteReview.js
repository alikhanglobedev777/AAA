// import React, { useState, useContext, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import { FaStar } from 'react-icons/fa';
// import './Login.css';

// const WriteReview = () => {
//   const { providerId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);
  
//   const [rating, setRating] = useState(0);
//   const [hover, setHover] = useState(null);
//   const [review, setReview] = useState('');
//   const [error, setError] = useState('');
//   const [provider, setProvider] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch provider details
//     const fetchProvider = async () => {
//       try {
//         const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
//         const foundProvider = providers.find(p => p.id === providerId);
        
//         if (foundProvider) {
//           setProvider(foundProvider);
//         } else {
//           setError('Service provider not found');
//         }
//       } catch (err) {
//         console.error('Error fetching provider:', err);
//         setError('Failed to load provider details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProvider();
//   }, [providerId]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!rating) {
//       setError('Please select a rating');
//       return;
//     }
    
//     if (!review.trim()) {
//       setError('Please write your review');
//       return;
//     }
    
//     try {
//       const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
//       const newReview = {
//         id: Date.now().toString(),
//         providerId,
//         userId: user.id,
//         userName: user.name,
//         userEmail: user.email,
//         rating,
//         review: review.trim(),
//         date: new Date().toISOString()
//       };
      
//       reviews.push(newReview);
//       localStorage.setItem('reviews', JSON.stringify(reviews));
      
//       // Update provider's average rating
//       const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
//       const providerIndex = providers.findIndex(p => p.id === providerId);
      
//       if (providerIndex !== -1) {
//         const providerReviews = reviews.filter(r => r.providerId === providerId);
//         const totalRating = providerReviews.reduce((sum, r) => sum + r.rating, 0);
//         const averageRating = totalRating / providerReviews.length;
        
//         providers[providerIndex] = {
//           ...providers[providerIndex],
//           rating: parseFloat(averageRating.toFixed(1)),
//           reviewCount: providerReviews.length
//         };
        
//         localStorage.setItem('serviceProviders', JSON.stringify(providers));
//       }
      
//       navigate(`/provider/${provider.serviceId}/${providerId}`, { replace: true });
//     } catch (err) {
//       console.error('Error submitting review:', err);
//       setError('Failed to submit review. Please try again.');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="login-container">
//         <div className="login-form">
//           <h2>Loading...</h2>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="login-container">
//         <div className="login-form">
//           <h2>Error</h2>
//           <p className="error-message">{error}</p>
//           <button 
//             className="login-button" 
//             onClick={() => navigate(-1)}
//             style={{ marginTop: '20px' }}
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="login-container">
//       <form onSubmit={handleSubmit} className="login-form">
//         <h2>Write a Review</h2>
//         <p>Write a review for {provider?.businessName || 'this provider'}</p>
        
//         {error && <div className="error-message">{error}</div>}
        
//         <div className="form-group">
//           <label>Your Rating</label>
//           <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
//             {[...Array(5)].map((_, index) => {
//               const ratingValue = index + 1;
//               return (
//                 <label key={index}>
//                   <input
//                     type="radio"
//                     name="rating"
//                     value={ratingValue}
//                     onClick={() => setRating(ratingValue)}
//                     style={{ display: 'none' }}
//                   />
//                   <FaStar
//                     className="star"
//                     color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
//                     size={30}
//                     onMouseEnter={() => setHover(ratingValue)}
//                     onMouseLeave={() => setHover(null)}
//                     style={{ cursor: 'pointer' }}
//                   />
//                 </label>
//               );
//             })}
//           </div>
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="review">Your Review</label>
//           <textarea
//             id="review"
//             className="form-input"
//             rows="5"
//             value={review}
//             onChange={(e) => setReview(e.target.value)}
//             placeholder="Share your experience with this provider..."
//             style={{ resize: 'vertical' }}
//           />
//         </div>
        
//         <button type="submit" className="login-button">
//           Submit Review
//         </button>
        
//         <button 
//           type="button" 
//           className="login-button" 
//           onClick={() => navigate(-1)}
//           style={{ marginTop03: '10px', backgroundColor: '#6c757d' }}
//         >
//           Cancel
//         </button>
//       </form>
//     </div>
//   );
// };

// export default WriteReview;
