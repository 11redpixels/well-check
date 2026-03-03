import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:developer' as developer;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/family_provider.dart';
import '../../providers/user_provider.dart';
import '../../widgets/guardian_card.dart';
import '../../widgets/notification_tray.dart';
import '../../models/user_role.dart';

class FamilyHeadView extends ConsumerWidget {
  const FamilyHeadView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final user = ref.watch(userProvider);
    final familyAsync = ref.watch(familyStreamProvider);
    final shieldSubtitle = ref.watch(shieldSubtitleProvider);
    final isAdmin = user.role == UserRole.familyHead;

    // LISTEN FOR NEW PENDING MEMBERS
    ref.listen(familyStreamProvider, (previous, next) {
      if (isAdmin && next.hasValue) {
        final prevPending =
            previous?.value?.where((m) => !m.isAuthorized).length ?? 0;
        final nextPending = next.value!.where((m) => !m.isAuthorized).length;

        if (nextPending > prevPending) {
          HapticFeedback.vibrate(); // DISTINCT VIBRATION FOR NEW MEMBER
          developer.log("SHIELD | New pending member detected.");
        }
      }
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: familyAsync.when(
        data: (members) {
          final priorityMembers = members
              .where((m) =>
                  (m.role == UserRole.protected || m.role == UserRole.minor) &&
                  m.isAuthorized)
              .toList();
          final monitors = members
              .where((m) => m.role == UserRole.monitor && m.isAuthorized)
              .toList();
          
          // VISIBILITY GUARD: Show ALL members who are NOT authorized, but EXCLUDE the Admin themselves
          final pendingMembers = members
              .where((m) => !m.isAuthorized && m.role != UserRole.familyHead)
              .toList();

          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(24, 80, 24, 140),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (isAdmin && pendingMembers.isNotEmpty) ...[
                  const Text(
                    "🛡️ ACTION REQUIRED: NEW MEMBERS",
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFD97706),
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ...pendingMembers.map(
                    (member) => _buildPendingCard(context, ref, member),
                  ),
                  const SizedBox(height: 32),
                  const Divider(color: Color(0xFFE2E8F0)),
                  const SizedBox(height: 32),
                ],

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Welcome back, ${user.firstName ?? 'User'}.",
                            style: theme.textTheme.displayLarge?.copyWith(
                              fontSize: 28,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(shieldSubtitle, style: theme.textTheme.bodyMedium),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    InkWell(
                      onTap: () => context.push('/notifications'),
                      borderRadius: BorderRadius.circular(18),
                      child: const NotificationTray(),
                    ),
                  ],
                ),

                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "PROTECTED MEMBERS",
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF94A3B8),
                        letterSpacing: 1.5,
                      ),
                    ),
                    if (isAdmin)
                      TextButton.icon(
                        onPressed: () =>
                            _showAddManagedMemberDialog(context, ref),
                        icon: const Icon(
                          Icons.person_add_rounded,
                          size: 16,
                          color: Color(0xFF0D9488),
                        ),
                        label: const Text(
                          "Add No-Phone Member",
                          style: TextStyle(
                            color: Color(0xFF0D9488),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 16),

                if (priorityMembers.isEmpty) _buildEmptyMembersState(context),

                ...priorityMembers.map(
                  (member) => Padding(
                    padding: const EdgeInsets.only(bottom: 24.0),
                    child: InkWell(
                      onTap: () {
                        if (member.role == UserRole.protected) {
                          context.push('/health-trends');
                        } else if (member.role == UserRole.minor) {
                          context.push('/driving');
                        }

                        if (member.isMedicationOverdue) {
                          _showMedicationIntervention(context, member.name);
                        }
                      },
                      child: GuardianCard(
                        id: member.id,
                        name: member.name,
                        role: member.status,
                        hr: member.hr,
                        bp: member.bp,
                        info: member.info,
                        auraColor: Color(int.parse(member.auraColor)),
                        avatarIcon: member.role == UserRole.protected
                            ? Icons.person_rounded
                            : member.role == UserRole.minor
                            ? Icons.face_rounded
                            : Icons.child_care_rounded,
                        avatarBg: Color(
                          int.parse(member.auraColor),
                        ).withValues(alpha: 0.1),
                        isSpeeding:
                            member.role == UserRole.minor &&
                            (member.currentSpeed ?? 0) > 75,
                        isMedicationOverdue: member.isMedicationOverdue,
                        isWaitingForResponse: member.isWaitingForResponse,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                                    const Text(
                                      "ACTIVE MONITORS",
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w900,
                                        color: Color(0xFF94A3B8),
                                        letterSpacing: 1.5,
                                      ),
                                    ),
                                    // PHASE 3: REMOTE MEDICATION ADJUSTMENT
                                    if (isAdmin)
                                      TextButton.icon(
                                        onPressed: () => _showAddScheduleDialog(context, ref),
                                        icon: const Icon(
                                          Icons.add_rounded,
                                          size: 16,
                                          color: Color(0xFF0D9488),
                                        ),
                                        label: const Text(
                                          "Add Schedule",
                                          style: TextStyle(
                                            color: Color(0xFF0D9488),
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),                const SizedBox(height: 16),

                ...monitors.map((member) {
                  final isWarning = member.hasWarning;

                  return InkWell(
                    onTap: isWarning
                        ? () => _showNightWatchPrompt(context, member.name)
                        : null,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: isWarning
                            ? Border.all(
                                color: const Color(
                                  0xFFF59E0B,
                                ).withValues(alpha: 0.3),
                                width: 1.5,
                              )
                            : null,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: const Color(0xFFF1F5F9),
                            child: Text(
                              member.name[0],
                              style: const TextStyle(
                                color: Color(0xFF64748B),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                member.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              Text(
                                member.status,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF94A3B8),
                                ),
                              ),
                            ],
                          ),
                          const Spacer(),
                          if (member.isWaitingForResponse)
                            const Icon(
                              Icons.hourglass_top_rounded,
                              color: Color(0xFF3B82F6),
                              size: 20,
                            )
                          else
                            IconButton(
                              onPressed: () {
                                HapticFeedback
                                    .lightImpact(); // LIGHT IMPACT for check-in
                                ref
                                    .read(familyProvider.notifier)
                                    .sendCheckIn(member.id);
                              },
                              icon: const Icon(
                                Icons.help_outline_rounded,
                                color: Color(0xFF94A3B8),
                                size: 20,
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                }),

                const SizedBox(height: 40),

                const Text(
                  "UPCOMING EVENTS",
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF94A3B8),
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 16),
                if (priorityMembers.isEmpty)
                  const Center(
                    child: Text(
                      "No upcoming clinical events.",
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                    ),
                  )
                else
                  ...priorityMembers.expand(
                    (m) => m.scheduledEvents.map(
                      (e) => _calendarCard(
                        e.time,
                        "${m.name}: ${e.title}",
                        Icons.event_note_rounded,
                        const Color(0xFF3B82F6),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text("Sync Error: $e")),
      ),
    );
  }

  Widget _calendarCard(String time, String title, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: Color(0xFF0F172A),
              ),
            ),
          ),
          Text(
            time,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 12,
              color: Color(0xFF94A3B8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingCard(BuildContext context, WidgetRef ref, FamilyMember member) {
    final displayName = member.name.isNotEmpty ? member.name : "New Member";
    final avatarLabel = displayName[0].toUpperCase();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: const Color(0xFFF59E0B).withValues(alpha: 0.1),
            child: Text(
              avatarLabel,
              style: const TextStyle(
                color: Color(0xFFF59E0B),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  displayName,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Color(0xFF0F172A),
                  ),
                ),
                Text(
                  "Requested Role: ${member.role.name.toUpperCase()}",
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFF59E0B),
                  ),
                ),
                const Text(
                  "Awaiting authorization",
                  style: TextStyle(fontSize: 12, color: Color(0xFF92400E)),
                ),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD97706),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              elevation: 0,
            ),
            onPressed: () async {
              HapticFeedback.mediumImpact();
              await ref
                  .read(familyProvider.notifier)
                  .authorizeMember(member.id);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text("$displayName authorized and stitched."),
                    backgroundColor: const Color(0xFF0D9488),
                  ),
                );
              }
            },
            child: const Text(
              "Authorize",
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  void _showAddScheduleDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final timeController = TextEditingController();
    final members = ref.read(familyProvider);
    final managed = members.where((m) => m.role == UserRole.protected).toList();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Remote Schedule Entry"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (managed.length > 1)
              const Text("Select member and enter details.")
            else if (managed.isEmpty)
              const Text("No protected members found to add schedules for."),
            const SizedBox(height: 16),
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                hintText: "Event (e.g. Doctor Visit)",
              ),
            ),
            TextField(
              controller: timeController,
              decoration: const InputDecoration(
                hintText: "Time (e.g. 3:00 PM)",
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          if (managed.isNotEmpty)
            ElevatedButton(
              onPressed: () {
                ref
                    .read(familyProvider.notifier)
                    .addScheduledEvent(
                      managed.first.id,
                      nameController.text,
                      timeController.text,
                    );
                Navigator.pop(context);
              },
              child: const Text("Add"),
            ),
        ],
      ),
    );
  }

  Widget _buildEmptyMembersState(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF3B82F6).withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.shield_rounded,
              color: Color(0xFF3B82F6),
              size: 40,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            "Secure Your Family",
            style: TextStyle(
              fontWeight: FontWeight.w900,
              fontSize: 20,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            "Add members to start clinical monitoring, location tracking, and emergency alerts.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: Color(0xFF64748B), height: 1.4),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3B82F6),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 56),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 0,
            ),
            onPressed: () => context.push('/invite-family'),
            icon: const Icon(Icons.person_add_rounded),
            label: const Text(
              "Invite Member",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  void _showAddManagedMemberDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    UserRole selectedRole = UserRole.protected;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text("Add Managed Member"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "For members without a phone (e.g. Children or Elders).",
                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 24),
              TextField(
                controller: nameController,
                decoration: const InputDecoration(hintText: "First Name"),
              ),
              const SizedBox(height: 16),
              DropdownButton<UserRole>(
                value: selectedRole,
                isExpanded: true,
                items: [
                  const DropdownMenuItem(
                    value: UserRole.protected,
                    child: Text("Protected (Elderly)"),
                  ),
                  const DropdownMenuItem(
                    value: UserRole.minor,
                    child: Text("Minor (Child)"),
                  ),
                ],
                onChanged: (val) => setState(() => selectedRole = val!),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: () {
                if (nameController.text.isNotEmpty) {
                  ref
                      .read(familyProvider.notifier)
                      .addManagedMember(nameController.text, selectedRole);
                  Navigator.pop(context);
                }
              },
              child: const Text("Add to Shield"),
            ),
          ],
        ),
      ),
    );
  }

  void _showMedicationIntervention(BuildContext context, String name) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(
          "Intervention: $name",
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        content: Text(
          "$name missed a medication check-in. How would you like to proceed?",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              "Remind Again",
              style: TextStyle(color: Color(0xFF64748B)),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF59E0B),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onPressed: () => Navigator.pop(context),
            child: Text("Call $name"),
          ),
        ],
      ),
    );
  }

  void _showNightWatchPrompt(BuildContext context, String name) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(
          "$name: Safety Alert",
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        content: Text(
          "$name is currently in an unusual area. Would you like to check in?",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              "Request Location Update",
              style: TextStyle(color: Color(0xFF3B82F6)),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0D9488),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onPressed: () => Navigator.pop(context),
            child: const Text("Quick Call"),
          ),
        ],
      ),
    );
  }
}
