import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import BrandIcon from '../components/BrandIcon';
import api from '../lib/api';
import { socket } from '../lib/socket';

export default function UserLayout() {
  const { user, cartCount, wishlist, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  const hoverTimeoutRef = useRef<any>(null);

  // Fetch products on mount and setup socket listener
  useEffect(() => {
    const fetchProductsForPrices = async () => {
      try {
        const res = await api.get('/products?limit=1000');
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Failed to fetch products for navbar pricing:', err);
      }
    };
    fetchProductsForPrices();

    const handleProductChange = () => {
      fetchProductsForPrices();
    };

    socket.on('product_changed', handleProductChange);
    return () => {
      socket.off('product_changed', handleProductChange);
    };
  }, []);

  const getDynamicBrandsAndPrice = (
    categorySlug: string,
    genderVal: string | null,
    tier: 'premium' | 'classic' | 'essential',
    fallbackPrice: number
  ) => {
    const matchingProds = products.filter(p => {
      // check category
      const pCat = (p.category || '').toLowerCase();
      const pCats = (p.categories || []).map((c: any) => String(c).toLowerCase());
      const catMatch = pCat === categorySlug.toLowerCase() || pCats.includes(categorySlug.toLowerCase());
      if (!catMatch) return false;

      // check gender
      if (genderVal && genderVal !== 'all') {
        let genderMatch = false;
        if (p.gender) {
          if (Array.isArray(p.gender)) {
            genderMatch = p.gender.some((g: string) => g.toLowerCase() === genderVal.toLowerCase() || g.toLowerCase() === 'unisex');
          } else {
            genderMatch = p.gender.toLowerCase() === genderVal.toLowerCase() || p.gender.toLowerCase() === 'unisex';
          }
        } else {
          genderMatch = genderVal.toLowerCase() === 'unisex';
        }
        if (!genderMatch) return false;
      }

      // check price tier
      const price = p.price?.selling || p.sellingPrice || fallbackPrice;
      if (tier === 'premium') return price >= 2000;
      if (tier === 'classic') return price >= 1000 && price < 2000;
      return price < 1000; // essential
    });

    const labelMap = {
      premium: 'EyeGlaze Premium',
      classic: 'EyeGlaze Classic',
      essential: 'EyeGlaze Essential'
    };

    const buildToUrl = () => {
      let url = `/products?category=${categorySlug}`;
      if (genderVal && genderVal !== 'all') url += `&gender=${genderVal}`;
      url += `&brand=eyeglaze`;
      if (tier === 'premium') url += `&minPrice=2000`;
      else if (tier === 'classic') url += `&minPrice=1000&maxPrice=1999`;
      else if (tier === 'essential') url += `&maxPrice=999`;
      return url;
    };

    const url = buildToUrl();

    if (matchingProds.length === 0) {
      return {
        label: labelMap[tier],
        price: `Starts at ₹${fallbackPrice}`,
        to: url
      };
    }

    const firstProd = matchingProds[0];
    const prodPrice = firstProd.price?.selling || firstProd.sellingPrice || fallbackPrice;

    return {
      label: firstProd.name,
      price: `₹${prodPrice}`,
      to: `/products/${firstProd._id}`
    };
  };

  const getDynamicSizeAndPrice = (
    categorySlug: string,
    genderVal: string,
    sizeLabel: string,
    sizeVal: 'Small' | 'Medium' | 'Large',
    fallbackPrice: number
  ) => {
    const matchingProds = products.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      const pCats = (p.categories || []).map((c: any) => String(c).toLowerCase());
      const catMatch = pCat === categorySlug.toLowerCase() || pCats.includes(categorySlug.toLowerCase());
      if (!catMatch) return false;

      let genderMatch = false;
      if (p.gender) {
        if (Array.isArray(p.gender)) {
          genderMatch = p.gender.some((g: string) => g.toLowerCase() === genderVal.toLowerCase());
        } else {
          genderMatch = p.gender.toLowerCase() === genderVal.toLowerCase();
        }
      }
      if (!genderMatch) return false;

      const pSize = (p.frameSize || '').toLowerCase();
      const pSizes = (p.availableSizes || []).map((s: string) => s.toLowerCase());
      return pSize === sizeVal.toLowerCase() || pSizes.includes(sizeVal.toLowerCase());
    });

    if (matchingProds.length === 0) {
      return {
        label: sizeLabel,
        price: `Starts at ₹${fallbackPrice}`,
        to: `/products?category=${categorySlug}&gender=${genderVal}&size=${sizeVal}`
      };
    }

    const minPrice = Math.min(...matchingProds.map(p => p.price?.selling || p.sellingPrice || fallbackPrice));

    return {
      label: sizeLabel,
      price: `Starts at ₹${minPrice}`,
      to: `/products?category=${categorySlug}&gender=${genderVal}&size=${sizeVal}`
    };
  };

  const getDynamicCategoryPrice = (categorySlug: string, fallbackPrice: number) => {
    const matchingProds = products.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      const pCats = (p.categories || []).map((c: any) => String(c).toLowerCase());
      return pCat === categorySlug.toLowerCase() || pCats.includes(categorySlug.toLowerCase());
    });

    if (matchingProds.length === 0) return `Starts at ₹${fallbackPrice}`;

    const minPrice = Math.min(...matchingProds.map(p => p.price?.selling || p.sellingPrice || fallbackPrice));
    return `Starts at ₹${minPrice}`;
  };

  // Fetch navigation categories on mount
  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories/tree');
        if (!active) return;
        setCategories(res.data.tree || []);
      } catch (err) {
        console.error('Failed to fetch navbar categories:', err);
        // Fallback default structure
        if (!active) return;
        setCategories([
          {
            id: 'default-eye',
            name: 'Eyeglasses',
            slug: 'prescription',
            icon: '👓',
            children: [
              { name: 'Men', slug: 'men' },
              { name: 'Women', slug: 'women' },
              { name: 'Kids', slug: 'kids' },
            ]
          },
          {
            id: 'default-sun',
            name: 'Sunglasses',
            slug: 'sunglasses',
            icon: '🕶️',
            children: [
              { name: 'Men', slug: 'men' },
              { name: 'Women', slug: 'women' },
              { name: 'Kids', slug: 'kids' },
            ]
          }
        ]);
      }
    };
    fetchCategories();

    const handleCategoryChange = () => {
      fetchCategories();
    };

    socket.on('category_changed', handleCategoryChange);

    return () => {
      active = false;
      socket.off('category_changed', handleCategoryChange);
    };
  }, []);

  const handleMouseEnter = (menuId: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveHover(menuId);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveHover(null);
    }, 200);
  };

  const handleMegaMenuMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleMegaMenuMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveHover(null);
    }, 200);
  };


  const renderMegaMenu = () => {
    if (!activeHover) return null;

    const isEyeglasses = activeHover === 'prescription' || activeHover === 'eyeglasses';
    const isSunglasses = activeHover === 'sunglasses';
    const isContacts = activeHover === 'contact-lenses' || activeHover === 'contact_lenses' || activeHover === 'contact';
    const isComputer = activeHover === 'computer-glasses' || activeHover === 'blue_light' || activeHover === 'blue-light';

    if (!isEyeglasses && !isSunglasses && !isContacts && !isComputer) {
      const dynamicCat = categories.find(c => c.slug === activeHover);
      if (!dynamicCat || !dynamicCat.children || dynamicCat.children.length === 0) {
        return null;
      }
      
      return (
        <div 
          className="absolute top-full left-0 right-0 bg-[#0E0E0F]/98 border-t border-b border-[#2A2A2D] shadow-2xl z-50 animate-fade-in"
          onMouseEnter={handleMegaMenuMouseEnter}
          onMouseLeave={handleMegaMenuMouseLeave}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {dynamicCat.children.map((sub: any) => (
                <div key={sub.id || sub.slug} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 hover:border-[#D4A04D]/40 transition-all duration-300 flex flex-col justify-between group/card">
                  <div>
                    <h3 className="text-white text-sm font-black tracking-wide uppercase">{sub.name}</h3>
                    <span className="inline-block mt-1 text-[8px] font-extrabold uppercase bg-zinc-800 text-gray-400 px-2 py-0.5 rounded-full tracking-wider">
                      Explore Collection
                    </span>
                    
                    <div className="mt-4 space-y-2">
                      <Link 
                        to={`/products?category=${dynamicCat.slug}&shape=${sub.name}&gender=men`}
                        className="flex items-center justify-between text-xs font-semibold text-gray-400 hover:text-[#D4A04D] transition-colors"
                      >
                        <span>Men's {sub.name}</span>
                        <span className="text-[10px] transform group-hover/card:translate-x-1 transition-transform">→</span>
                      </Link>
                      <Link 
                        to={`/products?category=${dynamicCat.slug}&shape=${sub.name}&gender=women`}
                        className="flex items-center justify-between text-xs font-semibold text-gray-400 hover:text-[#D4A04D] transition-colors"
                      >
                        <span>Women's {sub.name}</span>
                        <span className="text-[10px] transform group-hover/card:translate-x-1 transition-transform">→</span>
                      </Link>
                      <Link 
                        to={`/products?category=${dynamicCat.slug}&shape=${sub.name}`}
                        className="flex items-center justify-between text-xs font-semibold text-gray-400 hover:text-[#D4A04D] transition-colors"
                      >
                        <span>View All {sub.name}</span>
                        <span className="text-[10px] transform group-hover/card:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {dynamicCat.bannerImage ? (
                <div className="md:col-span-2 relative overflow-hidden rounded-2xl border border-zinc-800 group/promo h-48 md:h-full min-h-[160px] bg-cover bg-center" style={{ backgroundImage: `url(${dynamicCat.bannerImage})` }}>
                  <div className="absolute inset-0 bg-black/60 group-hover/promo:bg-black/50 transition-colors duration-300" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h4 className="text-white text-lg font-black uppercase tracking-wider">{dynamicCat.name}</h4>
                    <p className="text-gray-300 text-xs mt-1 max-w-[280px] line-clamp-2">{dynamicCat.description || 'Premium designer frames'}</p>
                    <Link 
                      to={`/products?category=${dynamicCat.slug}`}
                      className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase bg-[#D4A04D] hover:bg-[#C8923E] text-black py-2 px-4 rounded-lg tracking-wider transition-colors w-fit"
                    >
                      Shop Collection
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="md:col-span-2 relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-[#1c1c1e] to-[#0c0c0d] p-6 flex flex-col justify-center items-center text-center">
                  <span className="text-2xl mb-2">✨</span>
                  <h4 className="text-[#D4A04D] text-xs font-black uppercase tracking-widest">Premium Selection</h4>
                  <p className="text-gray-500 text-[10px] mt-1 max-w-[200px]">Handcrafted premium quality prescription glasses and custom sunglasses.</p>
                  <Link to={`/products?category=${dynamicCat.slug}`} className="mt-3 text-[10px] font-black uppercase border border-zinc-700 hover:border-[#D4A04D] hover:text-[#D4A04D] transition-colors py-1.5 px-3 rounded-lg">
                    Discover More
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    let columns: any[] = [];
    if (isEyeglasses) {
      columns = [
        {
          title: 'MEN Eyeglasses',
          badge: 'with FREE lenses',
          image: '/images/men_eyeglasses.png',
          items: [
            getDynamicBrandsAndPrice('prescription', 'men', 'premium', 3000),
            getDynamicBrandsAndPrice('prescription', 'men', 'classic', 1500),
            getDynamicBrandsAndPrice('prescription', 'men', 'essential', 500),
          ]
        },
        {
          title: 'WOMEN Eyeglasses',
          badge: 'with FREE lenses',
          image: '/images/women_eyeglasses.png',
          items: [
            getDynamicBrandsAndPrice('prescription', 'women', 'premium', 3000),
            getDynamicBrandsAndPrice('prescription', 'women', 'classic', 1500),
            getDynamicBrandsAndPrice('prescription', 'women', 'essential', 500),
          ]
        },
        {
          title: 'KIDS Eyeglasses',
          badge: 'with FREE lenses',
          image: '/images/kids_eyeglasses.png',
          items: [
            getDynamicSizeAndPrice('prescription', 'kids', 'Juniors | 5 to 8 years', 'Small', 800),
            getDynamicSizeAndPrice('prescription', 'kids', 'Tweens | 8 to 12 years', 'Medium', 500),
            getDynamicSizeAndPrice('prescription', 'kids', 'Teens | 12 to 17 years', 'Large', 1500),
          ]
        }
      ];
    } else if (isSunglasses) {
      columns = [
        {
          title: 'MEN Sunglasses',
          badge: 'Polarized with UV',
          image: '/images/men_sunglasses.png',
          items: [
            getDynamicBrandsAndPrice('sunglasses', 'men', 'premium', 3000),
            getDynamicBrandsAndPrice('sunglasses', 'men', 'classic', 1000),
            getDynamicBrandsAndPrice('sunglasses', 'men', 'essential', 1000),
          ]
        },
        {
          title: 'WOMEN Sunglasses',
          badge: 'Polarized with UV',
          image: '/images/women_sunglasses.png',
          items: [
            getDynamicBrandsAndPrice('sunglasses', 'women', 'premium', 3000),
            getDynamicBrandsAndPrice('sunglasses', 'women', 'classic', 1000),
            getDynamicBrandsAndPrice('sunglasses', 'women', 'essential', 1000),
          ]
        },
        {
          title: 'KIDS Sunglasses',
          badge: 'Polarized with UV',
          image: '/images/kids_sunglasses.png',
          items: [
            getDynamicSizeAndPrice('sunglasses', 'kids', 'Juniors | 5 to 8 years', 'Small', 600),
            getDynamicSizeAndPrice('sunglasses', 'kids', 'Tweens | 8 to 12 years', 'Medium', 600),
            getDynamicSizeAndPrice('sunglasses', 'kids', 'Teens | 12 to 17 years', 'Large', 1000),
          ]
        }
      ];
    } else if (isContacts) {
      columns = [
        {
          title: 'CLEAR Contacts',
          badge: '10% OFF with Gold',
          image: '/images/cat_contacts.png',
          items: [
            { label: 'Distance power (-ve)', price: getDynamicCategoryPrice('contact_lenses', 249), to: '/products?category=contact_lenses&subCategory=clear-contacts' },
            { label: 'Toric/Cylindrical', price: getDynamicCategoryPrice('contact_lenses', 349), to: '/products?category=contact_lenses&subCategory=clear-contacts' },
            { label: 'Multi-Focal', price: getDynamicCategoryPrice('contact_lenses', 2000), to: '/products?category=contact_lenses&subCategory=clear-contacts' },
          ]
        },
        {
          title: 'COLOR Contacts',
          badge: '10% OFF with Gold',
          image: '/images/cat_contacts.png',
          items: [
            { label: 'Zero Power', price: getDynamicCategoryPrice('contact_lenses', 179), to: '/products?category=contact_lenses&subCategory=color-contacts' },
            { label: 'With Power', price: getDynamicCategoryPrice('contact_lenses', 199), to: '/products?category=contact_lenses&subCategory=color-contacts' },
            { label: 'Color Combos', price: 'Buy 4, Pay for 3!', to: '/products?category=contact_lenses&subCategory=color-contacts' },
          ]
        },
        {
          title: 'Solution & Accessories',
          badge: '10% OFF with Gold',
          image: '/images/accessories.png',
          items: [
            { label: 'Solution', price: getDynamicCategoryPrice('contact_lenses', 149), to: '/products?category=contact_lenses&subCategory=solutions-accessories' },
            { label: 'Accessories', price: getDynamicCategoryPrice('contact_lenses', 159), to: '/products?category=contact_lenses&subCategory=solutions-accessories' },
          ]
        }
      ];
    } else if (isComputer) {
      columns = [
        {
          title: 'Computer Glasses',
          badge: 'Anti-Glare Screen',
          image: '/images/cat_blue_light.png',
          items: [
            getDynamicBrandsAndPrice('blue_light', 'all', 'premium', 1999),
            getDynamicBrandsAndPrice('blue_light', 'all', 'classic', 999),
            getDynamicBrandsAndPrice('blue_light', 'all', 'essential', 799),
          ]
        },
        {
          title: 'Reading Glasses',
          badge: 'Ready-to-Wear Power',
          image: '/images/reading_book.png',
          items: [
            getDynamicBrandsAndPrice('reading-glasses', 'all', 'premium', 1499),
            getDynamicBrandsAndPrice('reading-glasses', 'all', 'classic', 499),
            getDynamicBrandsAndPrice('reading-glasses', 'all', 'essential', 299),
          ]
        },
        {
          title: 'Power Sunglasses',
          badge: 'Prescription Sun',
          image: '/images/cat_sunglasses.png',
          items: [
            { label: 'Classic Aviators', price: getDynamicCategoryPrice('power-sunglasses', 1999), to: '/products?category=power-sunglasses' },
            { label: 'Modern Wayfarers', price: getDynamicCategoryPrice('power-sunglasses', 1499), to: '/products?category=power-sunglasses' },
            { label: 'Cat-Eye Specials', price: getDynamicCategoryPrice('power-sunglasses', 1799), to: '/products?category=power-sunglasses' },
          ]
        }
      ];
    }

    return (
      <div 
        className="absolute top-full left-0 right-0 bg-[#0E0E0F]/98 border-t border-b border-[#2A2A2D] shadow-2xl z-50 animate-fade-in"
        onMouseEnter={handleMegaMenuMouseEnter}
        onMouseLeave={handleMegaMenuMouseLeave}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col, cIdx) => (
              <div key={cIdx} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 hover:border-[#D4A04D]/40 transition-all duration-300 flex flex-col justify-between group/card relative overflow-hidden">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="pr-12">
                      <h3 className="text-white text-sm font-black tracking-wide uppercase">{col.title}</h3>
                      <span className="inline-block mt-1 text-[8px] font-extrabold uppercase bg-[#D4A04D]/10 text-[#D4A04D] px-2 py-0.5 rounded-full tracking-wider">
                        {col.badge}
                      </span>
                    </div>
                    {col.image && (
                      <img 
                        src={col.image} 
                        alt={col.title} 
                        className="w-16 h-16 object-cover rounded-full border border-[#D4A04D]/25 bg-zinc-800/80 -mt-2 -mr-2 shrink-0 shadow-lg"
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    {col.items.map((item: any, iIdx: number) => (
                      <Link
                        key={iIdx}
                        to={item.to}
                        className="flex items-center justify-between text-xs font-semibold text-gray-400 hover:text-white transition-colors group/item"
                      >
                        <div className="flex flex-col">
                          <span className="text-gray-300 font-bold group-hover/item:text-[#D4A04D] transition-colors">{item.label}</span>
                          <span className="text-[10px] text-gray-500 mt-0.5">{item.price}</span>
                        </div>
                        <span className="text-[10px] transform group-hover/item:translate-x-1 transition-transform text-gray-400 group-hover/item:text-[#D4A04D] font-bold">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };



  // Close menus when route/pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll on mobile when menus are open
  useEffect(() => {
    const isMobile = window.innerWidth < 1280;
    if (isMobile && (isProfileDropdownOpen || isMobileMenuOpen)) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isProfileDropdownOpen, isMobileMenuOpen]);

  const ADMIN_ROLES = ['admin', 'store_manager', 'support_agent'];
  if (user && ADMIN_ROLES.includes(user.role || '')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Check if we are on the product detail route (e.g. /products/:id), cart page, wishlist, or login/auth pages
  const isCartPage = location.pathname === '/cart';
  const isAuthPage = [
    '/login',
    '/login/otp',
    '/forgot-password',
    '/reset-password'
  ].includes(location.pathname);
  const hideRightIconsOnMobile = isCartPage || isAuthPage;
  
  const isCustomerPage = [
    '/orders',
    '/membership',
    '/profile',
    '/saved-powers',
    '/payments',
    '/wallet',
    '/support/questions',
    '/support/contact',
    '/about-eyeglaze',
    '/rate-us',
    '/account'
  ].some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-[#0B0B0C] w-full overflow-x-clip">
      {!isCustomerPage && (
        <header className="bg-[#0B0B0C]/95 backdrop-blur-md border-b border-[#2A2A2D] fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 md:px-12 lg:px-16 relative z-10">
            {/* Mobile / Tablet Left Menu and Back Actions */}
            <div className="flex items-center gap-1.5 xl:hidden">
              {location.pathname !== '/' && (
                <button 
                  onClick={() => navigate(-1)} 
                  className="text-gray-400 hover:text-white p-1 focus:outline-none transition-colors cursor-pointer bg-transparent border-none"
                  aria-label="Go Back"
                >
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Desktop Left Tagline (FREE SHIPPING • 7-DAY RETURNS) */}
            <div className="hidden xl:flex items-center gap-1.5 text-[9px] text-gray-500 tracking-widest uppercase font-bold select-none">
              <span>Free Shipping</span>
              <span className="w-1 h-1 bg-[#D4A04D] rounded-full" />
              <span>7-Day Returns</span>
            </div>

            {/* Logo - Centered on both Mobile and Desktop */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center select-none text-center">
              <span className="text-[#D4A04D] font-serif text-xl md:text-2xl tracking-[0.25em] uppercase font-bold leading-none">EYEGLAZE</span>
              <span className="text-[#D4A04D]/80 font-sans text-[8px] md:text-[9px] tracking-[0.4em] uppercase mt-0.5">EYEWEAR</span>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-3.5 md:gap-6 z-10">
              {/* Search Icon (for smaller screens) */}
              {location.pathname !== '/' && (
                <button 
                  onClick={() => {
                    if (location.pathname === '/products') {
                      document.getElementById('search-input')?.focus();
                    } else {
                      navigate('/products');
                    }
                  }}
                  className="hidden xl:block text-gray-400 hover:text-[#D4A04D] transition-colors cursor-pointer bg-transparent border-none"
                  title="Search"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}

              {/* Wishlist Icon */}
              {location.pathname !== '/' && (
                <Link 
                  to="/wishlist" 
                  className="hidden xl:block text-gray-400 hover:text-[#D4A04D] transition-colors relative cursor-pointer" 
                  title="Wishlist"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlist && wishlist.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#D4A04D] text-black font-extrabold text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-[#0B0B0C]">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart Icon with Badge */}
              <Link 
                to="/cart" 
                className={`${hideRightIconsOnMobile ? 'hidden' : 'block'} text-gray-400 hover:text-[#D4A04D] transition-colors relative cursor-pointer`} 
                title="Shopping Cart"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#D4A04D] text-black font-extrabold text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-[#0B0B0C]">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile / Login Button & Dropdown */}
              {user ? (
                <div className="relative">
                  {/* Desktop Trigger */}
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="hidden xl:flex items-center gap-2 bg-[#131314] border border-[#2A2A2D] hover:border-[#D4A04D]/50 rounded-full py-1 px-2.5 transition-colors text-[10px] font-bold text-white cursor-pointer focus:outline-none"
                    title="Account"
                  >
                    <div className="w-4 h-4 bg-[#D4A04D] text-black font-extrabold rounded-full flex items-center justify-center text-[8px] uppercase">
                      {user.name ? user.name[0] : 'U'}
                    </div>
                    <span className="max-w-[80px] truncate">{user.name || 'Account'}</span>
                    <svg 
                      className={`w-2.5 h-2.5 text-gray-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Mobile Trigger */}
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`${hideRightIconsOnMobile ? 'hidden' : 'xl:hidden'} w-9 h-9 rounded-full border border-zinc-700/60 flex items-center justify-center text-gray-300 hover:text-[#D4A04D] transition-colors cursor-pointer bg-transparent focus:outline-none`}
                    title="Profile"
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>

                  {isProfileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileDropdownOpen(false)} />
                      <div className="absolute right-0 mt-3 w-52 max-h-[85vh] overflow-y-auto overscroll-y-contain bg-[#0F0F10]/95 backdrop-blur-md border border-[#D4A04D]/25 rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.6),_0_0_20px_rgba(212,160,77,0.05)] z-50 animate-fade-in scrollbar-none">
                        {/* Dropdown Header */}
                        <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#2A2A2D] select-none">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#D4A04D] to-[#8b6524] text-black font-serif font-black rounded-full flex items-center justify-center text-xs uppercase shadow-[0_0_10px_rgba(212,160,77,0.15)]">
                            {user.name ? user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-white text-xs font-black truncate">{user.name || 'Customer'}</div>
                            <div className="text-gray-500 text-[10px] truncate mt-0.5">{user.email || ''}</div>
                            {user.membershipActive && (
                              <div className="inline-flex items-center gap-0.5 text-[9px] text-[#D4A04D] font-extrabold uppercase mt-1">
                                <BrandIcon name="👑" className="w-3 h-3 text-[#D4A04D]" /> Gold Member
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Dropdown Navigation */}
                        <nav className="mt-2 space-y-0.5">
                          {[
                            { href: '/profile', label: 'My Profile', icon: '👤' },
                            { href: '/saved-powers', label: 'Saved Powers', icon: '👓' },
                            { href: '/orders', label: 'My Orders', icon: '📦' },
                            { href: '/wishlist', label: 'My Wishlist', icon: '❤️' },
                            { href: '/membership', label: 'Gold Membership', icon: '👑' },
                            { href: '/payments', label: 'Payment History', icon: '💳' },
                            { href: '/wallet', label: 'My Wallet', icon: '👛' },
                          ].map(({ href, label, icon }) => (
                            <Link
                              key={href}
                              to={href}
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:bg-[#131314] hover:text-white transition-colors"
                            >
                              <BrandIcon name={icon} className="w-3.5 h-3.5 text-[#D4A04D]" />
                              <span>{label}</span>
                            </Link>
                          ))}
                        </nav>

                        {/* Dropdown Footer / Logout */}
                        <div className="mt-2 pt-2 border-t border-[#2A2A2D]">
                          <button
                            onClick={async () => {
                              setIsProfileDropdownOpen(false);
                              await logout();
                              navigate('/');
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left text-xs font-bold text-red-400 hover:bg-red-500/5 hover:text-red-300 transition-colors bg-transparent border-none cursor-pointer"
                          >
                            <BrandIcon name="🚪" className="w-3.5 h-3.5 text-[#D4A04D]" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="hidden xl:block bg-[#D4A04D] hover:bg-[#C8923E] text-black font-extrabold text-[9px] uppercase py-2 px-3.5 rounded-lg tracking-wider transition-colors cursor-pointer"
                  >
                    Login/Signup
                  </Link>
                  <Link 
                    to="/login" 
                    className={`${hideRightIconsOnMobile ? 'hidden' : 'xl:hidden'} w-9 h-9 rounded-full border border-zinc-700/60 flex items-center justify-center text-gray-300 hover:text-[#D4A04D] transition-colors cursor-pointer`}
                    title="Login"
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Desktop Categories Navigation Bar */}
          <div className="hidden xl:flex w-full px-4 sm:px-6 md:px-12 lg:px-16 h-12 border-t border-[#2A2A2D]/40 items-center justify-between select-none">
            <nav className="flex items-center gap-7 h-full text-[10px] xl:text-[11px] font-black uppercase tracking-[0.15em] text-white">
              {categories.map((cat: any) => (
                <div 
                  key={cat.id || cat.slug}
                  onMouseEnter={() => handleMouseEnter(cat.slug)}
                  onMouseLeave={handleMouseLeave}
                  className="h-full flex items-center relative cursor-pointer"
                >
                  <Link 
                    to={`/products?category=${cat.slug}`}
                    className="hover:text-[#D4A04D] transition-colors py-3 border-b-2 border-transparent hover:border-[#D4A04D]"
                  >
                    {cat.name}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* Mega Menu Overlay */}
          {renderMegaMenu()}
        </header>
      )}

      {/* Mobile Menu Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-start xl:hidden">
          {/* Overlay */}
          <div onClick={() => setIsMobileMenuOpen(false)} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          
          {/* Sidebar Panel */}
          <div className="relative w-64 bg-[#0E0E0E] h-full shadow-2xl border-r border-[#2A2A2D] flex flex-col z-50 animate-fade-in p-6">
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="flex flex-col select-none" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="text-[#D4A04D] font-serif text-lg tracking-[0.2em] uppercase font-bold">EYEGLAZE</span>
                <span className="text-[#D4A04D]/80 font-sans text-[7px] tracking-[0.3em] uppercase mt-0.5">EYEWEAR</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white p-1 cursor-pointer">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l18 18" />
                </svg>
              </button>
            </div>

            {/* Mobile Categories Menu */}
            <div className="mt-4 space-y-3">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1 select-none">
                Categories
              </div>
              <nav className="flex flex-col gap-2">
                {categories.map((cat: any) => (
                  <Link
                    key={cat.id || cat.slug}
                    to={`/products?category=${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-gray-400 hover:text-[#D4A04D] text-xs font-semibold py-1 transition-colors px-1"
                  >
                    <span className="text-sm">{cat.icon || '👓'}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
                {/* Removed Stores & Try @ Home Links */}
              </nav>
            </div>

            {/* Mobile Drawer "My Space" (if user logged in) */}
            {user && (
              <div className="mt-6 space-y-3">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1 select-none">
                  My Space
                </div>
                <nav className="flex flex-col gap-2">
                  {[
                    { href: '/profile', label: 'My Profile', icon: '👤' },
                    { href: '/saved-powers', label: 'Saved Powers', icon: '👓' },
                    { href: '/orders', label: 'My Orders', icon: '📦' },
                    { href: '/wishlist', label: 'My Wishlist', icon: '❤️' },
                    { href: '/membership', label: 'Gold Membership', icon: '👑' },
                    { href: '/payments', label: 'Payment History', icon: '💳' },
                    { href: '/wallet', label: 'My Wallet', icon: '👛' },
                  ].map(({ href, label, icon }) => (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-400 hover:text-[#D4A04D] text-xs font-semibold py-1.5 transition-colors px-1"
                    >
                      <BrandIcon name={icon} className="w-4 h-4 text-[#D4A04D]" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}
            
            {/* Account info in Drawer */}
            <div className="mt-auto pt-6 border-t border-[#1C1C1E] flex flex-col gap-4">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#D4A04D] to-[#8b6524] text-black font-extrabold rounded-full flex items-center justify-center text-xs uppercase">
                      {user.name ? user.name[0] : 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-xs font-bold truncate max-w-[100px]">{user.name}</span>
                      {user.membershipActive && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] text-[#D4A04D] font-extrabold uppercase mt-0.5">
                          <BrandIcon name="👑" className="w-2.5 h-2.5 text-[#D4A04D]" /> Gold
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await logout();
                      navigate('/');
                    }}
                    className="text-red-400 hover:text-red-300 text-xs font-bold uppercase transition-colors bg-transparent border-none cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-[#D4A04D] hover:bg-[#C8923E] text-black font-extrabold text-xs uppercase py-3 rounded-lg tracking-wider transition-colors"
                >
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <main className={isCustomerPage ? "w-full min-h-screen" : "w-full px-4 sm:px-6 md:px-12 lg:px-16 py-8 mt-16 xl:mt-28"}>
        <Outlet />
      </main>

      {!isCustomerPage && location.pathname !== '/lens' && location.pathname !== '/checkout' && location.pathname !== '/cart' && <Footer />}
    </div>
  );
}
