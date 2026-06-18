import SEO from '../components/SEO';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 text-gray-300 space-y-8">
      <SEO title="Privacy Policy | EyeGlaze Eyewear" description="Privacy policy regarding user account and optical medical data." />

      <div className="border-b border-[#2A2A2D] pb-6">
        <h1 className="text-3xl font-serif font-bold text-white tracking-wider uppercase">Privacy Policy</h1>
        <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-mono">Last Updated: June 18, 2026</p>
      </div>

      <section className="bg-[#131314] border border-[#2A2A2D] rounded-2xl p-8 space-y-6 shadow-xl leading-relaxed text-sm">
        <div>
          <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">1. Information We Collect</h2>
          <p>
            We collect personal details (such as name, email, shipping addresses, and phone numbers) to register accounts and dispatch orders. Additionally, we store prescription parameters (Sph, Cyl, Axis, PD) and prescription images to mill your custom lenses.
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">2. Optical Data Protection</h2>
          <p>
            Your optical prescription details are treated as sensitive medical data. Access is restricted to our certified optics lab staff and the optometrist panel. We do not sell or lease your health parameters to third-party networks.
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">3. Geolocation Data</h2>
          <p>
            To provide autofill functionality for saved addresses, our system requests access to your browser location API. This data is processed on-device and is only stored in MongoDB when you explicitly click "Save Address".
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">4. Authentication Security</h2>
          <p>
            We secure accounts using JWT credentials stored in secure HTTP-only cookies and OTP codes for secure telephone registration. Secure payment tokens are handled exclusively by verified gateway providers.
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">5. Your Privacy Rights</h2>
          <p>
            You have the right to request deletion of your account and related files. You may edit your saved addresses, delete transaction history logs, or update your profile data at any time from your account panel.
          </p>
        </div>
      </section>
    </div>
  );
}
