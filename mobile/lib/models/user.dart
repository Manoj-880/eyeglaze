class User {
  final String id;
  final String? name;
  final String? phone;
  final String? email;
  final String role;

  User({
    required this.id,
    this.name,
    this.phone,
    this.email,
    this.role = 'user',
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'],
      phone: json['phone'],
      email: json['email'],
      role: json['role'] ?? 'user',
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'name': name,
        'phone': phone,
        'email': email,
        'role': role,
      };
}
