import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class TermsOfServiceView extends StatelessWidget {
  const TermsOfServiceView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Terms of Service")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Text(
          "1. HEALTH DATA PRIVACY\nBy using the Well-Check Shield, you acknowledge that vital signs and clinical health data are tracked for safety purposes...\n\n2. LOCATION TRACKING\nBackground location is required for the Safe Zone Watchdog to function correctly...\n\n3. LIABILITY\nWell-Check is a monitoring tool and not a replacement for professional medical emergency services.",
          style: GoogleFonts.openSans(fontSize: 14, height: 1.6),
        ),
      ),
    );
  }
}
