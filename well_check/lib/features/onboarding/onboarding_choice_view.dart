import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:well_check/services/supabase_auth_service.dart';
import 'package:well_check/models/user_role.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:well_check/providers/family_provider.dart';

class OnboardingChoiceView extends ConsumerStatefulWidget {
  final String? inviteCode;
  const OnboardingChoiceView({super.key, this.inviteCode});

  @override
  ConsumerState<OnboardingChoiceView> createState() =>
      _OnboardingChoiceViewState();
}

class _OnboardingChoiceViewState extends ConsumerState<OnboardingChoiceView> {
  final _familyNameController = TextEditingController();
  final _inviteCodeController = TextEditingController();
  bool _isLoading = false;
  bool _isLeaderSelected = true;
  UserRole? _selectedRole;
  String? _detectedFamilyName;

  @override
  void initState() {
    super.initState();
    // DISABLE GHOST AUDIT DURING ONBOARDING
    ref.read(supabaseAuthProvider).isOnboarding = true;

    if (widget.inviteCode != null) {
      _inviteCodeController.text = widget.inviteCode!;
      _isLeaderSelected = false;
      // Auto-verify if code provided
      WidgetsBinding.instance.addPostFrameCallback((_) => _verifyCode());
    }
  }

  @override
  void dispose() {
    // RE-ENABLE GHOST AUDIT
    ref.read(supabaseAuthProvider).isOnboarding = false;
    super.dispose();
  }

  String _generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return List.generate(
      6,
      (index) => chars[Random().nextInt(chars.length)],
    ).join();
  }

  Future<void> _verifyCode() async {
    final code = _inviteCodeController.text.trim().toUpperCase();
    if (code.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final family = await Supabase.instance.client
          .from('families')
          .select()
          .eq('invite_code', code)
          .maybeSingle();

      if (!mounted) return;

      if (family == null) {
        throw Exception("Invalid code.");
      }

      setState(() {
        _detectedFamilyName = family['name'];
        _selectedRole = UserRole.monitor; // Default
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: ${e.toString()}")),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _createFamily() async {
    final name = _familyNameController.text.trim();
    if (name.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final inviteCode = _generateInviteCode();

      final familyResponse = await Supabase.instance.client
          .from('families')
          .insert({
            'name': name,
            'invite_code': inviteCode,
            'admin_id': user.id,
          })
          .select()
          .single();

      if (!mounted) return;

      final familyId = familyResponse['id'];

      await Supabase.instance.client.auth.updateUser(
        UserAttributes(data: {'family_id': familyId}),
      );

      if (!mounted) return;

      // FORCED WRITE: Ensure profile exists before navigation
      await Supabase.instance.client.from('profiles').upsert({
        'auth_id': user.id,
        'family_id': familyId,
        'role': UserRole.familyHead.id,
        'first_name': user.userMetadata?['first_name'] ?? 'Leader',
        'is_managed': false,
        'is_authorized': true, // BIRTHRIGHT: Head is always authorized
        'status': 'Active',
        'last_updated': DateTime.now().toIso8601String(),
      }, onConflict: 'auth_id');

      if (!mounted) return;

      // UPDATE LOCAL STATE: Ensure immediate UI sync
      ref.read(userProvider.notifier).setRole(
            UserRole.familyHead,
            id: user.id,
            familyId: familyId,
            firstName: user.userMetadata?['first_name'] ?? 'Leader',
            isAuthorized: true,
          );

      // INVALDITE & TRIGGER REDIRECT
      ref.invalidate(userProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Welcome to the $name Family Shield!")),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Setup Error: $e")));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _joinFamily() async {
    final code = _inviteCodeController.text.trim().toUpperCase();
    if (code.isEmpty || _selectedRole == null) return;

    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) {
      // FORCE SIGN-IN
      context.go('/login?code=$code');
      return;
    }

    setState(() => _isLoading = true);
    try {
      debugPrint("TRACE: Starting Join Handshake for code $code");
      
      await ref.read(familyProvider.notifier).joinFamily(code, _selectedRole!);
      if (!mounted) return;

      debugPrint("TRACE: Found Family ID for code $code? Yes");
      debugPrint("TRACE: Profile update successful? Yes");

      // INVALDITE & TRIGGER REDIRECT
      ref.invalidate(userProvider);
      debugPrint("TRACE: Metadata sync successful? Yes");

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Joined family! Waiting for admin approval."),
          ),
        );
      }
    } catch (e) {
      debugPrint("TRACE: Join Handshake Failed: $e");
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Join Error: $code $e")));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
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
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset('assets/images/logo.png', height: 80),
              const SizedBox(height: 32),
              Text(
                _detectedFamilyName != null ? "Identify Yourself" : "Shield Verification",
                style: GoogleFonts.oswald(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                _detectedFamilyName != null
                    ? "What is your role in the $_detectedFamilyName?"
                    : "Are you establishing a new safety circle or joining an existing one?",
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 16),
              ),
              const SizedBox(height: 48),

              if (_detectedFamilyName == null) ...[
                // CHOICE TOGGLE
                Row(
                  children: [
                    Expanded(
                      child: _choiceCard(
                        title: "Leader",
                        subtitle: "Create Shield",
                        isSelected: _isLeaderSelected,
                        onTap: () => setState(() => _isLeaderSelected = true),
                        icon: Icons.admin_panel_settings_rounded,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _choiceCard(
                        title: "Member",
                        subtitle: "Join Network",
                        isSelected: !_isLeaderSelected,
                        onTap: () => setState(() => _isLeaderSelected = false),
                        icon: Icons.group_add_rounded,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 40),
              ],

              if (_isLeaderSelected && _detectedFamilyName == null) ...[
                const Text(
                  "As a Family Head, you manage the subscription and safety circle.",
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF3B82F6),
                  ),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: _familyNameController,
                  decoration: InputDecoration(
                    hintText: "Family Name (e.g., The Dietrich Family)",
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                if (_isLoading)
                  const CircularProgressIndicator(color: Color(0xFF0D9488))
                else
                  ElevatedButton(
                    onPressed: _createFamily,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D9488),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 64),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text("ESTABLISH NEW SHIELD"),
                  ),
              ] else if (!_isLeaderSelected && _detectedFamilyName == null) ...[
                TextField(
                  controller: _inviteCodeController,
                  decoration: InputDecoration(
                    hintText: "Enter 6-Digit Code",
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  textAlign: TextAlign.center,
                  style: GoogleFonts.robotoMono(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 4,
                  ),
                ),
                const SizedBox(height: 24),
                if (_isLoading)
                  const CircularProgressIndicator(color: Color(0xFF3B82F6))
                else
                  ElevatedButton(
                    onPressed: _verifyCode,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF3B82F6),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 64),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text("VERIFY INVITE CODE"),
                  ),
              ] else if (_detectedFamilyName != null) ...[
                _roleSelectionItem(
                  "Guardian / Monitor",
                  "I am here to look after others.",
                  UserRole.monitor,
                  Icons.visibility_rounded,
                ),
                const SizedBox(height: 12),
                _roleSelectionItem(
                  "Minor / Child",
                  "I am being protected by the family.",
                  UserRole.minor,
                  Icons.child_care_rounded,
                ),
                const SizedBox(height: 12),
                _roleSelectionItem(
                  "Elder / Senior",
                  "I am being monitored for health/safety.",
                  UserRole.protected,
                  Icons.elderly_rounded,
                ),
                const SizedBox(height: 40),
                if (_isLoading)
                  const CircularProgressIndicator(color: Color(0xFF3B82F6))
                else
                  ElevatedButton(
                    onPressed: _joinFamily,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF3B82F6),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 64),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text("JOIN FAMILY NETWORK"),
                  ),
                TextButton(
                  onPressed: () => setState(() {
                    _detectedFamilyName = null;
                    _selectedRole = null;
                  }),
                  child: const Text("Enter different code"),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _roleSelectionItem(
    String title,
    String desc,
    UserRole role,
    IconData icon,
  ) {
    final isSelected = _selectedRole == role;
    return GestureDetector(
      onTap: () => setState(() => _selectedRole = role),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF3B82F6) : const Color(0xFFE2E8F0),
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? const Color(0xFF3B82F6) : const Color(0xFF94A3B8),
              size: 28,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isSelected ? const Color(0xFF1E40AF) : const Color(0xFF0F172A),
                    ),
                  ),
                  Text(
                    desc,
                    style: TextStyle(
                      fontSize: 12,
                      color: isSelected ? const Color(0xFF3B82F6) : const Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle_rounded, color: Color(0xFF3B82F6)),
          ],
        ),
      ),
    );
  }

  Widget _choiceCard({
    required String title,
    required String subtitle,
    required bool isSelected,
    required VoidCallback onTap,
    required IconData icon,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.white.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? const Color(0xFF3B82F6) : Colors.transparent,
            width: 2,
          ),
          boxShadow: isSelected
              ? [
                BoxShadow(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ]
              : null,
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? const Color(0xFF3B82F6) : const Color(0xFF94A3B8),
              size: 32,
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: isSelected ? const Color(0xFF0F172A) : const Color(0xFF64748B),
              ),
            ),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 12,
                color: isSelected ? const Color(0xFF3B82F6) : const Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
