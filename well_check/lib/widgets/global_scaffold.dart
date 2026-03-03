import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:well_check/providers/family_metadata_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:well_check/models/user_role.dart';
import 'package:well_check/services/stitch_sync.dart';
import 'package:well_check/widgets/demo_controls.dart';

class GlobalScaffold extends ConsumerStatefulWidget {
  final Widget child;
  const GlobalScaffold({super.key, required this.child});

  @override
  ConsumerState<GlobalScaffold> createState() => _GlobalScaffoldState();
}

class _GlobalScaffoldState extends ConsumerState<GlobalScaffold>
    with WidgetsBindingObserver {
  DateTime? _backgroundTimestamp;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused) {
      _backgroundTimestamp = DateTime.now();
    } else if (state == AppLifecycleState.resumed) {
      if (_backgroundTimestamp != null) {
        final duration = DateTime.now().difference(_backgroundTimestamp!);
        // PHASE 2: AUTO-LOCK TIMER (30 seconds)
        if (duration.inSeconds >= 30) {
          ref.read(userProvider.notifier).lock();
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(userProvider);

    return Scaffold(
      appBar: null,
      backgroundColor: const Color(0xFFF8FAFC),
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          widget.child,

          // OFFLINE INDICATOR
          Consumer(
            builder: (context, ref, _) {
              final isOffline = ref.watch(isOfflineProvider);
              if (!isOffline) return const SizedBox.shrink();
              return Positioned(
                top: 60,
                right: 24,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    children: [
                      Icon(
                        Icons.sync_disabled_rounded,
                        color: Colors.white,
                        size: 16,
                      ),
                      SizedBox(width: 8),
                      Text(
                        "Sync Paused",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          // DEMO CONTROLS
          const DemoControls(),

          // HUD BUTTONS
          Positioned(
            bottom: 32,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(flex: 4),
                const EmergencyButton(),
                const Spacer(flex: 1),
                const CommandCenterButton(),
                const Spacer(flex: 1),
              ],
            ),
          ),

          // BIOMETRIC RE-ENTRY GATE
          if (userState.isLocked) _buildLockScreen(),

          // DIAGNOSTIC OVERLAY (DEBUG ONLY)
          if (kDebugMode)
            Positioned(
              bottom: 120,
              left: 24,
              child: Consumer(
                builder: (context, ref, _) {
                  final familyName = ref.watch(currentFamilyProvider).when(
                        data: (f) => f?.name ?? 'None',
                        loading: () => '...',
                        error: (error, stack) => 'Error',
                      );
                  return Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _debugText("UID: ${userState.id?.substring(0, 5) ?? 'N/A'}"),
                        _debugText("Role: ${userState.role.name}"),
                        _debugText("Fam: $familyName"),
                        _debugText("Auth: ${userState.isAuthorized}"),
                        _debugText("Session: ${Supabase.instance.client.auth.currentUser?.lastSignInAt != null ? 
                          DateTime.now().difference(DateTime.parse(Supabase.instance.client.auth.currentUser!.lastSignInAt!)).inMinutes : '0'}m"),
                      ],
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }

  Widget _debugText(String text) {
    return Text(
      text,
      style: const TextStyle(
        color: Colors.greenAccent,
        fontSize: 10,
        fontWeight: FontWeight.bold,
        fontFamily: 'monospace',
      ),
    );
  }

  Widget _buildLockScreen() {
    return Container(
      color: const Color(0xFF0F172A),
      width: double.infinity,
      height: double.infinity,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset('assets/images/logo.png', height: 120),
            const SizedBox(height: 48),
            const Text(
              "Shield Locked",
              style: TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              "App backgrounded for > 30s",
              style: TextStyle(color: Colors.white70, fontSize: 16),
            ),
            const SizedBox(height: 80),
            ElevatedButton.icon(
              onPressed: () => ref.read(userProvider.notifier).unlock(),
              icon: const Icon(Icons.face_unlock_rounded),
              label: const Text("UNLOCK SHIELD"),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D9488),
                foregroundColor: Colors.white,
                minimumSize: const Size(240, 64),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(32),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class EmergencyButton extends StatefulWidget {
  const EmergencyButton({super.key});

  @override
  State<EmergencyButton> createState() => _EmergencyButtonState();
}

class _EmergencyButtonState extends State<EmergencyButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.08,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _pulseAnimation,
      child: GestureDetector(
        onTap: () => context.push('/panic'),
        child: Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: const Color(0xFFFF4444),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFFF4444).withValues(alpha: 0.5),
                blurRadius: 20,
                spreadRadius: 8,
              ),
            ],
          ),
          child: const Icon(
            Icons.warning_rounded,
            color: Colors.white,
            size: 44,
          ),
        ),
      ),
    );
  }
}

class CommandCenterButton extends StatelessWidget {
  const CommandCenterButton({super.key});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showCommandCenter(context),
      child: Container(
        width: 68,
        height: 68,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF3B82F6), Color(0xFF1E40AF)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF3B82F6).withValues(alpha: 0.45),
              blurRadius: 18,
              spreadRadius: 3,
            ),
          ],
        ),
        child: const Icon(
          Icons.grid_view_rounded,
          color: Colors.white,
          size: 34,
        ),
      ),
    );
  }

  void _showCommandCenter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => const _CommandCenterDrawer(),
    );
  }
}

class _CommandCenterDrawer extends ConsumerWidget {
  const _CommandCenterDrawer();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final isAdmin = user.role == UserRole.familyHead;
    
    // Check both primary role and sub-role for UI gating
    final isMonitor = user.role == UserRole.monitor || user.subRole == 'monitor';
    final isProtected = user.role == UserRole.protected ||
        user.role == UserRole.minor ||
        user.subRole == 'protected' ||
        user.subRole == 'minor';

    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: Color(0xFF1E293B),
        borderRadius: BorderRadius.vertical(top: Radius.circular(40)),
        border: Border(top: BorderSide(color: Color(0xFF0D9488), width: 3)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Command Center',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isAdmin
                        ? 'System Administrator'
                        : (isMonitor ? 'Active Monitor' : 'Protected Member'),
                    style: const TextStyle(
                      color: Color(0xFF0D9488),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(
                  Icons.close_rounded,
                  color: Colors.white,
                  size: 32,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          if (isProtected)
            Expanded(child: _buildProtectedSimplifiedMenu(context))
          else ...[
            // PRIMARY ACTION: INVITE MEMBER
            if (isAdmin)
              Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0D9488),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 64),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    elevation: 0,
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    context.push('/invite-family');
                  },
                  icon: const Icon(Icons.person_add_rounded, size: 28),
                  label: const Text(
                    "INVITE NEW MEMBER",
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 16,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
              ),

            // PHASE 5: EMERGENCY BROADCAST BUTTON
            if (isAdmin || isMonitor)
              Padding(
                padding: const EdgeInsets.only(bottom: 24.0),
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF4444),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 56),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          "SHIELD BROADCAST: 'A Family Alert has been triggered. Check the app.' sent to circle.",
                        ),
                        backgroundColor: Color(0xFFFF4444),
                      ),
                    );
                  },
                  icon: const Icon(Icons.broadcast_on_personal_rounded),
                  label: const Text(
                    "SHIELD BROADCAST (SMS)",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ),

            const SizedBox(height: 16),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                mainAxisSpacing: 20,
                crossAxisSpacing: 20,
                children: [
                  if (isAdmin) ...[
                    _actionTile(
                      context,
                      Icons.medication_rounded,
                      'Family Apothecary',
                      '/med-chest',
                      const Color(0xFFEF4444),
                    ),
                    _actionTile(
                      context,
                      Icons.psychology_rounded,
                      'Clinical Screener',
                      '/assessments',
                      const Color(0xFF3B82F6),
                    ),
                    _actionTile(
                      context,
                      Icons.hub_rounded,
                      'Hardware Nexus',
                      '/pair-device',
                      const Color(0xFF3B82F6),
                    ),
                    _actionTile(
                      context,
                      Icons.medical_services_rounded,
                      'Medical Vault',
                      '/medical-vault',
                      const Color(0xFF0D9488),
                    ),
                    _actionTile(
                      context,
                      Icons.shield_rounded,
                      'Safe Zones',
                      '/safe-zones',
                      const Color(0xFF8B5CF6),
                    ),
                    _actionTile(
                      context,
                      Icons.person_rounded,
                      'Status',
                      '/status',
                      const Color(0xFF3B82F6),
                    ),
                    _actionTile(
                      context,
                      Icons.history_rounded,
                      'Vault',
                      '/history',
                      const Color(0xFF64748B),
                    ),
                    _actionTile(
                      context,
                      Icons.settings_rounded,
                      'Admin Settings',
                      '/settings',
                      const Color(0xFF94A3B8),
                    ),
                  ] else if (isMonitor) ...[
                    _actionTile(
                      context,
                      Icons.people_rounded,
                      'Protected Members',
                      '/family-head',
                      const Color(0xFF0D9488),
                    ),
                    _actionTile(
                      context,
                      Icons.map_rounded,
                      'Live Map',
                      '/geofence',
                      const Color(0xFF3B82F6),
                    ),
                    _actionTile(
                      context,
                      Icons.medical_information_rounded,
                      'Health Trends',
                      '/history',
                      const Color(0xFFF59E0B),
                    ),
                    _actionTile(
                      context,
                      Icons.settings_rounded,
                      'Settings',
                      '/settings',
                      const Color(0xFF94A3B8),
                    ),
                  ],
                ],
              ),
            ),
          ],
          const SizedBox(height: 24),
          _systemStatsBar(),
        ],
      ),
    );
  }

  Widget _buildProtectedSimplifiedMenu(BuildContext context) {
    return Column(
      children: [
        _largeMenuButton(
          context,
          "I AM SAFE",
          Icons.check_circle_rounded,
          const Color(0xFF0D9488),
          () {
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text("Safety update sent to family.")),
            );
          },
        ),
        const SizedBox(height: 20),
        _largeMenuButton(
          context,
          "NEED HELP",
          Icons.warning_rounded,
          const Color(0xFFF59E0B),
          () {
            Navigator.pop(context);
            context.push('/panic');
          },
        ),
        const SizedBox(height: 20),
        _largeMenuButton(
          context,
          "CALL FAMILY HEAD",
          Icons.phone_rounded,
          const Color(0xFF3B82F6),
          () {
            Navigator.pop(context);
            // Simulate call
          },
        ),
      ],
    );
  }

  Widget _largeMenuButton(
    BuildContext context,
    String label,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: color.withValues(alpha: 0.3), width: 2),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 40),
            const SizedBox(width: 24),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.5,
              ),
            ),
            const Spacer(),
            const Icon(
              Icons.arrow_forward_ios_rounded,
              color: Colors.white24,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _systemStatsBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _StatItem(icon: Icons.battery_5_bar_rounded, text: '84%'),
          _StatItem(icon: Icons.gps_fixed_rounded, text: 'High'),
          _StatItem(icon: Icons.wifi_rounded, text: 'Online'),
        ],
      ),
    );
  }

  Widget _actionTile(
    BuildContext context,
    IconData icon,
    String label,
    String route,
    Color iconColor,
  ) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          Navigator.pop(context);
          context.push(route);
        },
        borderRadius: BorderRadius.circular(20),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF334155), width: 1.5),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: iconColor, size: 30),
              ),
              const SizedBox(height: 14),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final IconData icon;
  final String text;
  const _StatItem({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF0D9488), size: 20),
        const SizedBox(width: 8),
        Text(
          text,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}
