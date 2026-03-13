import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Zap, BarChart3, Users, ArrowRight, Menu, X } from 'lucide-react';
import './landing-theme.css';
import logo from '../assets/logo.png';

function LandingPage() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPlanFeatures, setShowPlanFeatures] = useState(null);
  const [pendingPlan, setPendingPlan] = useState(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const animateElements = document.querySelectorAll('[data-animate]');
    animateElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const isModalOpen = activeModal || mobileMenuOpen || showTerms || showPlanFeatures;
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeModal, mobileMenuOpen, showTerms, showPlanFeatures]);

  useEffect(() => {
    const main = document.querySelector('.main-content');
    const previousPaddingTop = main ? main.style.paddingTop : '';
    if (main) {
      main.style.paddingTop = '0px';
    }
    document.body.classList.add('landing-page');

    return () => {
      if (main) {
        main.style.paddingTop = previousPaddingTop;
      }
      document.body.classList.remove('landing-page');
    };
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    }
  };

  const activities = [
    { id: 'jam', title: 'JAM Sessions', description: 'Just A Minute speaking sessions', icon: Sparkles },
    { id: 'pronunciation', title: 'Pronunciation Test', description: 'Perfect your pronunciation', icon: Zap },
    { id: 'listening', title: 'Listening Test', description: 'Enhance comprehension', icon: BookOpen },
    { id: 'situational', title: 'Situational Speaking', description: 'Practice real-life scenarios', icon: Users },
    { id: 'image', title: 'Image-Based Speaking', description: 'Describe images fluently', icon: BarChart3 }
  ];

  const features = [
    { number: '01', icon: BookOpen, title: 'ACCESS TARA', description: 'Sign up and get personalized feedback' },
    { number: '02', icon: Zap, title: 'Practice Daily', description: 'Engage with interactive activities' },
    { number: '03', icon: BarChart3, title: 'Track Progress', description: 'Monitor improvement with analytics' }
  ];

  const communicationActivities = [
    {
      id: 'speaking',
      title: 'JAM - Just A Minute',
      levels: ['Basic', 'Intermediate', 'Advanced']
    },
    {
      id: 'pronunciation',
      title: 'Pronunciation Practice',
      levels: ['Basic', 'Intermediate', 'Advanced']
    },
    {
      id: 'listening',
      title: 'Listening Comprehension',
      levels: ['Basic', 'Intermediate', 'Advanced']
    },
    {
      id: 'situational',
      title: 'Situational Speaking',
      levels: ['Basic', 'Intermediate', 'Advanced']
    },
    {
      id: 'image',
      title: 'Image-Based Speaking',
      levels: ['Basic', 'Intermediate', 'Advanced']
    }
  ];


  // New hierarchical structure with levels
  const interviewTopics = [
    { topicId: 1, title: "Self Introduction", levels: ["Basic", "Intermediate", "Advanced"] },
    { topicId: 2, title: "Programming Knowledge", levels: ["Basic", "Intermediate", "Advanced"] },
    { topicId: 3, title: "Worked Domain", levels: ["Basic", "Intermediate", "Advanced"] },
    { topicId: 4, title: "Project Discussion", levels: ["Basic", "Intermediate", "Advanced"] },
    { topicId: 5, title: "Future Career Planning", levels: ["Basic", "Intermediate", "Advanced"] },
    { topicId: 6, title: "Hobbies & Interests", levels: ["Basic", "Intermediate", "Advanced"] },
    { topicId: 7, title: "Certifications Exploration", levels: ["Basic", "Intermediate", "Advanced"] }
  ];

  const advancedTopics = [
    { topicId: 8, title: "Project Reviews", levels: ["Basic", "Intermediate", "Advanced"] },
    { topicId: 9, title: "Role-Based Interview", levels: ["Basic", "Intermediate", "Advanced"] },
    { topicId: 10, title: "Resume-Based Interview", levels: ["Basic", "Intermediate", "Advanced"] },
    { topicId: 11, title: "Technical Interview", levels: ["Basic", "Intermediate", "Advanced"] },
    { topicId: 12, title: "Follow-Up Questioning", levels: ["Basic", "Intermediate", "Advanced"] },
    { topicId: 13, title: "Stress/Pressure Questions", levels: ["Basic", "Intermediate", "Advanced"] },
    { topicId: 14, title: "Logical Puzzles", levels: ["Basic", "Intermediate", "Advanced"] }
  ];

  const plans = [
    {
      tag: 'Free',
      price: '₹0',
      duration: '/Free Trial',
      button: 'Try Free',
      highlight: false
    },
    {
      tag: '1 Month',
      price: '₹99',
      duration: '/month',
      button: 'Start Plan',
      highlight: false
    },
    {
      tag: 'Most Popular',
      price: '₹249',
      duration: '/3 months',
      button: 'Upgrade Now',
      highlight: true
    },
    {
      tag: 'Best Value',
      price: '₹699',
      duration: '/Year ✨',
      button: 'Go Premium',
      highlight: false
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const apiUrl = import.meta.env.VITE_CONTACT_API_URL;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, message: formData.message })
      });

      if (response.ok) {
        setSubmitMessage('Your message has been received! Thank you from Skill-Route');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitMessage('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('API Error:', error);
      setSubmitMessage('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPlan = (plan) => {
    if (!agreeToTerms) {
      setPendingPlan(plan);
      setShowTerms(true);
      return;
    }
    navigate('/signup', { state: { selectedPlan: plan } });
  };

  return (
    <div className="landing-theme min-h-screen">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container m-0">
          <div className="flex items-center justify-between py-3 m-0">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="Skill Route" className="w-10 h-10 rounded-full" />
              <span className="text-xl font-bold font-heading text-gradient-primary hidden sm:inline">Skill Route</span>
            </div>

            <nav className="hidden md:flex items-center gap-14">
              <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="text-sm text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-sm text-foreground hover:text-primary transition-colors">Features</a>
              <a href="#activities" onClick={(e) => handleNavClick(e, 'activities')} className="text-sm text-foreground hover:text-primary transition-colors">Activities</a>
              <a href="#interviews" onClick={(e) => handleNavClick(e, 'interviews')} className="text-sm text-foreground hover:text-primary transition-colors">Interviews</a>
              <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="text-sm text-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="text-sm text-foreground hover:text-primary transition-colors">Contact</a>
            </nav>

            <button onClick={() => navigate('/signup')} className="hidden md:block landing-btn-primary">Get Started</button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-border py-4 md:hidden flex flex-col gap-3">
              <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="text-foreground hover:text-primary">Home</a>
              <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-foreground hover:text-primary">Features</a>
              <a href="#activities" onClick={(e) => handleNavClick(e, 'activities')} className="text-foreground hover:text-primary">Activities</a>
              <a href="#interviews" onClick={(e) => handleNavClick(e, 'interviews')} className="text-foreground hover:text-primary">Interviews</a>
              <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="text-foreground hover:text-primary">Pricing</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="text-foreground hover:text-primary">Contact</a>
              <button onClick={() => navigate('/signup')} className="landing-btn-primary w-full text-center">Get Started</button>
            </div>
          )}
        </div>
      </header>

     {/* Hero */}
      <section id="home" style={{ background: 'var(--gradient-hero)' }} className="py-12 sm:py-16 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div data-animate>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-6 landing-badge primary">
                <Sparkles className="w-4 h-4" />
                AI-Powered Communication
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground mb-4 leading-tight">
                Speak with <span className="text-gradient-primary">TaraAI</span><br></br> Speak with Confidence 
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed">
                Practice, learn, and improve your communication skills with personalized feedback from TaraAI.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate('/signup')} className="landing-btn-primary flex items-center justify-center gap-2 text-sm">
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => window.open('https://mentorhub.skillrouteai.com', '_blank')} className="px-6 py-2 sm:py-3 border-2 border-primary rounded-lg font-semibold text-primary hover:bg-primary/5 transition-all text-sm">
                  Mentor Access
                </button>
              </div>
            </div>

            <div data-animate className="relative h-80 sm:h-96">
              {[
                { title: 'Progress', icon: '📊', delay: 0 },
                { title: 'Achievements', icon: '🏆', delay: 0.3 },
                { title: 'AI Feedback', icon: '🤖', delay: 0.6 },
                { title: 'Real Mentor Guide', icon: '👩‍🏫', delay: 0.9 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="absolute bg-card border border-border rounded-lg p-3 shadow-lg text-center"
                  style={{
                    animation: `float 3s ease-in-out ${item.delay}s infinite`,
                    left: `${15 + (idx % 2) * 40}%`,
                    top: `${20 + Math.floor(idx / 2) * 35}%`,
                    width: '120px'
                  }}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="font-semibold text-xs text-foreground">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 sm:py-16 md:py-20 bg-card">
        <div className="container">
          <div className="text-center mb-10 md:mb-16" data-animate>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">How Skill Route Works</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Three simple steps to transform your communication</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} data-animate className="relative overflow-hidden rounded-2xl bg-background border border-border p-6 md:p-8">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary/20 font-heading mb-2">{feature.number}</div>
                    <h3 className="text-lg md:text-xl font-bold font-heading text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Communication Learning Path - Combined with Interactive Learning */}
      <section id="communication-learning" className="py-12 sm:py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)' }}>
        <div className="container">
          <div className="text-center mb-16" data-animate>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">Communication Learning Path</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Master communication skills through progressive levels</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {communicationActivities.map((activity, idx) => (
              <div key={activity.id} data-animate style={{ animationDelay: `${idx * 100}ms` }} className="group">
                <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                    <span className="text-2xl">{['🎤', '🗣️', '👂', '💬', '🖼️'][idx]}</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground text-center mb-4">{activity.title}</h3>
                  <div className="space-y-2">
                    {activity.levels.map((level, levelIdx) => (
                      <div key={levelIdx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className={`w-2 h-2 rounded-full ${
                          levelIdx === 0 ? 'bg-green-500' : levelIdx === 1 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-xs font-medium text-foreground">{level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview Mastery Path - Hierarchical Flow */}
      <section id="interviews" className="py-12 sm:py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #f0f9f7 0%, #f5faf8 100%)' }}>
        <div className="container">
          <div className="text-center mb-16" data-animate>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">Interview Mastery Path</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Progress through structured learning levels</p>
          </div>

          {/* Basic Module */}
          <div className="mb-20" data-animate>
            <div className="flex items-center justify-center mb-12">
              <div className="text-center">
                <div className="inline-block px-6 py-3 rounded-full bg-primary/10 border-2 border-primary">
                  <h3 className="font-heading text-xl font-bold text-primary">🎯 BASIC MODULE</h3>
                </div>
              </div>
            </div>

            <div className="interview-path-grid">
              {interviewTopics.map((topic, topicIdx) => (
                <div key={topic.topicId} className="interview-topic-container" data-animate style={{ animationDelay: `${topicIdx * 100}ms` }}>
                  {/* Topic Header */}
                  <div className="interview-topic-header">
                    <div className="topic-number">{topic.topicId}</div>
                    <h4 className="topic-title">{topic.title}</h4>
                  </div>

                  {/* Level Progression Path */}
                  <div className="interview-levels-flow">
                    {topic.levels.map((level, levelIdx) => (
                      <div key={levelIdx} className="interview-level-item">
                        {/* Connection Line */}
                        {levelIdx < topic.levels.length - 1 && (
                          <div className="level-connector"></div>
                        )}

                        {/* Level Badge */}
                        <div className={`level-badge level-${levelIdx + 1}`}>
                          <div className="level-dot"></div>
                          <span className="level-text">{level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex justify-center mb-20">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-primary/15 border-2 border-dashed border-primary">
                <span className="text-primary font-bold">⬇</span>
                <span className="text-primary font-semibold text-sm">Unlock Advanced Module</span>
                <span className="text-primary font-bold">⬇</span>
              </div>
            </div>
          </div>

          {/* Advanced Module */}
          <div data-animate>
            <div className="flex items-center justify-center mb-12">
              <div className="text-center">
                <div className="inline-block px-6 py-3 rounded-full bg-accent/10 border-2 border-accent">
                  <h3 className="font-heading text-xl font-bold text-accent">🚀 ADVANCED MODULE</h3>
                </div>
              </div>
            </div>

            <div className="interview-path-grid">
              {advancedTopics.map((topic, topicIdx) => (
                <div key={topic.topicId} className="interview-topic-container advanced" data-animate style={{ animationDelay: `${topicIdx * 100}ms` }}>
                  {/* Topic Header */}
                  <div className="interview-topic-header advanced">
                    <div className="topic-number accent">{topic.topicId}</div>
                    <h4 className="topic-title">{topic.title}</h4>
                  </div>

                  {/* Level Progression Path */}
                  <div className="interview-levels-flow">
                    {topic.levels.map((level, levelIdx) => (
                      <div key={levelIdx} className="interview-level-item">
                        {/* Connection Line */}
                        {levelIdx < topic.levels.length - 1 && (
                          <div className="level-connector accent"></div>
                        )}

                        {/* Level Badge */}
                        <div className={`level-badge level-${levelIdx + 1} advanced`}>
                          <div className="level-dot"></div>
                          <span className="level-text">{level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12 md:mb-16" data-animate>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">Choose Your Plan</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Flexible pricing for your needs</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8">
              {/* Free Plan */}
              <div data-animate className="rounded-2xl bg-card border border-border p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold font-heading text-foreground mb-2">Free Plan</h3>
                  <span className="text-4xl font-bold text-primary">₹0</span>
                </div>
                <div className="space-y-2 mb-6">
                  <p className="flex items-start gap-2 text-sm text-foreground"><span className="text-primary font-bold">✓</span> 2 tests - for trial</p>
                  <p className="flex items-start gap-2 text-sm text-foreground"><span className="text-primary font-bold">✓</span> Basic tests only</p>
                  <p className="flex items-start gap-2 text-sm text-foreground"><span className="text-primary font-bold">✓</span> Simple AI feedback</p>
                  <p className="flex items-start gap-2 text-sm text-foreground"><span className="text-primary font-bold">✓</span> Basic streak tracking</p>
                  <p className="flex items-start gap-2 text-sm text-muted-foreground"><span className="font-bold">✗</span> No advanced analytics</p>
                </div>
                <button onClick={() => setShowPlanFeatures(plans[0])} className="w-full py-2.5 rounded-lg bg-muted text-foreground font-bold hover:bg-muted/80 transition-all text-sm">
                  Get Started
                </button>
              </div>

              {/* Premium Plan */}
              <div data-animate className="rounded-2xl border-2 border-primary/60 bg-gradient-to-br from-primary/10 to-card relative flex flex-col p-8">
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">Most Popular</div>
                <div className="text-center mb-6 mt-2">
                  <h3 className="text-2xl font-bold font-heading text-foreground mb-2">Premium Plans</h3>
                  <p className="text-sm text-muted-foreground mb-4">Choose duration that works for you</p>
                </div>
                <div className="space-y-2 mb-8">
                  <p className="flex items-start gap-2 text-sm text-foreground"><span className="text-primary font-bold">✓</span> Daily 2 tests of all Levels</p>
                  <p className="flex items-start gap-2 text-sm text-foreground"><span className="text-primary font-bold">✓</span> Advanced test types</p>
                  <p className="flex items-start gap-2 text-sm text-foreground"><span className="text-primary font-bold">✓</span> Detailed AI analysis & audio</p>
                  <p className="flex items-start gap-2 text-sm text-foreground"><span className="text-primary font-bold">✓</span> Advanced analytics & Badges</p>
                  <p className="flex items-start gap-2 text-sm text-foreground"><span className="text-primary font-bold">✓</span> All Levels Access</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {plans.slice(1, 4).map((plan, idx) => (
                    <button
                      key={idx}
                      onClick={() => setShowPlanFeatures(plan)}
                      className="py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all text-xs flex flex-col items-center"
                    >
                      <span className="text-lg">{plan.price}</span>
                      <span className="text-xs opacity-90">{plan.tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* T&C Link Only */}
            <div data-animate className="rounded-xl bg-card border border-border p-6 md:p-8 text-center">
              <p className="text-sm md:text-base text-foreground mb-4">
                By signing up, you agree to our <button
                  onClick={() => setShowTerms(true)}
                  className="text-primary font-semibold hover:underline"
                >
                  Terms & Conditions
                </button>
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground border-t border-border pt-4">
                <span>🔒 Secure Payment via Razorpay</span>
                <span className="hidden sm:inline">•</span>
                <span>💳 100% Safe & Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-12 sm:py-16 md:py-20 bg-card">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div data-animate className="rounded-2xl bg-background border border-border p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-4">Get in Touch</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-8">Connect with us through professional channels.</p>

              <div className="space-y-6">
                {[
                  { icon: '💼', label: 'LinkedIn', value: 'linkedin.com/in/rrbalaji' },
                  { icon: '📧', label: 'Email', value: 'support@skillrouteai.com' },
                  { icon: '📞', label: 'Phone', value: '+91 9398350217' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-sm md:text-base text-foreground">{item.label}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div data-animate className="rounded-2xl bg-background border border-border p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold font-heading text-foreground mb-6">Send Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Your Message"
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
                <button type="submit" disabled={isSubmitting} className="landing-btn-primary w-full text-center text-sm">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
                {submitMessage && <p className="text-xs md:text-sm text-primary font-medium text-center">{submitMessage}</p>}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src={logo} alt="Skill Route" className="w-8 h-8 rounded-full" />
            <span className="font-bold text-foreground">Skill Route</span>
          </div>
          <p className="text-xs md:text-sm mb-2">📍 India - Andhra Pradesh</p>
          <p className="text-xs md:text-sm">&copy; 2026 Skill-Route. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      {activeModal && !['terms'].includes(activeModal) && (
        <div className="landing-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="landing-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="landing-modal-header">
              <h3 className="font-heading font-bold text-base md:text-lg">
                {activities.find(a => a.id === activeModal)?.title}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-xl text-muted-foreground hover:text-foreground">×</button>
            </div>
            <div className="landing-modal-body">
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                {activities.find(a => a.id === activeModal)?.description}
              </p>
              <button onClick={() => setActiveModal(null)} className="landing-btn-primary text-sm">Watch Demo</button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="landing-modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="landing-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '760px' }}>
            <div className="landing-modal-header">
              <h3 className="font-heading font-bold text-lg md:text-xl">Terms & Conditions</h3>
              <button onClick={() => setShowTerms(false)} className="text-xl text-muted-foreground hover:text-foreground">×</button>
            </div>
            <div className="landing-modal-body">
              <div className="text-sm text-muted-foreground space-y-3 max-h-72 overflow-y-auto mb-6">
                <p><strong>One-time Payment:</strong> Premium subscription is available through one-time payment only.</p>
                <p><strong>Non-Refundable:</strong> All payments are final and non-refundable. Please review your selection carefully.</p>
                <p><strong>Payment Confirmation:</strong> Premium access will be activated immediately after successful payment verification.</p>
                <p><strong>Secure Payment:</strong> All payments are processed securely through Razorpay payment gateway with 256-bit SSL encryption.</p>
                <p><strong>Subscription Period:</strong> Your premium access will be valid for the selected duration (1 month, 3 months, or 1 year).</p>
                <p><strong>Auto-renewal:</strong> Premium subscriptions do not auto-renew. You must manually renew your subscription.</p>
                <p><strong>Cancellation:</strong> You can cancel anytime, but refunds will not be provided for the existing period.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1"
                  />
                  I agree to the Terms & Conditions
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (!agreeToTerms) return;
                      if (pendingPlan) {
                        navigate('/signup', { state: { selectedPlan: pendingPlan } });
                        setPendingPlan(null);
                      }
                      setShowTerms(false);
                    }}
                    className="landing-btn-primary w-full text-center text-base font-bold"
                  >
                    {pendingPlan ? 'Agree & Continue' : 'Agree & Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Features Modal */}
      {showPlanFeatures && (
        <div className="landing-modal-overlay" onClick={() => setShowPlanFeatures(null)}>
          <div className="landing-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="landing-modal-header">
              <h3 className="font-heading font-bold text-lg md:text-xl">
                {showPlanFeatures.tag === 'Free' ? 'Free Plan Features' : showPlanFeatures.tag + ' Plan Features'}
              </h3>
              <button onClick={() => setShowPlanFeatures(null)} className="text-xl text-muted-foreground hover:text-foreground">×</button>
            </div>
            <div className="landing-modal-body">
              <div className="mb-6">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{showPlanFeatures.price}</div>
                <p className="text-sm text-muted-foreground">{showPlanFeatures.duration}</p>
              </div>

              <div className="space-y-3 mb-8">
                {showPlanFeatures.tag === 'Free' ? (
                  <>
                    <div className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">✓</span>
                      <p className="text-sm text-foreground">2 tests - for trial</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">✓</span>
                      <p className="text-sm text-foreground">Basic tests only</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">✓</span>
                      <p className="text-sm text-foreground">Simple AI feedback</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">✓</span>
                      <p className="text-sm text-foreground">Basic streak tracking</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">✓</span>
                      <p className="text-sm text-foreground">Daily 2 tests of all Levels</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">✓</span>
                      <p className="text-sm text-foreground">Advanced test types</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">✓</span>
                      <p className="text-sm text-foreground">Detailed AI analysis & audio</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">✓</span>
                      <p className="text-sm text-foreground">Advanced analytics & Badges</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">✓</span>
                      <p className="text-sm text-foreground">All Levels Access</p>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  handleSelectPlan(showPlanFeatures);
                  setShowPlanFeatures(null);
                }}
                className="landing-btn-primary w-full text-center text-base font-bold"
              >
                Continue to Signup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
