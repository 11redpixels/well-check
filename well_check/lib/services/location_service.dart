import 'dart:async';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:developer' as developer;

class LocationService {
  final Ref ref;
  Timer? _timer;

  LocationService(this.ref);

  void startTracking() {
    _timer?.cancel();
    // In a real app, use geolocator package here.
    // For MVP, we'll simulate the local device's movement but push to real Supabase.
    _timer = Timer.periodic(const Duration(minutes: 5), (timer) async {
      await _updateLocation();
    });
  }

  Future<void> _updateLocation() async {
    final user = ref.read(userProvider);
    if (user.id == null || !user.isAuthenticated) return;

    try {
      // This is where you'd get real GPS coordinates
      // Position position = await Geolocator.getCurrentPosition();
      
      await Supabase.instance.client.from('profiles').update({
        'last_updated': DateTime.now().toIso8601String(),
        // 'lat': position.latitude,
        // 'lng': position.longitude,
      }).eq('auth_id', user.id!);
      
      developer.log("LOCATION | Updated for user ${user.id}");
    } catch (e) {
      developer.log("LOCATION | Update failed: $e");
    }
  }

  void stopTracking() {
    _timer?.cancel();
  }
}

final locationServiceProvider = Provider((ref) => LocationService(ref));
