class OrderItem {
  final String? productName;
  final String? color;
  final String? lensType;
  final String? lensQuality;
  final double framePrice;
  final double? lensPrice;
  final double? fittingCharge;
  final int qty;
  final String? productImage;
  final String? sku;

  OrderItem({
    this.productName,
    this.color,
    this.lensType,
    this.lensQuality,
    this.framePrice = 1,
    this.lensPrice,
    this.fittingCharge,
    this.qty = 1,
    this.productImage,
    this.sku,
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
        productImage: json['product'] is Map && json['product']['images'] is List && (json['product']['images'] as List).isNotEmpty ? (json['product']['images'] as List).first.toString() : null,
        sku: json['product'] is Map ? json['product']['sku']?.toString() : null,
      );
}

class OrderAddress {
  final String fullName;
  final String mobile;
  final String line1;
  final String? line2;
  final String city;
  final String state;
  final String pincode;

  OrderAddress({
    required this.fullName,
    required this.mobile,
    required this.line1,
    this.line2,
    required this.city,
    required this.state,
    required this.pincode,
  });

  factory OrderAddress.fromJson(Map<String, dynamic> json) => OrderAddress(
        fullName: json['fullName']?.toString() ?? '',
        mobile: json['mobile']?.toString() ?? '',
        line1: json['line1']?.toString() ?? '',
        line2: json['line2']?.toString(),
        city: json['city']?.toString() ?? '',
        state: json['state']?.toString() ?? '',
        pincode: json['pincode']?.toString() ?? '',
      );
}

class Order {
  final String id;
  final String orderNumber;
  final List<OrderItem> items;
  final String status;
  final double total;
  final double subtotal;
  final double deliveryCharge;
  final double fittingCharge;
  final double discount;
  final double walletUsed;
  final String createdAt;
  final OrderAddress? address;
  final String paymentStatus;
  final String? paymentMethod;
  final String? trackingNumber;
  final String? courierPartner;
  final String? estimatedDelivery;

  Order({
    required this.id,
    required this.orderNumber,
    this.items = const [],
    this.status = 'pending',
    this.total = 0,
    this.subtotal = 0,
    this.deliveryCharge = 99,
    this.fittingCharge = 0,
    this.discount = 0,
    this.walletUsed = 0,
    this.createdAt = '',
    this.address,
    this.paymentStatus = 'pending',
    this.paymentMethod,
    this.trackingNumber,
    this.courierPartner,
    this.estimatedDelivery,
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
        subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0,
        deliveryCharge: (json['deliveryCharge'] as num?)?.toDouble() ?? 99,
        fittingCharge: (json['fittingCharge'] as num?)?.toDouble() ?? 0,
        discount: (json['discount'] as num?)?.toDouble() ?? 0,
        walletUsed: (json['walletUsed'] as num?)?.toDouble() ?? 0,
        createdAt: json['createdAt'] ?? '',
        address: json['address'] != null ? OrderAddress.fromJson(json['address']) : null,
        paymentStatus: json['paymentStatus'] ?? 'pending',
        paymentMethod: json['paymentMethod']?.toString(),
        trackingNumber: json['trackingNumber']?.toString(),
        courierPartner: json['courierPartner']?.toString(),
        estimatedDelivery: json['estimatedDelivery']?.toString(),
      );
}
