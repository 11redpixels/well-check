import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:well_check/models/user_role.dart';

class DevicePairingView extends ConsumerStatefulWidget {
  const DevicePairingView({super.key});

  @override
  ConsumerState<DevicePairingView> createState() => _DevicePairingViewState();
}

class _DevicePairingViewState extends ConsumerState<DevicePairingView> {
  String? _selectedProfileId;
  String? _selectedDeviceType;
  bool _isPairing = false;
  double _pairingProgress = 0.0;

  final List<Map<String, dynamic>> _deviceTypes = [
    {
      'id': 'apple_watch',
      'label': 'Apple Watch',
      'icon': Icons.watch_rounded,
      'category': 'Wearable',
    },
    {
      'id': 'nanit_cam',
      'label': 'Nursery Camera',
      'icon': Icons.videocam_rounded,
      'category': 'Environment',
    },
    {
      'id': 'bp_cuff',
      'label': 'BP Cuff',
      'icon': Icons.monitor_heart_rounded,
      'category': 'Medical',
    },
    {
      'id': 'fitbit',
      'label': 'Fitbit Tracker',
      'icon': Icons.directions_run_rounded,
      'category': 'Wearable',
    },
  ];

  Future<void> _startPairing() async {
    if (_selectedProfileId == null || _selectedDeviceType == null) return;

    setState(() {
      _isPairing = true;
      _pairingProgress = 0.0;
    });

    // Simulate Handshake
    for (int i = 0; i <= 10; i++) {
      await Future.delayed(const Duration(milliseconds: 300));
      if (mounted) setState(() => _pairingProgress = i / 10);
    }

    try {
      final user = ref.read(userProvider);
      if (user.familyId == null) return;

      await Supabase.instance.client.from('managed_devices').insert({
        'family_id': user.familyId,
        'assigned_profile_id': _selectedProfileId,
        'device_type': _selectedDeviceType,
        'last_ping': DateTime.now().toIso8601String(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Hardware Nexus: Pairing Successful")),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Pairing Failed: $e")));
        setState(() => _isPairing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final members = ref.watch(familyProvider);
    final managedMembers = members
        .where((m) => m.role != UserRole.familyHead)
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          "HARDWARE NEXUS",
          style: GoogleFonts.oswald(fontSize: 18, letterSpacing: 1.5),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF0F172A),
      ),
      body: _isPairing
          ? _buildPairingSimulation()
          : _buildSetupForm(managedMembers),
    );
  }

  Widget _buildSetupForm(List<FamilyMember> managedMembers) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "1. SELECT MEMBER",
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.5,
              color: Color(0xFF94A3B8),
            ),
          ),
          const SizedBox(height: 16),
          _profileSelector(managedMembers),

          const SizedBox(height: 48),
          const Text(
            "2. SELECT DEVICE TYPE",
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.5,
              color: Color(0xFF94A3B8),
            ),
          ),
          const SizedBox(height: 16),
          _deviceTypeGrid(),

          const SizedBox(height: 64),
          ElevatedButton(
            onPressed:
                (_selectedProfileId != null && _selectedDeviceType != null)
                ? _startPairing
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0D9488),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 64),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              disabledBackgroundColor: const Color(0xFFE2E8F0),
            ),
            child: const Text(
              "INITIALIZE HANDSHAKE",
              style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _profileSelector(List<FamilyMember> members) {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: members.length,
        itemBuilder: (context, index) {
          final m = members[index];
          final isSelected = _selectedProfileId == m.id;
          return GestureDetector(
            onTap: () => setState(() => _selectedProfileId = m.id),
            child: Container(
              width: 80,
              margin: const EdgeInsets.only(right: 16),
              decoration: BoxDecoration(
                color: isSelected
                    ? const Color(0xFF0D9488).withValues(alpha: 0.1)
                    : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected
                      ? const Color(0xFF0D9488)
                      : const Color(0xFFE2E8F0),
                  width: 2,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: const Color(0xFFF1F5F9),
                    child: Text(
                      m.name[0],
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    m.name,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: isSelected
                          ? const Color(0xFF0D9488)
                          : const Color(0xFF64748B),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _deviceTypeGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 1.3,
      ),
      itemCount: _deviceTypes.length,
      itemBuilder: (context, index) {
        final d = _deviceTypes[index];
        final isSelected = _selectedDeviceType == d['id'];
        return GestureDetector(
          onTap: () => setState(() => _selectedDeviceType = d['id']),
          child: Container(
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFF0D9488) : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected
                    ? const Color(0xFF0D9488)
                    : const Color(0xFFE2E8F0),
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  d['icon'],
                  color: isSelected ? Colors.white : const Color(0xFF64748B),
                  size: 32,
                ),
                const SizedBox(height: 12),
                Text(
                  d['label'],
                  style: TextStyle(
                    color: isSelected ? Colors.white : const Color(0xFF0F172A),
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
                Text(
                  d['category'],
                  style: TextStyle(
                    color: isSelected
                        ? Colors.white70
                        : const Color(0xFF94A3B8),
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPairingSimulation() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.bluetooth_searching_rounded,
              color: Color(0xFF0D9488),
              size: 80,
            ),
            const SizedBox(height: 48),
            Text(
              "AUTHENTICATING DEVICE",
              style: GoogleFonts.oswald(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              "Establishing secure encrypted link...",
              style: TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 48),
            LinearProgressIndicator(
              value: _pairingProgress,
              backgroundColor: const Color(0xFFE2E8F0),
              color: const Color(0xFF0D9488),
              minHeight: 8,
              borderRadius: BorderRadius.circular(4),
            ),
            const SizedBox(height: 24),
            Text(
              "${(_pairingProgress * 100).toInt()}%",
              style: GoogleFonts.robotoMono(
                fontWeight: FontWeight.bold,
                color: const Color(0xFF0D9488),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
