import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:well_check/providers/user_provider.dart';

class PendingApprovalView extends ConsumerWidget {
  const PendingApprovalView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          TextButton.icon(
            onPressed: () {
              ref.read(userProvider.notifier).logout();
              Supabase.instance.client.auth.signOut();
            },
            icon: const Icon(Icons.logout_rounded, color: Color(0xFF64748B)),
            label: const Text(
              "Logout",
              style: TextStyle(color: Color(0xFF64748B)),
            ),
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.hourglass_empty_rounded,
                size: 100,
                color: Color(0xFFF59E0B),
              ),
              const SizedBox(height: 48),
              Text(
                "Awaiting Authorization",
                style: GoogleFonts.oswald(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF0F172A),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              const Text(
                "Your request to join the family shield has been sent. The Family Head must authorize your access before you can see clinical data or alerts.",
                style: TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 16,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 64),
              const CircularProgressIndicator(color: Color(0xFFF59E0B)),
              const SizedBox(height: 24),
              const Text(
                "Updating automatically...",
                style: TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
