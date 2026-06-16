import ProductCard from '@/components/ui/ProductCard';
import ProductFilters from './ProductFilters';

async function getProducts(searchParams: Record<string, string>) {
  const params = new URLSearchParams(searchParams).toString();
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/products?${params}`, { cache: 'no-store' });
    if (res.ok) return res.json();
  } catch {}
  // Fallback mock data
  return {
    products: [
      { _id: '1', sku: 'EG-2041', name: 'Matte Square Frame', price: { original: 999, selling: 1 }, rating: 4.7, reviewCount: 198, isBestseller: true, frame: { type: 'Square' } },
      { _id: '2', sku: 'EG-1067', name: 'Premium Clubmaster Frame', price: { original: 999, selling: 1 }, rating: 4.5, reviewCount: 143, isBestseller: false, frame: { type: 'Clubmaster' } },
      { _id: '3', sku: 'EG-3012', name: 'Classic Aviator', price: { original: 999, selling: 1 }, rating: 4.8, reviewCount: 312, isBestseller: true, frame: { type: 'Aviator' } },
      { _id: '4', sku: 'EG-4055', name: 'Round Metal Frame', price: { original: 999, selling: 1 }, rating: 4.3, reviewCount: 87, isBestseller: false, frame: { type: 'Round' } },
      { _id: '5', sku: 'EG-5099', name: 'Wayfarer Bold', price: { original: 999, selling: 1 }, rating: 4.6, reviewCount: 201, isBestseller: true, frame: { type: 'Wayfarer' } },
      { _id: '6', sku: 'EG-6011', name: 'Cat Eye Chic', price: { original: 999, selling: 1 }, rating: 4.4, reviewCount: 156, isBestseller: false, frame: { type: 'Cat Eye' } },
    ],
    total: 6,
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { products, total } = await getProducts(params);

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">All Frames</h1>
          <p className="text-[#888] text-sm mt-1">{total || products.length} products found</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className="w-56 flex-shrink-0 hidden md:block">
          <ProductFilters />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-24 text-[#888]">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p: Parameters<typeof ProductCard>[0]['product']) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
