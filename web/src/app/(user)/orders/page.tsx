import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';

const mockOrders = [
  {
    _id: 'ord1',
    orderId: 'EGO-20260616-0001',
    createdAt: '2026-06-16T10:00:00Z',
    status: 'processing',
    total: 1298,
    items: [{ name: 'Matte Square Frame', sku: 'EG-2041', color: 'Matte Black' }],
  },
  {
    _id: 'ord2',
    orderId: 'EGO-20260610-0002',
    createdAt: '2026-06-10T14:30:00Z',
    status: 'delivered',
    total: 799,
    items: [{ name: 'Classic Aviator', sku: 'EG-3012', color: 'Gold' }],
  },
];

export default async function OrdersPage() {
  let orders = mockOrders;
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/orders`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.orders?.length) orders = data.orders;
    }
  } catch {}

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
          <p className="text-[#888] mb-6">Start shopping to place your first order</p>
          <Link href="/products" className="bg-[#C9A84C] text-black font-bold uppercase py-3 px-8 rounded-xl hover:opacity-90 transition-opacity">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#C9A84C]/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-bold">{order.orderId}</div>
                  <div className="text-[#888] text-xs mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-[#C9A84C] font-bold">₹{order.total}</span>
                </div>
              </div>

              <div className="border-t border-[#2A2A2A] pt-3 space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#222] rounded-lg flex items-center justify-center">
                      <span className="text-lg">👓</span>
                    </div>
                    <div>
                      <div className="text-white text-sm">{item.name}</div>
                      <div className="text-[#888] text-xs">{item.sku} · {item.color}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-3">
                <Link href={`/orders/${order._id}`} className="text-[#C9A84C] text-sm hover:underline">View Details</Link>
                {order.status === 'shipped' && (
                  <Link href={`/track/${order._id}`} className="text-[#C9A84C] text-sm hover:underline">Track Order</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
