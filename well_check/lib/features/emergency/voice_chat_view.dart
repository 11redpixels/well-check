import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:well_check/services/emergency_voice_service.dart';
import 'package:well_check/providers/user_provider.dart';

class VoiceChatView extends ConsumerStatefulWidget {
  const VoiceChatView({super.key});

  @override
  ConsumerState<VoiceChatView> createState() => _VoiceChatViewState();
}

class _VoiceChatViewState extends ConsumerState<VoiceChatView> {
  final bool _isRecording = true;
  bool _consentGranted = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _showConsentPopup());
  }

  void _showConsentPopup() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text("Two-Party Consent Required"),
        content: const Text(
          "This emergency audio bridge is being recorded and encrypted using AES-256 for the Shield Vault. Proceed?",
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              setState(() => _consentGranted = true);
              final userId = ref.read(userProvider).id ?? 'anonymous';
              ref.read(emergencyVoiceProvider).startRecording(userId);
              Navigator.pop(context);
            },
            child: const Text("I CONSENT"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 48),
            Text(
              "EMERGENCY VOICE BRIDGE",
              style: GoogleFonts.oswald(
                color: Colors.white,
                fontSize: 24,
                letterSpacing: 2,
              ),
            ),
            const Spacer(),
            if (_isRecording) _recordingIndicator(),
            const Spacer(),
            _audioControls(),
          ],
        ),
      ),
    );
  }

  Widget _recordingIndicator() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.red.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.circle, color: Colors.red, size: 12),
              SizedBox(width: 8),
              Text(
                "REC • AES-256 ENCRYPTED",
                style: TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 48),
        const Icon(Icons.mic_rounded, color: Color(0xFF0D9488), size: 100),
      ],
    );
  }

  Widget _audioControls() {
    return Padding(
      padding: const EdgeInsets.all(40.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(
              Icons.call_end_rounded,
              color: Colors.red,
              size: 64,
            ),
          ),
        ],
      ),
    );
  }
}
