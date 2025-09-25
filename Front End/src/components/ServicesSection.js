import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from 'react-router-dom';
import './ServicesSection.css';
import CategoryCard from './CategoryCard';
import ServiceCard from './ServiceCard';
import featuredServices from '../data/featuredServices';

const ServicesSection = () => {
    // Updated categories to match navigation
    const updatedCategories = [
        { 
            id: 1, 
            name: 'Plumbing', 
            icon: 'fas fa-sink',
            image: 'images/plumbing.jpg',
            bgColor: '#E8F5E9',
            gradient: 'linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%)',
            iconColor: '#228B22',
            link: '/services?category=plumbing'
        },
        { 
            id: 2, 
            name: 'Electrical', 
            icon: 'fas fa-bolt',
            image: 'images/electrical.jpg',
            bgColor: '#FFF8E1',
            gradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFD54F 100%)',
            iconColor: '#FF8F00',
            link: '/services?category=electrical'
        },
        { 
            id: 3, 
            name: 'Cleaning', 
            icon: 'fas fa-broom',
            image: 'images/cleaning.jpg',
            bgColor: '#E3F2FD',
            gradient: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%)',
            iconColor: '#1976D2',
            link: '/services?category=cleaning'
        },
        { 
            id: 4, 
            name: 'Food', 
            icon: 'fas fa-utensils',
            image: 'images/food.jpg',
            bgColor: '#FFEBEE',
            gradient: 'linear-gradient(135deg, #FFEBEE 0%, #EF9A9A 100%)',
            iconColor: '#D32F2F',
            link: '/services?category=food'
        },
        { 
            id: 5, 
            name: 'Construction', 
            icon: 'fas fa-hammer',
            image: 'images/construction.jpg',
            bgColor: '#F3E5F5',
            gradient: 'linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)',
            iconColor: '#7B1FA2',
            link: '/services?category=construction'
        },
        { 
            id: 6, 
            name: 'Transport', 
            icon: 'fas fa-truck',
            image: 'images/transport.jpg',
            bgColor: '#E0F2F1',
            gradient: 'linear-gradient(135deg, #E0F2F1 0%, #80CBC4 100%)',
            iconColor: '#00695C',
            link: '/services?category=transport'
        },
        { 
            id: 7, 
            name: 'Security', 
            icon: 'fas fa-shield-alt',
            image: 'images/security.jpg',
            bgColor: '#FCE4EC',
            gradient: 'linear-gradient(135deg, #FCE4EC 0%, #F48FB1 100%)',
            iconColor: '#C2185B',
            link: '/services?category=security'
        }
    ];

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    return (
        <section className="services-section">
            <div className="container">
                <div className="section-header">
                    <h1>Popular Service Categories</h1>
                    <p className="section-subtitle">Discover our most popular professional services</p>
                </div>
                
                <div className="categories-container">
                    <Slider {...sliderSettings}>
                        {updatedCategories.map(category => (
                            <CategoryCard key={category.id} category={category} />
                        ))}
                    </Slider>
                </div>
                
                <div className="see-more-container">
                    <Link to="/service-categories" className="see-more-link">
                        View All Categories →
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;