class OrderItem {
  final String? productName;
  final String? color;
  final String? lensType;
  final String? lensQuality;
  final double framePrice;
  final double? lensPrice;
  final double? fittingCharge;
  final int qty;

  OrderItem({
    this.productName,
    this.color,
    this.lensType,
    this.lensQuality,
    this.framePrice = 1,
    this.lensPrice,
    this.fittingCharge,
    this.qty = 1,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
        productName: json['product'] is Map ? json['product']['name'] : null,
        color: json['color'],
        lensType: json['lensType'],
        lensQuality: json['lensQuality'],
        framePrice: (json['framePrice'] as num?)?.toDouble() ?? 1,
        lensPrice: (json['lensPrice'] as num?)?.toDouble(),
        fittingCharge: (json['fittingCharge'] as num?)?.toDouble(),
        qty: json['qty'] ?? 1,
      );
}

class Order {
  final String id;
  final String orderNumber;
  final List<OrderItem> items;
  final String status;
  final double total;
  final double deliveryCharge;
  final String createdAt;

  Order({
    required this.id,
    required this.orderNumber,
    this.items = const [],
    this.status = 'pending',
    this.total = 0,
    this.deliveryCharge = 99,
    this.createdAt = '',
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['_id'] ?? json['id'] ?? '',
        orderNumber: json['orderId'] ?? '',
        items: (json['items'] as List<dynamic>?)
                ?.map((i) => OrderItem.fromJson(i))
                .toList() ??
            [],
        status: json['status'] ?? 'pending',
        total: (json['total'] as num?)?.toDouble() ?? 0,
        deliveryCharge: (json['deliveryCharge'] as num?)?.toDouble() ?? 99,
        createdAt: json['createdAt'] ?? '',
      );
}
