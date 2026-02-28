import '../../styles/LandingPage.css';

function LandingPage({ onGetStarted, onLogin }) {
    return (
        <div className="landing-page">

            {/* ── Navbar ── */}
            <nav className="landing-nav">
                <div className="landing-nav-brand">
                    <span>📓</span>
                    <span>Web Journal</span>
                </div>
                <div className="landing-nav-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>
                </div>
                <div className="landing-nav-actions">
                    <button className="btn-outline" onClick={onLogin}>Sign In</button>
                    <button className="btn-primary" onClick={onGetStarted}>Get Started</button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="landing-hero">
                <p className="hero-badge">✨ Your personal space to write</p>
                <h1>
                    Write Your Story,<br />
                    <span>One Entry at a Time.</span>
                </h1>
                <p className="hero-sub">
                    Web Journal is a simple, private journaling app where you can capture your
                    thoughts, memories, and daily reflections — all in one place, whenever you need it.
                </p>
                <div className="hero-actions">
                    <button className="btn-primary btn-large" onClick={onGetStarted}>
                        Start Journaling — It's Free
                    </button>
                    <button className="btn-outline btn-large" onClick={onLogin}>
                        Sign In
                    </button>
                </div>
            </section>

            {/* ── App Mockup ── */}
            <section className="landing-preview">
                <div className="app-mockup">
                    <div className="mockup-topbar">
                        <span className="dot red"></span>
                        <span className="dot yellow"></span>
                        <span className="dot green-dot"></span>
                        <span className="mockup-url">web-journal.app</span>
                    </div>
                    <div className="mockup-body">
                        <div className="mockup-col mockup-list">
                            <div className="mockup-col-label">My Journals</div>
                            <div className="mockup-item active">
                                <div className="mockup-item-title">A Quiet Morning</div>
                                <div className="mockup-item-date">February 28, 2026</div>
                            </div>
                            <div className="mockup-item">
                                <div className="mockup-item-title">Weekend Trip Notes</div>
                                <div className="mockup-item-date">February 22, 2026</div>
                            </div>
                            <div className="mockup-item">
                                <div className="mockup-item-title">Goals for March</div>
                                <div className="mockup-item-date">February 20, 2026</div>
                            </div>
                        </div>
                        <div className="mockup-col mockup-content">
                            <div className="mockup-entry-date">Friday, February 28, 2026</div>
                            <div className="mockup-entry-title">A Quiet Morning</div>
                            <hr />
                            <div className="mockup-entry-text">
                                Woke up early today before everyone else. Made coffee, sat by the
                                window, and just watched the world wake up. These are the moments
                                I want to remember...
                            </div>
                            <div className="mockup-entry-actions">
                                <span className="mockup-btn-edit">Edit</span>
                                <span className="mockup-btn-delete">Delete</span>
                            </div>
                        </div>
                        <div className="mockup-col mockup-dashboard">
                            <div className="mockup-col-label">Dashboard</div>
                            <div className="mockup-stat"><strong>12</strong>Total Journals</div>
                            <div className="mockup-stat"><strong>5</strong>This Month</div>
                            <div className="mockup-stat"><strong>3</strong>This Week</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="landing-features" id="features">
                <h2>Everything you need to journal</h2>
                <p className="section-sub">Simple tools to help you write more and stress less.</p>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📝</div>
                        <h3>Write Freely</h3>
                        <p>Create and edit entries with a clean, distraction-free experience.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Search Instantly</h3>
                        <p>Find any past entry in seconds by searching titles or content.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Track Your Progress</h3>
                        <p>A built-in dashboard shows how consistently you're writing.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🖼️</div>
                        <h3>Add Images</h3>
                        <p>Attach photos to bring your memories to life alongside your words.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Private & Secure</h3>
                        <p>Your journals belong to you only — no one else can read them.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📅</div>
                        <h3>Organized by Date</h3>
                        <p>Every entry is date-stamped so your story stays in order over time.</p>
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="landing-steps" id="how-it-works">
                <h2>How It Works</h2>
                <p className="section-sub">Get started in under a minute.</p>
                <div className="steps-grid">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3>Create an Account</h3>
                        <p>Sign up with your name, email, and password. No credit card needed.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h3>Write Your First Entry</h3>
                        <p>Hit "Create Journal", give it a title, pick a date, and start writing.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h3>Build Your Story</h3>
                        <p>Come back anytime to search, edit, and reflect on your entries.</p>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="landing-cta">
                <h2>Your thoughts deserve a home.</h2>
                <p>Start writing today — free, private, and always there when you need it.</p>
                <button className="btn-primary btn-large" onClick={onGetStarted}>
                    Create Your Journal
                </button>
            </section>

            {/* ── Footer ── */}
            <footer className="landing-footer">
                <div className="footer-brand">
                    <span>📓</span>
                    <span>Web Journal</span>
                </div>
                <p className="footer-copy">© 2026 Web Journal. All rights reserved.</p>
                <div className="footer-links">
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#">Contact</a>
                </div>
            </footer>

        </div>
    );
}

export default LandingPage;