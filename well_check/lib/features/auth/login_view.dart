import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:well_check/services/supabase_auth_service.dart';
import 'package:well_check/models/user_role.dart';

class LoginView extends ConsumerStatefulWidget {
  final String? inviteCode;
  const LoginView({super.key, this.inviteCode});

  @override
  ConsumerState<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends ConsumerState<LoginView> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _inviteController = TextEditingController();
  final _firstNameController = TextEditingController();
  bool _isLoading = false;
  bool _isSignUp = false;
  bool _isJoining = false;
  bool _showEmailVerification = false;

  @override
  void initState() {
    super.initState();
    if (widget.inviteCode != null) {
      _inviteController.text = widget.inviteCode!;
      _isJoining = true;
    }
  }

  Future<void> _handleAuth() async {
    setState(() => _isLoading = true);
    try {
      if (_isSignUp) {
        final targetRole = _isJoining ? UserRole.member.name : UserRole.familyHead.name;
        
        await ref.read(supabaseAuthProvider).signUp(
              _emailController.text.trim(),
              _passwordController.text.trim(),
              _firstNameController.text.trim(),
              targetRole,
            );
        if (mounted) {
          setState(() {
            _showEmailVerification = true;
          });
        }
      } else {
        await ref.read(supabaseAuthProvider).signIn(
              _emailController.text.trim(),
              _passwordController.text.trim(),
            );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "Auth Error: ${e.toString().replaceAll("Exception: ", "")}",
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleResend() async {
    setState(() => _isLoading = true);
    try {
      await ref
          .read(supabaseAuthProvider)
          .resendVerificationEmail(_emailController.text.trim());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Verification email resent!")),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Resend Error: ${e.toString()}")),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: _showEmailVerification
          ? _buildEmailVerificationView()
          : _buildLoginView(),
    );
  }

  Widget _buildEmailVerificationView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 80.0),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.mark_email_read_rounded,
              size: 100,
              color: Color(0xFF0D9488),
            ),
            const SizedBox(height: 24),
            Text(
              "CHECK YOUR EMAIL",
              style: GoogleFonts.oswald(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                letterSpacing: 2.0,
                color: const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              "We've sent a verification link to:\n${_emailController.text.trim()}",
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFF64748B),
                fontSize: 16,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 48),
            if (_isLoading)
              const CircularProgressIndicator(color: Color(0xFF0D9488))
            else ...[
              ElevatedButton(
                onPressed: _handleResend,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D9488),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 64),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text(
                  "RESEND VERIFICATION EMAIL",
                  style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => setState(() {
                  _showEmailVerification = false;
                  _isSignUp = false;
                }),
                child: const Text(
                  "Back to Login",
                  style: TextStyle(
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildLoginView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 80.0),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset('assets/images/logo.png', height: 100),
            const SizedBox(height: 24),
            Text(
              "WELL-CHECK",
              style: GoogleFonts.oswald(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                letterSpacing: 2.0,
                color: const Color(0xFF0F172A),
              ),
            ),
            Text(
              _isJoining ? "JOIN A FAMILY" : "Production Beta v1.0",
              style: const TextStyle(
                color: Color(0xFF0D9488),
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 48),

            if (_isSignUp) ...[
              _textField(
                _firstNameController,
                "First Name",
                Icons.person_rounded,
                false,
              ),
              const SizedBox(height: 16),
            ],

            _textField(
              _emailController,
              "Email Address",
              Icons.email_rounded,
              false,
            ),
            const SizedBox(height: 16),
            _textField(
              _passwordController,
              "Password",
              Icons.lock_rounded,
              true,
            ),

            if (_isJoining) ...[
              const SizedBox(height: 16),
              _textField(
                _inviteController,
                "6-Digit Invite Code",
                Icons.key_rounded,
                false,
              ),
            ],

            const SizedBox(height: 32),

            if (_isLoading)
              const CircularProgressIndicator(color: Color(0xFF0D9488))
            else
              ElevatedButton(
                onPressed: _handleAuth,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D9488),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 64),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Text(
                  _isJoining
                      ? "JOIN FAMILY CIRCLE"
                      : (_isSignUp
                            ? "CREATE SHIELD ACCOUNT"
                            : "SIGN IN TO SHIELD"),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
              ),

            const SizedBox(height: 24),
            if (!_isJoining)
              TextButton(
                onPressed: () => setState(() => _isSignUp = !_isSignUp),
                child: Text(
                  _isSignUp
                      ? "Already have an account? Sign In"
                      : "New family? Create a Shield Account",
                  style: const TextStyle(color: Color(0xFF64748B)),
                ),
              ),

            TextButton(
              onPressed: () => setState(() {
                _isJoining = !_isJoining;
                _isSignUp = false;
              }),
              child: Text(
                _isJoining ? "Back to Login" : "Joining a family? Enter Code",
                style: TextStyle(
                  color: _isJoining
                      ? const Color(0xFF64748B)
                      : const Color(0xFF0D9488),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _textField(
    TextEditingController controller,
    String hint,
    IconData icon,
    bool isPassword,
  ) {
    return TextField(
      controller: controller,
      obscureText: isPassword,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon, color: const Color(0xFF94A3B8)),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
      ),
    );
  }
}
