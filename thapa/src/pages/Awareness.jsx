import React, { useState } from 'react';
import './Awareness.css';

const articlesData = [
    {
        id: 1,
        title: "Flu Vaccine Guide",
        category: "Popular Articles",
        badge: "GUIDE",
        badgeClass: "badge-guide",
        image: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=300&fit=crop",
        shortDescription: "Essential tips on seasonal flu vaccines and how they protect your family.",
        content: `The seasonal flu vaccine is your best defense against the influenza virus. It's recommended that everyone 6 months and older get a flu vaccine every season. 

**Why is it important?**
• Reduces the risk of flu illnesses, hospitalizations, and even flu-related deaths in children.
• Helps prevent spreading the flu to vulnerable family members, like newborns or elderly grandparents.

**When to get it?**
Ideally, children should get their flu vaccine by the end of October before the flu season peaks. Children younger than 9 years old who are getting the flu vaccine for the first time or who have only previously received one dose of flu vaccine should get two doses, given at least four weeks apart.

Side effects are usually mild, such as soreness where the shot was given, a low-grade fever, or aches. They generally last 1 to 2 days.`
    },
    {
        id: 2,
        title: "Why Measles Vaccination Matters",
        category: "By Vaccine",
        badge: "ALERT",
        badgeClass: "badge-alert",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop",
        shortDescription: "Understanding the importance of the MMR vaccine in preventing outbreaks.",
        content: `Measles is a highly contagious and serious disease caused by a virus. Before the measles vaccine was introduced in 1963, major epidemics occurred approximately every 2–3 years and measles caused an estimated 2.6 million deaths each year.

**The MMR Vaccine**
The MMR vaccine protects against three diseases: Measles, Mumps, and Rubella. It is highly effective and safe.

**Schedule:**
• The first dose is typically given at 12 through 15 months of age.
• The second dose is given at 4 through 6 years of age.

**Why we still need it:**
Even though measles was declared eliminated in many countries, travelers can bring it back. Because it is so contagious, a single case can spark an outbreak in communities with low vaccination rates. The MMR vaccine is the best way to prevent measles.`
    },
    {
        id: 3,
        title: "Understanding Polio",
        category: "Popular Articles",
        badge: "HISTORY & SCIENCE",
        badgeClass: "badge-science",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
        shortDescription: "Everything you need to know about the oral vs. injectable polio vaccines and the global eradication journey.",
        content: `Polio, or poliomyelitis, is a disabling and life-threatening disease caused by the poliovirus. The virus spreads from person to person and can infect a person’s spinal cord, causing paralysis.

**The Vaccines:**
There are two types of vaccine that can prevent polio:
1. Inactivated poliovirus vaccine (IPV) given as an injection in the leg or arm, depending on the patient's age. This is the only type of polio vaccine currently used in many countries.
2. Oral poliovirus vaccine (OPV) which is still used in many parts of the world to eradicate the disease.

**The Global Effort:**
In 1988, the World Health Assembly adopted a resolution for the worldwide eradication of polio. Since then, the number of polio cases has fallen by over 99%, from an estimated 350,000 cases to just a few dozen wild polio cases today.

Until polio is completely eradicated globally, it remains a threat everywhere, which is why maintaining high vaccination coverage is critical.`
    },
    {
        id: 4,
        title: "Rotavirus: Protecting Your Baby",
        category: "By Age",
        badge: "INFO",
        badgeClass: "badge-guide",
        image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=300&fit=crop",
        shortDescription: "Learn about the rotavirus vaccine and how it prevents severe dehydration.",
        content: `Rotavirus is a very contagious virus that causes severe diarrhea, vomiting, fever, and abdominal pain, mostly in babies and young children.

**The Rotavirus Vaccine:**
Unlike most vaccines, the rotavirus vaccine is given orally (drops in the mouth), not by a shot.

**Schedule:**
• The vaccine is given in 2 or 3 doses, depending on the brand used.
• The first dose should be given before a baby is 15 weeks of age.
• All doses should be completed by 8 months of age.

**Why is it important?**
Rotavirus can lead to severe dehydration, requiring hospitalization. The vaccine is very effective in preventing severe rotavirus disease.`
    },
    {
        id: 5,
        title: "Hepatitis B Vaccine for Newborns",
        category: "By Age",
        badge: "ESSENTIAL",
        badgeClass: "badge-alert",
        image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop",
        shortDescription: "Why the Hepatitis B vaccine is recommended shortly after birth.",
        content: `Hepatitis B is a serious liver disease caused by the Hepatitis B virus (HBV). It can cause mild illness lasting a few weeks, or it can lead to a serious, lifelong illness.

**The Vaccine:**
The Hepatitis B vaccine is generally considered the first vaccine your baby will receive.

**Schedule:**
• The first dose is typically given within 24 hours of birth.
• This is followed by one or two more doses over the next 6 to 18 months.

**Why right after birth?**
Giving the vaccine shortly after birth protects infants from potentially acquiring the virus from their mothers during birth, which is the most common way infants get infected.`
    },
    {
        id: 6,
        title: "Common Vaccine Side Effects",
        category: "Popular Articles",
        badge: "GUIDE",
        badgeClass: "badge-guide",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop",
        shortDescription: "What to expect after vaccination and how to manage mild side effects.",
        content: `Vaccines, like any medication, can cause side effects. Most of these are mild, temporary, and a sign that the body is building immunity.

**Common Mild Side Effects:**
• Pain, redness, or swelling at the injection site
• Low-grade fever
• Fussiness or irritability
• Drowsiness or sleepiness

**How to Manage:**
• Apply a cool, damp cloth to the injection site to help reduce soreness.
• Offer extra fluids (breast milk or formula for babies).
• Discuss pain relievers with your pediatrician if your child is uncomfortable.

**When to Call the Doctor:**
Call your healthcare provider if you see something that concerns you, such as a high fever, unusual behavior, or signs of a severe allergic reaction (which is very rare).`
    }
];

const Awareness = ({ openChat }) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [visibleArticlesCount, setVisibleArticlesCount] = useState(3);
    const filters = ['All', 'By Age', 'By Vaccine', 'Popular Articles'];

    const filteredArticles = articlesData.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              article.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || article.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

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
                    <input 
                        type="text" 
                        placeholder="Search vaccines, diseases, or health topics..." 
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setVisibleArticlesCount(3); // Reset visible count on search
                        }}
                    />
                </div>
                <div className="awareness-filters">
                    {filters.map(f => (
                        <button
                            key={f}
                            className={`filter-tag ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => {
                                setActiveFilter(f);
                                setVisibleArticlesCount(3); // Reset visible count on filter change
                            }}
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
                        {filteredArticles.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No articles found matching your search.</p>
                        ) : (
                            filteredArticles.slice(0, visibleArticlesCount).map(article => (
                                <div className="article-card" key={article.id} onClick={() => setSelectedArticle(article)}>
                                    <div className="article-image">
                                        <img src={article.image} alt={article.title} />
                                    </div>
                                    <div className="article-content">
                                        <span className={`article-badge ${article.badgeClass}`}>{article.badge}</span>
                                        <h3>{article.title}</h3>
                                        <p>{article.shortDescription}</p>
                                        <button className="read-more-link" onClick={(e) => { e.stopPropagation(); setSelectedArticle(article); }}>
                                            Read more →
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {filteredArticles.length > 3 && (
                        visibleArticlesCount < filteredArticles.length ? (
                            <button className="see-more-btn" onClick={() => setVisibleArticlesCount(filteredArticles.length)}>
                                See more articles
                            </button>
                        ) : (
                            <button className="see-more-btn" onClick={() => setVisibleArticlesCount(3)}>
                                See less articles
                            </button>
                        )
                    )}
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
                    <button className="faq-pill" onClick={() => openChat && openChat('Are vaccines safe?')}>Are vaccines safe?</button>
                    <button className="faq-pill" onClick={() => openChat && openChat('Can my child get multiple vaccines at once?')}>Can my child get multiple vaccines at once?</button>
                    <button className="faq-pill" onClick={() => openChat && openChat('What happens if we miss a dose?')}>What happens if we miss a dose?</button>
                </div>
                <button className="start-chat-btn" onClick={() => openChat && openChat('')}>
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
            {/* Article Modal */}
            {selectedArticle && (
                <div className="article-modal-overlay" onClick={() => setSelectedArticle(null)}>
                    <div className="article-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedArticle(null)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <div className="modal-header-image">
                            <img src={selectedArticle.image} alt={selectedArticle.title} />
                        </div>
                        <div className="modal-body">
                            <span className={`article-badge ${selectedArticle.badgeClass}`}>{selectedArticle.badge}</span>
                            <h2>{selectedArticle.title}</h2>
                            <div className="modal-text">
                                {selectedArticle.content.split('\n').map((line, i) => (
                                    <p key={i}>
                                        {line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Awareness;
