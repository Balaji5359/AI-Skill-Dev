import React, { useEffect, useState } from "react";
import './ai_skill_dev.css';
import ai_skill_dev_logo from "../assets/AI_Skill_Dev_logo.png";
function AI_Skill_Dev() {
    const [scrolled, setScrolled] = useState(false);
    const [activeCard, setActiveCard] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
        setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const features = [
        {
        icon: "🚀",
        title: "AI-Agents",
        description: "Personalized learning paths powered by artificial intelligence"
        },
        {
        icon: "💡",
        title: "Smart Solutions",
        description: "Innovative approaches to complex problem-solving"
        },
        {
        icon: "🎯",
        title: "Goal-Oriented",
        description: "Focused training to achieve your career objectives"
        },
        {
        icon: "🌟",
        title: "Expert Mentorship",
        description: "Learn from industry professionals and AI experts"
        }
    ];
    const products = [
        {
        icon: "1",
        title: "Skill-Guide",
        description: "AI Skill-Dev's AI Agent and AR-VR based product for guiding students in choosing carrer paths"
        },
        {
        icon: "2",
        title: "Skill-Dev",
        description: "AI Skill-Dev's AI Agent and AI roadmap based product for developing students skills in thier carrer paths"
        },
        {
        icon: "🎯",
        title: "Skill-Route",
        description: "AI Skill-Dev's AI Agent product for routing students communication and interview skills in landing their dream"
        }
    ];

    const programs = [
        {
        title: "Beginner Track",
        price: "$99",
        duration: "3 months",
        features: ["Basic AI Concepts", "Python Programming", "Data Analysis", "Project Portfolio"]
        },
        {
        title: "Professional Track",
        price: "$199",
        duration: "6 months",
        features: ["Advanced ML", "Deep Learning", "Real Projects", "Job Placement", "Certification"],
        popular: true
        },
        {
        title: "Expert Track",
        price: "$299",
        duration: "12 months",
        features: ["Research Projects", "AI Specialization", "Mentorship", "Industry Connections", "Advanced Certification"]
        }
    ];

    return (
        <div className="landing-container">
        {/* Navigation */}
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-content">
            <div className="logo">
                <span className="logo-icon">
                    <img src={ai_skill_dev_logo} 
                    alt="AI SkillDev Logo" 
                    style={{ paddingTop: "1px", width: "80px", height: "80px", borderRadius: "50%" }}
                    />

                </span>
                <span className="logo-text">AI SkillDev</span>
            </div>
            <div className="nav-links">
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#programs">Our Products</a>
                <a href="#contact">Contact</a>
            </div>
            <button className="cta-button">Institute Register</button>
            </div>
        </nav>

        {/* Hero Section */}
        <section id="home" className="hero-section">
            <div className="hero-background">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
            </div>
            <div className="hero-content">
                <h1 className="hero-title">
                    We <span className="gradient-text">AI Skill-Dev</span> <br />for the Future
                </h1>
                <p className="hero-subtitle">
                    Transform your Computer Science career with the cutting-edge of AI education.<br></br>
                    Learn from <span className="gradient-text">AI Agents</span>, Explore from <span className="gradient-text">AR and VR</span><br></br>
                    Choose your career path<br></br>
                    Work consistently on AI roadmap<br></br>
                    Build real-world projects<br></br>
                    Practice Communication and Interviews with AI Agents<br></br>
                    Land your dream job in your chosen domain.<br></br>
                    
                </p>
                <div className="hero-buttons">
                    <button className="primary-button">Institute Registration</button>
                    <button className="secondary-button">Watch Demo</button>
                </div>
            </div>
            <div className="hero-image">
                <div className="image-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                    <img 
                        src="https://tse2.mm.bing.net/th/id/OIP.8X4eF6M_OTAWrR9dpuyiPAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" 
                        alt="AI Learning" 
                        style={{ width: "100%", maxWidth: "500px", height: "auto", display: "block", borderRadius: "12px" }}
                    />
                    <img 
                        src="https://img.freepik.com/premium-photo/futuristic-classroom-with-students-using-vr-headsets-learning-use-virtual-reality-education-transforms-learning-experience-making-it-immersive-interactive_86390-31628.jpg" 
                        alt="AR VR" 
                        style={{ width: "100%", maxWidth: "500px", height: "auto", display: "block", borderRadius: "12px" }}
                    />
                </div>
            </div>
        </section>


        <section className="features-section">
            <div className="container">
            <h2 className="section-title">Why Choose AI SkillDev?</h2>
            <div className="features-grid">
                {features.map((feature, index) => (
                <div 
                    key={index} 
                    className={`feature-card ${activeCard === index ? 'active' : ''}`}
                    onMouseEnter={() => setActiveCard(index)}
                    onMouseLeave={() => setActiveCard(null)}
                >
                    <div className="feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                </div>
                ))}
            </div>
            </div>
        </section>


        {/* Programs Section */}
        <section id="programs" className="programs-section">
            <div className="container">
            <h2 className="section-title">Choose Your Learning Path</h2>
            <div className="programs-grid">
                {programs.map((program, index) => (
                <div key={index} className={`program-card ${program.popular ? 'popular' : ''}`}>
                    {program.popular && <div className="popular-badge">Most Popular</div>}
                    <h3>{program.title}</h3>
                    <div className="price">{program.price}<span>/month</span></div>
                    <div className="duration">{program.duration}</div>
                    <ul className="features-list">
                    {program.features.map((feature, idx) => (
                        <li key={idx}>✓ {feature}</li>
                    ))}
                    </ul>
                    <button className="program-button">Choose Plan</button>
                </div>
                ))}
            </div>
            </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
            <div className="container">
            <div className="stats-grid">
                <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Students Trained</div>
                </div>
                <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Job Placement Rate</div>
                </div>
                <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Expert Mentors</div>
                </div>
                <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Partner Companies</div>
                </div>
            </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
            <div className="container">
            <h2>Ready to Start Your AI Journey?</h2>
            <p>Join thousands of students who have transformed their careers with our AI programs.</p>
            <button className="cta-large-button">Get Started Today</button>
            </div>
        </section>

        {/* Footer */}
        <footer className="footer">
            <div className="container">
            <div className="footer-content">
                <div className="footer-section">
                <h4>AI SkillDev</h4>
                <p>Empowering the next generation of AI professionals through innovative education and hands-on experience.</p>
                </div>
                <div className="footer-section">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="#about">About Us</a></li>
                    <li><a href="#programs">Programs</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li><a href="#careers">Careers</a></li>
                </ul>
                </div>
                <div className="footer-section">
                <h4>Programs</h4>
                <ul>
                    <li><a href="#beginner">Beginner Track</a></li>
                    <li><a href="#professional">Professional Track</a></li>
                    <li><a href="#expert">Expert Track</a></li>
                    <li><a href="#corporate">Corporate Training</a></li>
                </ul>
                </div>
                <div className="footer-section">
                <h4>Connect</h4>
                <div className="social-links">
                    <a href="#" className="social-link">📘</a>
                    <a href="#" className="social-link">🐦</a>
                    <a href="#" className="social-link">💼</a>
                    <a href="#" className="social-link">📷</a>
                </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 AI SkillDev. All rights reserved.</p>
            </div>
            </div>
        </footer>
        </div>
    );
}

export default AI_Skill_Dev;