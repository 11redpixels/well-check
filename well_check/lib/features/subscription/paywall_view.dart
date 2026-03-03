import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:well_check/theme/app_theme.dart';
import 'package:well_check/providers/subscription_provider.dart';
import 'package:well_check/services/subscription_service.dart';

class PaywallView extends ConsumerWidget {
  const PaywallView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(gradient: AppTheme.splashGradient),
        child: SafeArea(
          child: Column(
            children: [
              Align(
                alignment: Alignment.topLeft,
                child: IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.close_rounded,
                    color: Colors.white,
                    size: 32,
                  ),
                ),
              ),
              const Spacer(),
              const Icon(
                Icons.stars_rounded,
                color: Color(0xFFFFD700),
                size: 80,
              ),
              const SizedBox(height: 24),
              Text(
                "WELL-CHECK SHIELD",
                style: GoogleFonts.oswald(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFFFFD700),
                  letterSpacing: 4,
                ),
              ),
              Text(
                "PREMIUM",
                style: GoogleFonts.oswald(
                  fontSize: 48,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 48),

              _benefitItem(
                Icons.history_edu_rounded,
                "Unlimited Clinical Logs",
                "Access full 90-day vital history for doctors.",
              ),
              _benefitItem(
                Icons.psychology_rounded,
                "Advanced Semantic AI",
                "Real-time red-flag detection in voice notes.",
              ),
              _benefitItem(
                Icons.thunderstorm_rounded,
                "Guardian Storm Alerts",
                "Predictive erratic driving and critical vitals monitoring.",
              ),

              const Spacer(),

              Padding(
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  children: [
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0D9488),
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 72),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                        elevation: 20,
                        shadowColor: const Color(
                          0xFF0D9488,
                        ).withValues(alpha: 0.5),
                      ),
                      onPressed: () {
                        ref.read(subscriptionProvider.notifier).mockUpgrade();
                        Navigator.pop(context);
                      },
                      child: const Text(
                        "UPGRADE FOR \$9.99/MO",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          "Cancel anytime. ",
                          style: TextStyle(color: Colors.white54, fontSize: 12),
                        ),
                        GestureDetector(
                          onTap: () => SubscriptionService.restorePurchases(),
                          child: const Text(
                            "Restore Purchases",
                            style: TextStyle(
                              color: Color(0xFF22D3EE),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _benefitItem(IconData icon, String title, String subtitle) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: const Color(0xFF22D3EE), size: 28),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
