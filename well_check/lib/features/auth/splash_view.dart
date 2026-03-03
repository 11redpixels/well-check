import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/theme/app_theme.dart';
import 'package:well_check/providers/user_provider.dart';

class SplashView extends ConsumerStatefulWidget {
  const SplashView({super.key});

  @override
  ConsumerState<SplashView> createState() => _SplashViewState();
}

class _SplashViewState extends ConsumerState<SplashView> {
  @override
  void initState() {
    super.initState();
    _startBoot();
  }

  Future<void> _startBoot() async {
    // Show splash for 2 seconds
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      ref.read(userProvider.notifier).setBooted();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.splashGradient),
        child: const Center(
          child: Icon(Icons.shield_rounded, color: Colors.white, size: 120),
        ),
      ),
    );
  }
}
