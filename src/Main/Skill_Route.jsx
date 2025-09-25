import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./main.css";

function SkillRouteNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const scrollToSection = (sectionId) => {
        setMenuOpen(false);
        if (location.pathname !== "/skill-route") {
            window.location.href = `/skill-route#${sectionId}`;
            return;
        }
        const section = document.getElementById(sectionId);
        if (section) {
            window.scrollTo({ top: section.offsetTop - 80, behavior: "smooth" });
        }
    };

    return (
        <nav className={scrolled ? "scrolled" : ""} style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000, background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", boxShadow: "0 2px 15px rgba(0, 0, 0, 0.1)", height: "80px", display: "flex", alignItems: "center" }}>
            <div className="header-div">
                <div className="logo-section">
                    <img src={logo} style={{ width: "60px", height: "50px", borderRadius: "8px" }} alt="Skill Route Logo" className="logo-image" />
                    <Link to="/skill-route" className="logo">
                        <h2 className="logo-text">Skill Route</h2>
                    </Link>
                </div>
                <div className={`nav-links ${menuOpen ? "active" : ""}`}>
                    <a href="#welcome-section" className="nav-link" onClick={e => { e.preventDefault(); scrollToSection("welcome-section"); }}><i className="fas fa-home"></i> Home</a>
                    <a href="#about-section" className="nav-link" onClick={e => { e.preventDefault(); scrollToSection("about-section"); }}><i className="fas fa-info-circle"></i> About Us</a>
                    <a href="#highlights-section" className="nav-link" onClick={e => { e.preventDefault(); scrollToSection("highlights-section"); }}><i className="fas fa-star"></i> Highlights</a>
                    <a href="#contact-sec" className="nav-link" onClick={e => { e.preventDefault(); scrollToSection("contact-sec"); }}><i className="fas fa-envelope"></i> Contact</a>
                    <a href="#map-sec" className="nav-link" onClick={e => { e.preventDefault(); scrollToSection("map-sec"); }}><i className="fas fa-map-marker-alt"></i> Location</a>
                </div>
                <div className="right-section">
                    <div className="auth-buttons">
                        <Link to="/signup" className="auth-btn signup-btn btn-modern hover-lift" onClick={() => setMenuOpen(false)}><i className="fas fa-user-graduate icon-pulse"></i> Student</Link>
                        <Link to="/mentor" className="auth-btn mentor-btn btn-modern hover-lift" onClick={() => setMenuOpen(false)}><i className="fas fa-chalkboard-teacher icon-pulse"></i> Mentor</Link>
                    </div>
                    <div className="mobile-menu-icon" onClick={toggleMenu}>
                        <i className={`fas ${menuOpen ? "fa-times" : "fa-bars"}`}></i>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function SkillRouteWelcomeSection() {
    useEffect(() => {
        if (window.gsap) {
            window.gsap.from(".welcome-title", { duration: 1.2, y: 50, opacity: 0, ease: "power3.out", delay: 0.3 });
            window.gsap.from(".welcome-subtitle", { duration: 1.2, y: 30, opacity: 0, ease: "power3.out", delay: 0.6 });
            window.gsap.from(".welcome-btn", { duration: 1, y: 20, opacity: 0, ease: "power3.out", delay: 0.9 });
        }
    }, []);
    return (
        <section id="welcome-section" className="welcome-section animated-bg" style={{ background: "linear-gradient(135deg, #e0e3eeff; 0%, #3a0ca3 80%)" }}>
            <div className="glass p-8 rounded-xl max-w-3xl mx-auto" data-aos="fade-up">
                <h1 className="welcome-title">Welcome to Skill Route</h1>
                <h2 className="welcome-subtitle mb-8">An Online Skill Testing and Career Path Guidance Platform <b>with AI Agents</b></h2>
                <button className="register-button btn-modern bg-gradient-primary text-white py-3 px-8 rounded-full hover-lift animated-border welcome-btn"
                    onClick={() => (window.location.href = "/signup")}
                >
                    <i className="fas fa-user-plus icon-pulse"></i> Click Here to get Started
                </button>
            </div>
            <div className="scroll-indicator">
                <div className="mouse"></div>
                <p className="mt-2">Scroll Down to know more</p>
            </div>
        </section>
    );
}

export default function SkillRoute() {
    return (
        <div>
            <SkillRouteNavbar />
            <SkillRouteWelcomeSection />
            {/* Add other sections below */}
        </div>
    );
}
