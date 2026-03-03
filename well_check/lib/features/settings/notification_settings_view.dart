import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

class SpeedAlertNotifier extends Notifier<bool> {
  @override
  bool build() => true;
  void toggle(bool val) => state = val;
}

final speedAlertProvider = NotifierProvider<SpeedAlertNotifier, bool>(
  SpeedAlertNotifier.new,
);

class BatteryAlertNotifier extends Notifier<bool> {
  @override
  bool build() => true;
  void toggle(bool val) => state = val;
}

final batteryAlertProvider = NotifierProvider<BatteryAlertNotifier, bool>(
  BatteryAlertNotifier.new,
);

class GeofenceAlertNotifier extends Notifier<bool> {
  @override
  bool build() => true;
  void toggle(bool val) => state = val;
}

final geofenceAlertProvider = NotifierProvider<GeofenceAlertNotifier, bool>(
  GeofenceAlertNotifier.new,
);

class HeartRateAlertNotifier extends Notifier<bool> {
  @override
  bool build() => true;
  void toggle(bool val) => state = val;
}

final heartRateAlertProvider = NotifierProvider<HeartRateAlertNotifier, bool>(
  HeartRateAlertNotifier.new,
);

class NotificationSettingsView extends ConsumerWidget {
  const NotificationSettingsView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 80, 24, 120),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back_ios_new_rounded),
                ),
                const SizedBox(width: 8),
                Text(
                  "Alert Granularity",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 48),
            _alertSwitch(ref, "Speeding Alerts", speedAlertProvider),
            _alertSwitch(ref, "Low Battery Alerts", batteryAlertProvider),
            _alertSwitch(ref, "Geofence Exit Alerts", geofenceAlertProvider),
            _alertSwitch(ref, "Heart Rate Spikes", heartRateAlertProvider),
          ],
        ),
      ),
    );
  }

  Widget _alertSwitch(
    WidgetRef ref,
    String title,
    NotifierProvider<dynamic, bool> provider,
  ) {
    final value = ref.watch(provider);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          Switch(
            value: value,
            activeThumbColor: const Color(0xFF0D9488),
            onChanged: (val) {
              if (provider == speedAlertProvider) {
                ref.read(speedAlertProvider.notifier).toggle(val);
              }
              if (provider == batteryAlertProvider) {
                ref.read(batteryAlertProvider.notifier).toggle(val);
              }
              if (provider == geofenceAlertProvider) {
                ref.read(geofenceAlertProvider.notifier).toggle(val);
              }
              if (provider == heartRateAlertProvider) {
                ref.read(heartRateAlertProvider.notifier).toggle(val);
              }
            },
          ),
        ],
      ),
    );
  }
}
