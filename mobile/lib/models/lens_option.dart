class LensOption {
  final String id;
  final String kind; // 'single_vision', 'progressive', etc.
  final String? lensType;
  final String? subType;
  final String? qualityTier;
  final String name;
  final double price;
  final List<String> features;
  final bool isRecommended;
  final String? description;
  final String? badge;

  LensOption({
    required this.id,
    required this.kind,
    this.lensType,
    this.subType,
    this.qualityTier,
    required this.name,
    required this.price,
    this.features = const [],
    this.isRecommended = false,
    this.description,
    this.badge,
  });

  factory LensOption.fromJson(Map<String, dynamic> json) => LensOption(
        id: json['_id'] ?? json['id'] ?? '',
        kind: json['type'] ?? '',
        lensType: json['type'],
        subType: json['subType'],
        qualityTier: json['subType'],
        name: json['displayName'] ?? json['name'] ?? '',
        price: (json['price'] as num?)?.toDouble() ?? 0,
        features: List<String>.from(json['features'] ?? []),
        isRecommended: json['badge'] == 'RECOMMENDED',
        description: json['description'],
        badge: json['badge'],
      );
}
