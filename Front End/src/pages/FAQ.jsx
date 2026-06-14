import React, { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('customers');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (itemId) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const faqData = {
    customers: [
      {
        id: 'customer-1',
        question: 'How do I find reliable service providers in my area?',
        answer: 'Our platform uses advanced verification systems to ensure all listed service providers are legitimate and reliable. You can search by location, service type, and read verified customer reviews. We also display ratings, years in business, and verification badges to help you make informed decisions.'
      },
      {
        id: 'customer-2',
        question: 'What services are available on AAA Services Directory?',
        answer: 'We offer a comprehensive range of services including home maintenance (plumbing, electrical, HVAC, cleaning), automotive services (repair, maintenance, detailing), professional services (legal, financial, consulting), beauty services, and much more. New service categories are regularly added based on community needs.'
      },
      {
        id: 'customer-3',
        question: 'How do I book a service appointment?',
        answer: 'Booking is simple! Browse service providers, select your preferred one, and use our integrated booking system. You can schedule appointments, request quotes, or send direct messages. Most providers offer instant booking confirmation, and you\'ll receive reminders before your appointment.'
      },
      {
        id: 'customer-4',
        question: 'Are the reviews and ratings authentic?',
        answer: 'Yes, all reviews are verified and authentic. We use multiple verification methods including transaction verification, review moderation, and fraud detection systems. Only customers who have actually used a service can leave reviews, ensuring genuine feedback for the community.'
      },
      {
        id: 'customer-5',
        question: 'What if I\'m not satisfied with a service?',
        answer: 'We have a comprehensive customer satisfaction guarantee. If you\'re not satisfied, contact our support team within 48 hours. We\'ll work with the service provider to resolve the issue, and if necessary, provide refunds or arrange for the service to be completed to your satisfaction.'
      },
      {
        id: 'customer-6',
        question: 'How do I know if a service provider is insured and licensed?',
        answer: 'All service providers on our platform are required to provide proof of insurance and licensing. This information is verified by our team and displayed on their profile. You can also request additional documentation before booking if needed.'
      },
      {
        id: 'customer-7',
        question: 'Can I compare prices between different service providers?',
        answer: 'Yes! Our platform allows you to compare quotes from multiple providers. You can request estimates, view pricing information, and compare service packages. We also show average market rates to help you understand fair pricing for your area.'
      },
      {
        id: 'customer-8',
        question: 'What payment methods are accepted?',
        answer: 'We accept all major credit cards, debit cards, and digital wallets. Some providers also accept cash payments. All online payments are processed securely through our encrypted payment system, and you\'ll receive detailed receipts for all transactions.'
      },
      {
        id: 'customer-9',
        question: 'How do I cancel or reschedule an appointment?',
        answer: 'You can cancel or reschedule appointments through your dashboard or by contacting our support team. Most providers allow cancellations up to 24 hours before the appointment without penalty. Check individual provider policies for specific cancellation terms.'
      },
      {
        id: 'customer-10',
        question: 'Is my personal information secure?',
        answer: 'Absolutely. We use enterprise-grade encryption and security measures to protect your personal information. We never share your data with third parties without your consent, and all communications are encrypted. Your privacy and security are our top priorities.'
      }
    ],
    serviceProviders: [
      {
        id: 'provider-1',
        question: 'How do I list my business on AAA Services Directory?',
        answer: 'Getting listed is easy! Simply create an account, complete your business profile with required documentation (business license, insurance certificates, photos), and submit for verification. Our team reviews all applications within 2-3 business days. Once approved, you can start receiving customer inquiries immediately.'
      },
      {
        id: 'provider-2',
        question: 'What are the costs and fees for service providers?',
        answer: 'We offer flexible pricing plans: Basic (free with limited features), Professional ($29/month with enhanced visibility), and Premium ($79/month with maximum exposure and advanced tools). There are no hidden fees, and you only pay for the plan you choose. We also offer a commission-free model for customer bookings.'
      },
      {
        id: 'provider-3',
        question: 'How do I manage customer inquiries and bookings?',
        answer: 'Our platform provides a comprehensive dashboard where you can manage all customer interactions. You\'ll receive instant notifications for new inquiries, can respond to messages, manage your calendar, and track all bookings. The system also includes automated reminders and follow-up tools.'
      },
      {
        id: 'provider-4',
        question: 'Can I set my own pricing and availability?',
        answer: 'Yes, you have complete control over your pricing and availability. You can set hourly rates, package prices, and special offers. Your calendar can be customized to show available time slots, and you can block out dates when you\'re not available. Pricing can be updated at any time.'
      },
      {
        id: 'provider-5',
        question: 'How do I handle customer reviews and ratings?',
        answer: 'Customer reviews are automatically posted after service completion. You can respond to reviews publicly to show your commitment to customer satisfaction. We also provide tools to request reviews from satisfied customers and monitor your overall rating to maintain quality standards.'
      },
      {
        id: 'provider-6',
        question: 'What marketing and promotional tools are available?',
        answer: 'We provide various marketing tools including featured listings, promotional banners, social media integration, and email marketing campaigns. Premium members get priority placement in search results, featured spots on category pages, and access to advanced analytics and customer insights.'
      },
      {
        id: 'provider-7',
        question: 'How do I handle payments and invoicing?',
        answer: 'Our platform handles all payment processing securely. You can set up automatic invoicing, accept multiple payment methods, and receive payments directly to your bank account. We provide detailed financial reports, tax documentation, and integration with popular accounting software.'
      },
      {
        id: 'provider-8',
        question: 'What support is available for service providers?',
        answer: 'We offer comprehensive support including 24/7 customer service, dedicated account managers for premium members, training webinars, and an extensive knowledge base. Our support team is available via phone, email, and live chat to help you succeed on our platform.'
      },
      {
        id: 'provider-9',
        question: 'Can I integrate my existing business systems?',
        answer: 'Yes! We offer API integration and can connect with popular business management software, accounting systems, and scheduling tools. This allows you to sync your calendar, manage inventory, and streamline your operations while maintaining your existing workflow.'
      },
      {
        id: 'provider-10',
        question: 'How do I expand my service area or add new services?',
        answer: 'You can easily update your service area and add new services through your dashboard. Simply edit your profile, add new service categories, and update your coverage area. We\'ll help promote your expanded offerings to relevant customers in your new service areas.'
      }
    ],
    general: [
      {
        id: 'general-1',
        question: 'What makes AAA Services Directory different from other platforms?',
        answer: 'AAA Services Directory stands out through our rigorous verification process, community-focused approach, and commitment to quality. We\'re part of the Accredited Assistance Association, ensuring high standards. Our platform combines the convenience of modern technology with the trust and reliability of traditional business relationships.'
      },
      {
        id: 'general-2',
        question: 'How do you ensure service quality and customer satisfaction?',
        answer: 'We maintain quality through multiple layers: thorough provider verification, customer feedback systems, performance monitoring, and regular quality audits. Providers must maintain minimum ratings and respond to customer concerns promptly. We also offer satisfaction guarantees and mediation services when needed.'
      },
      {
        id: 'general-3',
        question: 'What areas do you currently serve?',
        answer: 'We currently serve major metropolitan areas and are rapidly expanding to cover more communities. Our goal is to provide comprehensive coverage across all regions. You can check our coverage map on our website or contact us to confirm service availability in your specific area.'
      },
      {
        id: 'general-4',
        question: 'How can I contact customer support?',
        answer: 'Our support team is available 24/7 through multiple channels: phone (1-800-AAA-HELP), email (support@aaaservices.com), live chat on our website, and through our mobile app. We typically respond to inquiries within 2 hours and provide comprehensive assistance for all your needs.'
      },
      {
        id: 'general-5',
        question: 'Do you offer any loyalty programs or rewards?',
        answer: 'Yes! We offer a comprehensive rewards program for both customers and service providers. Customers earn points for every service booked, which can be redeemed for discounts. Service providers earn rewards for maintaining high ratings and completing successful jobs. We also offer referral bonuses and seasonal promotions.'
      }
    ]
  };

  const categories = [
    { id: 'customers', label: 'For Customers', icon: 'fa-users' },
    { id: 'serviceProviders', label: 'For Service Providers', icon: 'fa-briefcase' },
    { id: 'general', label: 'General Questions', icon: 'fa-question-circle' }
  ];

  return (
    <div className="faq-page">
      <section className="faq-hero">
        <div className="faq-hero-content">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about AAA Services Directory</p>
        </div>
      </section>

      <section className="faq-content">
        <div className="faq-container">
          <div className="faq-categories">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <i className={`fas ${category.icon}`}></i>
                {category.label}
              </button>
            ))}
          </div>

          <div className="faq-accordion">
            {faqData[activeCategory].map((item) => (
              <div key={item.id} className="faq-item">
                <button
                  className={`faq-question ${openItems[item.id] ? 'open' : ''}`}
                  onClick={() => toggleItem(item.id)}
                >
                  <span className="question-text">{item.question}</span>
                  <i className={`fas fa-chevron-${openItems[item.id] ? 'up' : 'down'}`}></i>
                </button>
                <div className={`faq-answer ${openItems[item.id] ? 'open' : ''}`}>
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="faq-contact">
            <h3>Still have questions?</h3>
            <p>Our support team is here to help you 24/7</p>
            <div className="contact-options">
              <div className="contact-option">
                <i className="fas fa-phone"></i>
                <div>
                  <h4>Call Us</h4>
                  <p>1-800-AAA-HELP</p>
                  <span>Available 24/7</span>
                </div>
              </div>
              <div className="contact-option">
                <i className="fas fa-envelope"></i>
                <div>
                  <h4>Email Us</h4>
                  <p>support@aaaservices.com</p>
                  <span>Response within 2 hours</span>
                </div>
              </div>
              <div className="contact-option">
                <i className="fas fa-comments"></i>
                <div>
                  <h4>Live Chat</h4>
                  <p>Available on website</p>
                  <span>Instant support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
