import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:well_check/models/alert_model.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/providers/family_metadata_provider.dart';
import 'package:well_check/services/alert_service.dart';

class HistoryView extends ConsumerStatefulWidget {
  const HistoryView({super.key});

  @override
  ConsumerState<HistoryView> createState() => _HistoryViewState();
}

class _HistoryViewState extends ConsumerState<HistoryView> {
  String _searchQuery = '';
  String? _filterMember;

  @override
  Widget build(BuildContext context) {
    final members = ref.watch(familyProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(24, 80, 24, 0),
            sliver: SliverToBoxAdapter(child: _header(context, ref)),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            sliver: SliverToBoxAdapter(child: _searchAndFilterBar(members)),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 32)),

          // REAL-TIME DATA STREAM FROM UNIFIED SERVICE
          ref.watch(activeAlertsProvider).when(
            data: (alerts) {
              final filteredAlerts = alerts.where((a) {
                final member = members.firstWhere((m) => m.id == a.profileId, orElse: () => members.first);
                final matchesMember = _filterMember == null || _filterMember == "All" || member.name == _filterMember;
                // Simple search query match
                final matchesSearch = a.message.toLowerCase().contains(_searchQuery.toLowerCase());
                return matchesMember && matchesSearch;
              }).toList();

              if (filteredAlerts.isEmpty) {
                return SliverToBoxAdapter(child: _buildEmptyVaultContent(context));
              }

              return SliverPadding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 140),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final alert = filteredAlerts[index];
                    final member = members.firstWhere(
                      (m) => m.id == alert.profileId,
                      orElse: () => members.first,
                    );

                    return _vaultEvent(
                      alert.createdAt.toLocal().toString().split(' ')[1].substring(0, 5),
                      "${member.name}: ${alert.message}",
                      _getIconForType(alert.type),
                      _getColorForSeverity(alert.severity),
                    );
                  }, childCount: filteredAlerts.length),
                ),
              );
            },
            loading: () => const SliverFillRemaining(child: Center(child: CircularProgressIndicator())),
            error: (e, s) => SliverToBoxAdapter(child: Center(child: Text("Vault sync error: $e"))),
          ),
        ],
      ),
    );
  }

  IconData _getIconForType(AlertType type) {
    switch (type) {
      case AlertType.fall:
        return Icons.warning_rounded;
      case AlertType.speeding:
        return Icons.speed_rounded;
      case AlertType.heartRate:
        return Icons.monitor_heart_rounded;
      case AlertType.weather:
        return Icons.cloud_rounded;
      case AlertType.inactivity:
        return Icons.person_off_rounded;
      case AlertType.battery:
        return Icons.battery_alert_rounded;
      case AlertType.manual:
        return Icons.notification_important_rounded;
    }
  }

  Color _getColorForSeverity(AlertSeverity severity) {
    switch (severity) {
      case AlertSeverity.low:
        return const Color(0xFF94A3B8);
      case AlertSeverity.medium:
        return const Color(0xFFF59E0B);
      case AlertSeverity.high:
        return Colors.orange;
      case AlertSeverity.critical:
        return Colors.red;
    }
  }

  Widget _header(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Family Vault",
          style: GoogleFonts.oswald(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF0F172A),
          ),
        ),
        const Text(
          "Comprehensive clinical and safety audit logs.",
          style: TextStyle(color: Color(0xFF64748B)),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildEmptyVaultContent(BuildContext context) {
    final family = ref.watch(currentFamilyProvider).value;
    final familyName = family?.name ?? "Family";

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: const Color(0xFF0D9488).withValues(alpha: 0.05),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.shield_moon_rounded,
                size: 60,
                color: Color(0xFF0D9488),
              ),
            ),
            const SizedBox(height: 32),
            Text(
              "The $familyName Vault is empty.",
              style: GoogleFonts.oswald(
                color: const Color(0xFF0F172A),
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              "Safety logs, clinical data, and emergency recordings will appear here automatically.",
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF64748B), height: 1.5),
            ),
          ],
        ),
      ),
    );
  }

  Widget _searchAndFilterBar(List<FamilyMember> members) {
    return Column(
      children: [
        TextField(
          onChanged: (val) => setState(() => _searchQuery = val),
          decoration: InputDecoration(
            hintText: "Search logs (e.g. 'dizzy')",
            prefixIcon: const Icon(Icons.search_rounded),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
          ),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _filterChip("All"),
              const SizedBox(width: 8),
              ...members.map(
                (m) => Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: _filterChip(m.name),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _filterChip(String label) {
    final isSelected =
        _filterMember == label || (label == "All" && _filterMember == null);
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (val) => setState(
        () => _filterMember = val ? (label == "All" ? null : label) : null,
      ),
      selectedColor: const Color(0xFF0D9488).withValues(alpha: 0.1),
      labelStyle: TextStyle(
        color: isSelected ? const Color(0xFF0D9488) : const Color(0xFF64748B),
        fontWeight: FontWeight.bold,
        fontSize: 12,
      ),
    );
  }

  Widget _vaultEvent(String time, String msg, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 12),
          Text(msg),
        ],
      ),
    );
  }
}
