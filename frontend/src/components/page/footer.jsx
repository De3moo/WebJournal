import '../../styles/Footer.css';
function Footer() {
    return (
        <footer className="site-footer">
           <div className="site-footer-inner">

                {/* ── Brand row ── */}
                    <div className="footer-column">
                        <div className="footer-column">
                            <div className="footer-brand">
                                <span className="footer-logo">📓</span>
                                <span className="footer-brand-name">Web Journal</span>
                            </div>
                            <span className="footer-tagline">
        Your private space to write, reflect, and remember.
    </span>

                            <div className="footer-col">
                                <h4>About</h4>
                                <p>
                                    Web Journal is a secure personal journaling app. Write daily entries,
                                    attach images, and track your thoughts over time all stored safely
                                    in the cloud.
                                </p>
                            </div>
                        </div>
                    </div>





            </div>
        </footer>
    );
}

export default Footer;