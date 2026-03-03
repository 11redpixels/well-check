import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class PrivacyPolicyView extends StatelessWidget {
  const PrivacyPolicyView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Privacy Policy")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Text(
          "We prioritize the privacy of your Family. \n\n- No health data is sold to third parties. \n- Location history is encrypted and auto-purged after 90 days. \n- Biometric data never leaves your device.",
          style: GoogleFonts.openSans(fontSize: 14, height: 1.6),
        ),
      ),
    );
  }
}
