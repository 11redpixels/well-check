import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:well_check/providers/settings_provider.dart';
import 'package:well_check/providers/app_state_provider.dart';

class SettingsView extends ConsumerWidget {
  const SettingsView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final notifier = ref.read(settingsProvider.notifier);
    final themeMode = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 80, 24, 120),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(
                        Icons.arrow_back_ios_new_rounded,
                        color: Theme.of(context).textTheme.displayLarge?.color,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      "Shield Config",
                      style: GoogleFonts.oswald(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).textTheme.displayLarge?.color,
                      ),
                    ),
                  ],
                ),
                Switch(
                  value: themeMode == ThemeMode.dark,
                  activeThumbColor: const Color(0xFF22D3EE),
                  onChanged: (val) {
                    ref
                        .read(themeModeProvider.notifier)
                        .setThemeMode(val ? ThemeMode.dark : ThemeMode.light);
                  },
                ),
              ],
            ),
            const SizedBox(height: 48),

            _settingHeader("Speeding Thresholds"),
            _sliderCard(
              title: "Default Speed Limit",
              value: settings.speedLimit.toDouble(),
              min: 55,
              max: 90,
              label: "${settings.speedLimit} mph",
              onChanged: (val) => notifier.updateSpeedLimit(val.toInt()),
            ),

            const SizedBox(height: 32),

            _settingHeader("Clinical Alert Thresholds"),
            _sliderCard(
              title: "Critical HR Alert",
              value: settings.hrAlertThreshold.toDouble(),
              min: 80,
              max: 140,
              label: "${settings.hrAlertThreshold} bpm",
              onChanged: (val) => notifier.updateHrThreshold(val.toInt()),
            ),

            const SizedBox(height: 24),

            _sliderCard(
              title: "Max Room Temp",
              value: settings.maxTemp,
              min: 70,
              max: 80,
              label: "${settings.maxTemp.toStringAsFixed(1)}°F",
              onChanged: (val) =>
                  notifier.updateTempRange(settings.minTemp, val),
            ),

            const SizedBox(height: 48),
            _infoCard(
              "Admin Control",
              "Changes made here update the family registry in real-time across all family devices.",
            ),

            const SizedBox(height: 40),
            _settingHeader("Notifications & Legal"),
            _navTile(
              context,
              "Alert Granularity",
              Icons.notifications_active_rounded,
              '/notification-settings',
            ),
            _navTile(
              context,
              "Family Permissions Hub",
              Icons.security_rounded,
              '/permissions-hub',
            ),
            _navTile(
              context,
              "Terms of Service",
              Icons.description_rounded,
              '/terms',
            ),
            _navTile(
              context,
              "Privacy Policy",
              Icons.privacy_tip_rounded,
              '/privacy',
            ),

            const SizedBox(height: 60),
          ],
        ),
      ),
    );
  }

  Widget _navTile(
    BuildContext context,
    String title,
    IconData icon,
    String route,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
          ),
        ],
      ),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF0D9488)),
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 15,
            color: Color(0xFF0F172A),
          ),
        ),
        trailing: const Icon(
          Icons.arrow_forward_ios_rounded,
          size: 14,
          color: Color(0xFF94A3B8),
        ),
        onTap: () => context.push(route),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }

  Widget _settingHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0, left: 4),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          color: Color(0xFF94A3B8),
          fontWeight: FontWeight.w900,
          fontSize: 11,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _sliderCard({
    required String title,
    required double value,
    required double min,
    required double max,
    required String label,
    required ValueChanged<double> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Color(0xFF0F172A),
                ),
              ),
              Text(
                label,
                style: GoogleFonts.robotoMono(
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF3B82F6),
                  fontSize: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SliderTheme(
            data: SliderThemeData(
              activeTrackColor: const Color(0xFF3B82F6),
              inactiveTrackColor: const Color(0xFFE2E8F0),
              thumbColor: Colors.white,
              overlayColor: const Color(0xFF3B82F6).withValues(alpha: 0.1),
              trackHeight: 4,
            ),
            child: Slider(
              value: value,
              min: min,
              max: max,
              onChanged: onChanged,
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoCard(String title, String body) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            body,
            style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
        ],
      ),
    );
  }
}
