import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:well_check/services/consent_tracker.dart';

class ConsentLedgerView extends ConsumerWidget {
  const ConsentLedgerView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logs = ref.watch(consentLogProvider);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          "CONSENT LEDGER",
          style: GoogleFonts.oswald(fontSize: 18, letterSpacing: 1.5),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF0F172A),
      ),
      body: logs.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              itemCount: logs.length,
              itemBuilder: (context, index) {
                final entry = logs[index];
                return _ledgerEntry(entry, theme);
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF0D9488).withValues(alpha: 0.05),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.gavel_rounded,
                color: Color(0xFF0D9488),
                size: 48,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              "No Consent History",
              style: GoogleFonts.oswald(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              "Every permission change, data access request, and family override is cryptographically logged in this immutable ledger.",
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF64748B), height: 1.5),
            ),
          ],
        ),
      ),
    );
  }

  Widget _ledgerEntry(ConsentLogEntry entry, ThemeData theme) {
    final dateStr = DateFormat(
      'MMM dd, yyyy • HH:mm:ss',
    ).format(entry.timestamp);
    final isGranted = entry.enabled;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color:
                  (isGranted
                          ? const Color(0xFF0D9488)
                          : const Color(0xFFEF4444))
                      .withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isGranted ? Icons.verified_user_rounded : Icons.gpp_bad_rounded,
              color: isGranted
                  ? const Color(0xFF0D9488)
                  : const Color(0xFFEF4444),
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      entry.permissionKey.replaceAll('_', ' '),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    Text(
                      isGranted ? "GRANTED" : "REVOKED",
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: isGranted
                            ? const Color(0xFF0D9488)
                            : const Color(0xFFEF4444),
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  "Action by: ${entry.userId.toUpperCase()}",
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  dateStr,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF94A3B8),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
