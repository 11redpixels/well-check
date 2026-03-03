import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/providers/family_metadata_provider.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:well_check/models/user_role.dart';

class InviteView extends ConsumerWidget {
  const InviteView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final familyAsync = ref.watch(currentFamilyProvider);
    final user = ref.watch(userProvider);
    final isAdmin = user.role == UserRole.familyHead;

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
                  icon: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  "Invite Family",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 40),

            if (!isAdmin)
              _buildSecurityLock(context)
            else
              // PHASE 2: QR INVITE SYSTEM
              familyAsync.when(
                data: (family) => Column(
                  children: [
                    _sectionHeader("SCAN TO JOIN FAMILY SHIELD"),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(32),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          QrImageView(
                            data: family?.inviteCode ?? "ERROR",
                            version: QrVersions.auto,
                            size: 200.0,
                            eyeStyle: const QrEyeStyle(
                              eyeShape: QrEyeShape.square,
                              color: Color(0xFF0F172A),
                            ),
                            dataModuleStyle: const QrDataModuleStyle(
                              dataModuleShape: QrDataModuleShape.square,
                              color: Color(0xFF3B82F6),
                            ),
                          ),
                          const SizedBox(height: 24),
                          Text(
                            family?.inviteCode ?? "------",
                            style: GoogleFonts.robotoMono(
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF3B82F6),
                              letterSpacing: 4,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            "Invite code for ${family?.name ?? 'your family'}",
                            style: const TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 32),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF3B82F6),
                              foregroundColor: Colors.white,
                              minimumSize: const Size(double.infinity, 56),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 0,
                            ),
                            onPressed: () {
                              if (family?.inviteCode != null) {
                                SharePlus.instance.share(
                                  ShareParams(
                                    text:
                                        'Join our Family Shield on WellCheck using this magic link: wellcheck://join?code=${family!.inviteCode}',
                                    subject: 'Join our Family Shield',
                                  ),
                                );
                              }
                            },
                            icon: const Icon(Icons.share_rounded),
                            label: const Text(
                              "Share Magic Link",
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, s) => Center(child: Text("Error: $e")),
              ),

            const SizedBox(height: 32),
            if (isAdmin)
              _infoCard(
                "Instruction",
                "Display this code to family members. Once scanned, they will be automatically stitched into the registry.",
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSecurityLock(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
      ),
      child: const Column(
        children: [
          Icon(Icons.lock_person_rounded, color: Color(0xFFEF4444), size: 64),
          SizedBox(height: 24),
          Text(
            "Security Restriction",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
          ),
          SizedBox(height: 12),
          Text(
            "Only the Family Head can generate or view invite links for this shield.",
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF64748B), height: 1.4),
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Center(
        child: Text(
          title,
          style: const TextStyle(
            color: Color(0xFF94A3B8),
            fontWeight: FontWeight.w900,
            fontSize: 11,
            letterSpacing: 1.5,
          ),
        ),
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
