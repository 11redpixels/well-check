import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:well_check/models/user_role.dart';
import 'package:well_check/providers/user_provider.dart';

class FamilySetupView extends ConsumerStatefulWidget {
  const FamilySetupView({super.key});

  @override
  ConsumerState<FamilySetupView> createState() => _FamilySetupViewState();
}

class _FamilySetupViewState extends ConsumerState<FamilySetupView> {
  final _familyNameController = TextEditingController();
  bool _isLoading = false;

  String _generateInviteCode() {
    const chars =
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars like 0/O or 1/I
    return List.generate(
      6,
      (index) => chars[Random().nextInt(chars.length)],
    ).join();
  }

  Future<void> _createFamily() async {
    final name = _familyNameController.text.trim();
    if (name.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final inviteCode = _generateInviteCode();

      // 1. Create Family Entry
      final familyResponse = await Supabase.instance.client
          .from('families')
          .insert({
            'name': name,
            'invite_code': inviteCode,
            'admin_id': user.id,
          })
          .select()
          .single();

      final familyId = familyResponse['id'];

      // 2. Update User Auth Metadata
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(data: {'family_id': familyId}),
      );

      // 3. Create initial Admin Profile
      await Supabase.instance.client.from('profiles').insert({
        'auth_id': user.id,
        'family_id': familyId,
        'role': UserRole.familyHead.id,
        'first_name': user.userMetadata?['first_name'] ?? 'Admin',
        'is_managed': false,
      });

      // 4. Update Local State Immediately
      // This forces the GoRouter redirect logic to re-evaluate with the new familyId
      ref.read(userProvider.notifier).setRole(
            UserRole.familyHead,
            id: user.id,
            familyId: familyId,
            firstName: user.userMetadata?['first_name'] ?? 'Admin',
          );

      // Local state will be updated by the router's redirect listener
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Hero(
                tag: 'logo',
                child: Image.asset(
                  'assets/images/logo.png',
                  height: 120,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                "Establish Your Shield",
                style: GoogleFonts.oswald(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                "Give your family safety circle a name to begin.",
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF64748B), fontSize: 16),
              ),
              const SizedBox(height: 48),
              TextField(
                controller: _familyNameController,
                decoration: InputDecoration(
                  hintText: "e.g., The Dietrich Family",
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.all(20),
                ),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 32),
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
                  child: const Text(
                    "CREATE FAMILY SHIELD",
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
