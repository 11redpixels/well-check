import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class AuthGateView extends ConsumerStatefulWidget {
  const AuthGateView({super.key});

  @override
  ConsumerState<AuthGateView> createState() => _AuthGateViewState();
}

class _AuthGateViewState extends ConsumerState<AuthGateView> {
  @override
  void initState() {
    super.initState();
    _authenticate();
  }

  Future<void> _authenticate() async {
    // Simulate biometric check
    await Future.delayed(const Duration(milliseconds: 1500));
    if (mounted) {
      context.go('/onboarding');
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF0F172A),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.face_unlock_rounded, color: Color(0xFF0D9488), size: 80),
            SizedBox(height: 24),
            Text(
              "Authenticating Shield...",
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
