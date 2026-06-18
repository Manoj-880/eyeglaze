import SEO from '../components/SEO';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 text-gray-300 space-y-8">
      <SEO title="Terms of Use | EyeGlaze Eyewear" description="Terms of Use and service agreements for EyeGlaze customers." />

      <div className="border-b border-[#2A2A2D] pb-6">
        <h1 className="text-3xl font-serif font-bold text-white tracking-wider uppercase">Terms of Use</h1>
        <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-mono">Last Updated: June 18, 2026</p>
      </div>

      <section className="bg-[#131314] border border-[#2A2A2D] rounded-2xl p-8 space-y-6 shadow-xl leading-relaxed text-sm">
        <div>
          <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">1. Agreement to Terms</h2>
          <p>
            By accessing or using the EyeGlaze Eyewear portal, storefront, and laboratory-verified prescription services, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree, please do not use our services.
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">2. Prescription Authenticity</h2>
          <p>
            When ordering custom prescription lenses, you guarantee that the uploaded prescription information is accurate, up-to-date, and issued by a certified optometrist or ophthalmologist. EyeGlaze reserves the right to request optician verification prior to custom lens milling.
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">3. Accounts & Security</h2>
          <p>
            You are responsible for safeguarding your account details, including your phone numbers, OTP-based login credentials, and default addresses. Any transactions or support inquiries executed under your account are deemed authorized.
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">4. Custom Milling & Returns</h2>
          <p>
            All prescription orders represent personalized, custom-milled optical assets. We offer a 7-day no-questions-asked return policy. In the event of optical misalignment, please contact our certified optometrist panel via Support Tickets.
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">5. Intellectual Property</h2>
          <p>
            All content, brand marks, Italian acetate frame designs, proprietary lens options, sitemaps, and design assets are the exclusive intellectual property of EyeGlaze Eyewear.
          </p>
        </div>
      </section>
    </div>
  );
}
