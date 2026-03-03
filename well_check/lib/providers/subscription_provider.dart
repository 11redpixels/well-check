import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:well_check/services/subscription_service.dart';
import 'package:flutter/foundation.dart';

class SubscriptionState {
  final CustomerInfo? customerInfo;
  final bool isPremium;
  final bool isLoading;

  SubscriptionState({
    this.customerInfo,
    this.isPremium = false,
    this.isLoading = true,
  });

  SubscriptionState copyWith({
    CustomerInfo? customerInfo,
    bool? isPremium,
    bool? isLoading,
  }) {
    return SubscriptionState(
      customerInfo: customerInfo ?? this.customerInfo,
      isPremium: isPremium ?? this.isPremium,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class SubscriptionNotifier extends Notifier<SubscriptionState> {
  @override
  SubscriptionState build() {
    _init();
    return SubscriptionState();
  }

  Future<void> _init() async {
    if (kIsWeb) {
      state = SubscriptionState(isPremium: false, isLoading: false);
      return;
    }

    final info = await SubscriptionService.getCustomerInfo();
    state = SubscriptionState(
      customerInfo: info,
      isPremium: info?.entitlements.active.containsKey('premium') ?? false,
      isLoading: false,
    );

    Purchases.addCustomerInfoUpdateListener((info) {
      state = state.copyWith(
        customerInfo: info,
        isPremium: info.entitlements.active.containsKey('premium'),
      );
    });
  }

  // Mock upgrade for demo purposes
  void mockUpgrade() {
    state = state.copyWith(isPremium: true);
  }

  void mockDowngrade() {
    state = state.copyWith(isPremium: false);
  }
}

final subscriptionProvider =
    NotifierProvider<SubscriptionNotifier, SubscriptionState>(
      SubscriptionNotifier.new,
    );
