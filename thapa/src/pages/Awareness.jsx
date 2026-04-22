import React, { useState } from 'react';
import './Awareness.css';

const Awareness = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const filters = ['All', 'By Age', 'By Vaccine', 'Popular Articles'];

    return (
        <div className="awareness-page">
            {/* Breadcrumb */}
            <div className="awareness-breadcrumb">
                <a href="/dashboard">Dashboard</a> / <span>Awareness</span>
            </div>

            {/* Page Header */}
            <div className="awareness-header">
                <h1>Awareness Hub</h1>
                <p>Learn about vaccines, child health, and important information to keep your child safe.</p>
            </div>

            {/* Search & Filters */}
            <div className="awareness-search-container">
                <div className="awareness-search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" placeholder="Search vaccines, diseases, or health topics..." />
                </div>
                <div className="awareness-filters">
                    {filters.map(f => (
                        <button
                            key={f}
                            className={`filter-tag ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content: Articles + Sidebar */}
            <div className="awareness-content">
                {/* Left: Featured Articles */}
                <div className="featured-section">
                    <h2>Featured Articles</h2>
                    <div className="articles-grid">
                        {/* Article 1 - Flu Vaccine */}
                        <div className="article-card">
                            <div className="article-image">
                                <img src="https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=300&fit=crop" alt="Flu vaccine" />
                            </div>
                            <div className="article-content">
                                <span className="article-badge badge-guide">GUIDE</span>
                                <h3>Flu Vaccine Guide</h3>
                                <p>Essential tips on seasonal flu vaccines and how they protect your family.</p>
                                <a href="#" className="read-more-link">Read more →</a>
                            </div>
                        </div>

                        {/* Article 2 - Measles */}
                        <div className="article-card">
                            <div className="article-image">
                                <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop" alt="Measles virus" />
                            </div>
                            <div className="article-content">
                                <span className="article-badge badge-alert">ALERT</span>
                                <h3>Why Measles Vaccination Matters</h3>
                                <p>Understanding the importance of the MMR vaccine in preventing outbreaks.</p>
                                <a href="#" className="read-more-link">Read more →</a>
                            </div>
                        </div>

                        {/* Article 3 - Polio */}
                        <div className="article-card">
                            <div className="article-image">
                                <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop" alt="Understanding Polio" />
                            </div>
                            <div className="article-content">
                                <span className="article-badge badge-science">HISTORY & SCIENCE</span>
                                <h3>Understanding Polio</h3>
                                <p>Everything you need to know about the oral vs. injectable polio vaccines and the global eradication journey.</p>
                                <a href="#" className="read-more-link">Read full analysis →</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar */}
                <div className="awareness-sidebar">
                    {/* Did You Know Card */}
                    <div className="did-you-know-card">
                        <div className="dyk-header">
                            <div className="dyk-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                </svg>
                            </div>
                            <h3>Did You Know?</h3>
                        </div>
                        <blockquote>"Vaccines prevent 4-5 million deaths worldwide every year."</blockquote>
                        <div className="dyk-source">
                            Source: <a href="#">World Health Organization</a>
                        </div>
                    </div>

                    {/* Medical Glossary */}
                    <div className="glossary-card">
                        <h3>Medical Glossary</h3>
                        <div className="glossary-list">
                            <div className="glossary-item">
                                <div className="glossary-term">Booster Dose</div>
                                <p className="glossary-def">An extra dose of a vaccine to increase or renew the effect of a prior immunization.</p>
                            </div>
                            <div className="glossary-item">
                                <div className="glossary-term">Immunity</div>
                                <p className="glossary-def">The state of being protected against a particular disease.</p>
                            </div>
                            <div className="glossary-item">
                                <div className="glossary-term">Herd Immunity</div>
                                <p className="glossary-def">When a large portion of a community becomes immune, making disease spread unlikely.</p>
                            </div>
                            <div className="glossary-item">
                                <div className="glossary-term">Antibodies</div>
                                <p className="glossary-def">Proteins produced by the body's immune system to help fight infections.</p>
                            </div>
                        </div>
                        <a href="#" className="view-all-glossary">View All Glossary →</a>
                    </div>
                </div>
            </div>

            {/* Tips By Age */}
            <div className="age-tips-section">
                <h2>Tips by Your Child's Age</h2>
                <div className="age-tips-grid">
                    <div className="age-tip-card">
                        <div className="age-tip-icon yellow">👶</div>
                        <h4>Newborn</h4>
                        <p>Focus on Vitamin K and Hepatitis B vaccinations within 24 hours.</p>
                    </div>
                    <div className="age-tip-card">
                        <div className="age-tip-icon green">💉</div>
                        <h4>2 Months</h4>
                        <p>First major round of shots including Rotavirus and DTaP.</p>
                    </div>
                    <div className="age-tip-card">
                        <div className="age-tip-icon orange">🩺</div>
                        <h4>6 Months</h4>
                        <p>Introduction to flu shots and completion of initial series.</p>
                    </div>
                    <div className="age-tip-card">
                        <div className="age-tip-icon red">🎂</div>
                        <h4>12 Months</h4>
                        <p>Time for MMR and Varicella (Chickenpox) vaccinations.</p>
                    </div>
                </div>
            </div>

            {/* AI Assistant Banner */}
            <div className="ai-assistant-banner">
                <div className="ai-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                        <line x1="9" y1="9" x2="9.01" y2="9"></line>
                        <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                </div>
                <h2>AI Health Assistant – Ask VaxiCare AI</h2>
                <p>Get instant, reliable answers to your vaccination and child health questions powered by VaxiCare AI.</p>
                <div className="faq-pills">
                    <button className="faq-pill">Are vaccines safe?</button>
                    <button className="faq-pill">Can my child get multiple vaccines at once?</button>
                    <button className="faq-pill">What happens if we miss a dose?</button>
                </div>
                <button className="start-chat-btn">
                    Start Chat Now
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            </div>

            {/* Footer */}
            <div className="awareness-footer">
                <div className="footer-logo">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563eb" stroke="white" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none"></path>
                    </svg>
                    VaxiCare
                </div>
                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Contact Us</a>
                </div>
                <p className="footer-copyright">© 2023 VaxiCare. Empowering parents with knowledge and care.</p>
            </div>
        </div>
    );
};

export default Awareness;
