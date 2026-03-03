import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class DailyCheckinsView extends StatelessWidget {
  const DailyCheckinsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(24, 80, 24, 120),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  "AI Conversations",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            _transcriptBlock("Today, 12:05 PM", [
              _chatBubble("Did you take your 12:00 PM dose?", isAI: true),
              _chatBubble("Yes, I took it just now.", isAI: false),
              _chatBubble("Great. How are you feeling overall?", isAI: true),
              _chatBubble("Feeling good today, thank you.", isAI: false),
            ]),

            const SizedBox(height: 32),

            _transcriptBlock("Today, 8:10 AM", [
              _chatBubble("Good morning. Time for your check-in.", isAI: true),
              _chatBubble("Confirmed. I've taken it.", isAI: false),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _transcriptBlock(String time, List<Widget> messages) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 12, bottom: 12),
          child: Text(
            time,
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(children: messages),
        ),
      ],
    );
  }

  Widget _chatBubble(String text, {required bool isAI}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 14,
            backgroundColor: isAI
                ? const Color(0xFF0D9488).withValues(alpha: 0.1)
                : const Color(0xFF3B82F6).withValues(alpha: 0.1),
            child: Icon(
              isAI ? Icons.auto_awesome_rounded : Icons.person_rounded,
              size: 14,
              color: isAI ? const Color(0xFF0D9488) : const Color(0xFF3B82F6),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAI ? "AI ASSISTANT" : "MEMBER",
                  style: TextStyle(
                    color: isAI
                        ? const Color(0xFF0D9488)
                        : const Color(0xFF3B82F6),
                    fontWeight: FontWeight.w900,
                    fontSize: 10,
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  text,
                  style: const TextStyle(
                    color: Color(0xFF334155),
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
