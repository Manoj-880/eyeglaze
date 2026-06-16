import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../models/cart_item.dart';

class LensWizardState extends ChangeNotifier {
  Product? product;
  String? selectedColor;

  // Step 1
  String? lensType;
  String? lensSubType;

  // Step 2
  PowerData? rightEye;
  PowerData? leftEye;
  double? pd;

  // Step 3
  String? lensQuality;
  double? lensPrice;

  void setProduct(Product p, String color) {
    product = p;
    selectedColor = color;
    notifyListeners();
  }

  void setLensType(String type, {String? subType}) {
    lensType = type;
    lensSubType = subType;
    notifyListeners();
  }

  void setPower({PowerData? re, PowerData? le, double? pupillaryDistance}) {
    rightEye = re;
    leftEye = le;
    pd = pupillaryDistance;
    notifyListeners();
  }

  void setLensQuality(String quality, double price) {
    lensQuality = quality;
    lensPrice = price;
    notifyListeners();
  }

  double get totalPrice {
    double total = 1; // frame
    if (lensPrice != null) total += lensPrice!;
    total += 199; // fitting
    total += 99; // delivery
    return total;
  }

  String get sizeString {
    final f = product?.frame;
    if (f == null) return '';
    return '${f.lensWidth?.toInt() ?? 0}-${f.bridgeWidth?.toInt() ?? 0}-${f.templeLength?.toInt() ?? 0}';
  }

  bool get powerRequired {
    return lensType == 'single_vision' ||
        lensType == 'progressive' ||
        lensType == 'photochromic';
  }

  void reset() {
    product = null;
    selectedColor = null;
    lensType = null;
    lensSubType = null;
    rightEye = null;
    leftEye = null;
    pd = null;
    lensQuality = null;
    lensPrice = null;
    notifyListeners();
  }
}
