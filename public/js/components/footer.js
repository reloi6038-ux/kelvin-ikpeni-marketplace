/**
 * footer.js — injects the site footer.
 */

const FOOTER_HTML = `
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a href="/" class="footer__brand-logo">
            <img src="/images/logo.svg" alt="" style="width:32px;height:32px;border-radius:6px;" />
            Kelvin Ikpeni Marketplace
          </a>
          <p class="footer__brand-desc">
            Nigeria's premium multi-vendor marketplace. Shop authentic products from trusted sellers nationwide with secure payment and fast delivery.
          </p>
          <div class="footer__socials">
            <a href="#" class="footer__social" aria-label="Facebook">f</a>
            <a href="#" class="footer__social" aria-label="Twitter">𝕏</a>
            <a href="#" class="footer__social" aria-label="Instagram">📷</a>
            <a href="#" class="footer__social" aria-label="WhatsApp">💬</a>
          </div>
        </div>

        <div>
          <h4 class="footer__col-title">Shop</h4>
          <div class="footer__links">
            <a href="/pages/products.html">All Products</a>
            <a href="/pages/products.html?sort=popular">Best Sellers</a>
            <a href="/pages/products.html?sort=latest">New Arrivals</a>
            <a href="/pages/products.html?flashSale=true">Flash Sales</a>
            <a href="/pages/products.html?featured=true">Featured</a>
          </div>
        </div>

        <div>
          <h4 class="footer__col-title">Support</h4>
          <div class="footer__links">
            <a href="/pages/help.html">Help Centre</a>
            <a href="/pages/shipping.html">Shipping & Delivery</a>
            <a href="/pages/returns.html">Returns & Refunds</a>
            <a href="/pages/contact.html">Contact Us</a>
            <a href="/pages/track.html">Track Order</a>
          </div>
        </div>

        <div>
          <h4 class="footer__col-title">Sell</h4>
          <div class="footer__links">
            <a href="/pages/seller-register.html">Become a Seller</a>
            <a href="/pages/seller-terms.html">Seller Terms</a>
            <a href="/pages/seller-dashboard.html">Seller Dashboard</a>
            <a href="/pages/seller-guide.html">Seller Guide</a>
          </div>
        </div>

        <div>
          <h4 class="footer__col-title">Company</h4>
          <div class="footer__links">
            <a href="/pages/about.html">About Us</a>
            <a href="/pages/privacy.html">Privacy Policy</a>
            <a href="/pages/terms.html">Terms of Service</a>
            <a href="/pages/contact.html">Contact</a>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <p>© ${new Date().getFullYear()} Kelvin Ikpeni Marketplace. All rights reserved.</p>
        <div class="footer__payments">
          <span class="footer__payment-badge">Paystack</span>
          <span class="footer__payment-badge">Visa</span>
          <span class="footer__payment-badge">Mastercard</span>
          <span class="footer__payment-badge">Verve</span>
          <span class="footer__payment-badge">Bank Transfer</span>
        </div>
      </div>
    </div>
  </footer>

  <button class="back-to-top" id="back-to-top" aria-label="Back to top">↑</button>
`;

const initBackToTop = () => {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) btn?.classList.add('is-visible');
    else btn?.classList.remove('is-visible');
  });
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
};

export const mountFooter = () => {
  const placeholder = document.getElementById('site-footer');
  if (placeholder) {
    placeholder.outerHTML = FOOTER_HTML;
    initBackToTop();
  }
};

export default mountFooter;