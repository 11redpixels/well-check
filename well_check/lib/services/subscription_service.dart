import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import 'dart:developer' as developer;

class SubscriptionService {
  static const _apiKeyIos = 'appl_PLACEHOLDER';
  static const _apiKeyAndroid = 'test_sMeXxWfgWyfjMxoFWhhTQNQcJlO';

  static Future<void> init() async {
    // REVENUECAT PLATFORM GUARD
    if (kIsWeb || !(Platform.isAndroid || Platform.isIOS)) {
      developer.log("REVENUECAT | Skipping initialization on this platform");
      return;
    }

    await Purchases.setLogLevel(LogLevel.debug);

    PurchasesConfiguration? configuration;
    if (Platform.isAndroid) {
      configuration = PurchasesConfiguration(_apiKeyAndroid);
    } else if (Platform.isIOS) {
      configuration = PurchasesConfiguration(_apiKeyIos);
    }

    if (configuration != null) {
      await Purchases.configure(configuration);
      developer.log("REVENUECAT | Initialized with Test Key");
    }
  }

  static Future<CustomerInfo?> getCustomerInfo() async {
    try {
      return await Purchases.getCustomerInfo();
    } catch (e) {
      developer.log("REVENUECAT | Error fetching customer info: $e");
      return null;
    }
  }

  static Future<bool> isPremium() async {
    final info = await getCustomerInfo();
    return info?.entitlements.all['premium']?.isActive ?? false;
  }

  static Future<CustomerInfo?> restorePurchases() async {
    try {
      return await Purchases.restorePurchases();
    } catch (e) {
      developer.log("REVENUECAT | Error restoring purchases: $e");
      return null;
    }
  }
}
