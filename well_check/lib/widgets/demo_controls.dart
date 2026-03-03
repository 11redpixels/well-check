import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/features/medical_vault/medical_ledger_view.dart';
import 'package:well_check/providers/subscription_provider.dart';
import 'package:well_check/providers/family_provider.dart';

class DemoControls extends ConsumerWidget {
  const DemoControls({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sub = ref.watch(subscriptionProvider);

    return Positioned(
      top: 100,
      left: 0,
      child: Opacity(
        opacity: 0.5,
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.8),
            borderRadius: const BorderRadius.horizontal(
              right: Radius.circular(16),
            ),
          ),
          child: Column(
            children: [
              IconButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          const MedicalLedgerView(isReadOnly: true),
                    ),
                  );
                },
                icon: const Icon(
                  Icons.medical_information_rounded,
                  color: Colors.white,
                ),
                tooltip: "Simulate Paramedic Access",
              ),
              const SizedBox(height: 8),
              // Toggle Subscription for testing
              IconButton(
                onPressed: () {
                  if (!sub.isPremium) {
                    ref.read(subscriptionProvider.notifier).mockUpgrade();
                  } else {
                    ref.read(subscriptionProvider.notifier).mockDowngrade();
                  }
                },
                icon: Icon(
                  Icons.stars_rounded,
                  color: sub.isPremium
                      ? const Color(0xFFFFD700)
                      : Colors.white54,
                ),
                tooltip: "Toggle Premium Tier",
              ),
              const SizedBox(height: 8),
              // PHASE 1: LOAD SAMPLE DATA
              IconButton(
                onPressed: () {
                  ref.read(familyProvider.notifier).loadSampleData();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Family Sample Data Loaded")),
                  );
                },
                icon: const Icon(
                  Icons.family_restroom_rounded,
                  color: Colors.white,
                ),
                tooltip: "Load Family Sample Data",
              ),
            ],
          ),
        ),
      ),
    );
  }
}
