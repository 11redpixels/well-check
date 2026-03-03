import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import 'dart:async';
import 'package:well_check/models/user_role.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:well_check/models/managed_device.dart';

import 'package:well_check/services/logger_service.dart';

class ScheduledEvent {
  final String title;
  final String time;
  ScheduledEvent({required this.title, required this.time});

  Map<String, dynamic> toJson() => {'title': title, 'time': time};
  factory ScheduledEvent.fromJson(Map<String, dynamic> json) =>
      ScheduledEvent(title: json['title'], time: json['time']);
}

class Prescription {
  final String? id;
  final String name;
  final String schedule;
  final String dosage;
  Prescription({
    this.id,
    required this.name,
    required this.schedule,
    required this.dosage,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'schedule': schedule,
    'dosage': dosage,
  };
  factory Prescription.fromJson(Map<String, dynamic> json) => Prescription(
    id: json['id'],
    name: json['name'],
    schedule: json['schedule'],
    dosage: json['dosage'],
  );
}

class FamilyMember {
  final String id;
  final String name;
  final UserRole role;
  final String status;
  final String hr;
  final String bp;
  final String info;
  final String auraColor;
  final bool hasWarning;
  final String? warningType;
  final int? currentSpeed;
  final bool isOnCampus;
  final bool isHome;
  final bool isMedicationOverdue;
  final List<String> medicationsTaken;
  final List<Prescription> prescriptions;
  final int batteryLevel;
  final String gpsAccuracy;
  final DateTime lastUpdated;
  final bool isWaitingForResponse;
  final List<Offset> breadcrumbs;
  final bool isErraticDriving;
  final List<ScheduledEvent> scheduledEvents;
  final String? lastVoiceNote;
  final bool isCriticalFeedback;
  final bool isHardwareDisconnected;
  final double humidity;
  final String dataSource;
  final int? moodScore;
  final bool isFallDetected;
  final int? phq2Score;
  final List<ManagedDevice> managedDevices;
  final bool isAuthorized;
  final String? subRole;

  FamilyMember({
    required this.id,
    required this.name,
    required this.role,
    required this.status,
    this.hr = '',
    this.bp = '',
    this.info = '',
    this.auraColor = '0xFF0D9488',
    this.hasWarning = false,
    this.warningType,
    this.currentSpeed,
    this.isOnCampus = true,
    this.isHome = false,
    this.isMedicationOverdue = false,
    this.medicationsTaken = const [],
    this.prescriptions = const [],
    this.batteryLevel = 100,
    this.gpsAccuracy = 'High',
    required this.lastUpdated,
    this.isWaitingForResponse = false,
    this.breadcrumbs = const [],
    this.isErraticDriving = false,
    this.scheduledEvents = const [],
    this.lastVoiceNote,
    this.isCriticalFeedback = false,
    this.isHardwareDisconnected = false,
    this.humidity = 45.0,
    this.dataSource = 'Phone Sensor',
    this.moodScore,
    this.isFallDetected = false,
    this.phq2Score,
    this.managedDevices = const [],
    this.isAuthorized = false,
    this.subRole,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'role': role.id,
    'status': status,
    'hr': hr,
    'bp': bp,
    'info': info,
    'auraColor': auraColor,
    'hasWarning': hasWarning,
    'warningType': warningType,
    'currentSpeed': currentSpeed,
    'isOnCampus': isOnCampus,
    'isHome': isHome,
    'isMedicationOverdue': isMedicationOverdue,
    'medicationsTaken': medicationsTaken,
    'prescriptions': prescriptions.map((p) => p.toJson()).toList(),
    'batteryLevel': batteryLevel,
    'gpsAccuracy': gpsAccuracy,
    'lastUpdated': lastUpdated.toIso8601String(),
    'isWaitingForResponse': isWaitingForResponse,
    'isErraticDriving': isErraticDriving,
    'scheduledEvents': scheduledEvents.map((e) => e.toJson()).toList(),
    'lastVoiceNote': lastVoiceNote,
    'isCriticalFeedback': isCriticalFeedback,
    'isHardwareDisconnected': isHardwareDisconnected,
    'humidity': humidity,
    'dataSource': dataSource,
    'moodScore': moodScore,
    'isFallDetected': isFallDetected,
    'phq2Score': phq2Score,
    'managedDevices': managedDevices.map((d) => d.toJson()).toList(),
    'is_authorized': isAuthorized,
    'sub_role': subRole,
  };

  factory FamilyMember.fromJson(Map<String, dynamic> json) => FamilyMember(
    id: json['id'],
    name: json['first_name'],
    role: UserRole.values.firstWhere(
      (e) => e.name == json['role'],
      orElse: () => UserRole.monitor,
    ),
    status:
        json['status'] ??
        (json['is_managed'] == true ? 'Managed Member' : 'Active'),
    hr: json['hr'] ?? '',
    bp: json['bp'] ?? '',
    info: json['info'] ?? '',
    auraColor: json['aura_color'] ?? '0xFF0D9488',
    hasWarning: json['has_warning'] ?? false,
    warningType: json['warning_type'],
    currentSpeed: json['current_speed'],
    isOnCampus: json['is_on_campus'] ?? true,
    isHome: json['is_home'] ?? false,
    isMedicationOverdue: json['is_medication_overdue'] ?? false,
    medicationsTaken: List<String>.from(json['medications_taken'] ?? []),
    prescriptions: (json['prescriptions'] as List? ?? [])
        .map((p) => Prescription.fromJson(p))
        .toList(),
    batteryLevel: json['battery_level'] ?? 100,
    gpsAccuracy: json['gps_accuracy'] ?? 'High',
    lastUpdated: json['last_updated'] != null
        ? DateTime.parse(json['last_updated'])
        : DateTime.now(),
    isWaitingForResponse: json['is_waiting_for_response'] ?? false,
    isErraticDriving: json['is_erratic_driving'] ?? false,
    scheduledEvents: (json['scheduled_events'] as List? ?? [])
        .map((e) => ScheduledEvent.fromJson(e))
        .toList(),
    lastVoiceNote: json['last_voice_note'],
    isCriticalFeedback: json['is_critical_feedback'] ?? false,
    isHardwareDisconnected: json['is_hardware_disconnected'] ?? false,
    humidity: json['humidity'] ?? 45.0,
    dataSource: json['data_source'] ?? 'Phone Sensor',
    moodScore: json['mood_score'],
    isFallDetected: json['is_fall_detected'] ?? false,
    phq2Score: json['phq_score'], // PHQ-2 score usually stored as phq_score or similar
    managedDevices: (json['managed_devices'] as List? ?? [])
        .map((d) => ManagedDevice.fromJson(d))
        .toList(),
    isAuthorized: json['is_authorized'] ?? false,
    subRole: json['sub_role'],
  );

  FamilyMember copyWith({
    String? status,
    String? hr,
    String? bp,
    String? info,
    String? auraColor,
    bool? hasWarning,
    String? warningType,
    int? currentSpeed,
    bool? isOnCampus,
    bool? isHome,
    bool? isMedicationOverdue,
    List<String>? medicationsTaken,
    List<Prescription>? prescriptions,
    int? batteryLevel,
    String? gpsAccuracy,
    DateTime? lastUpdated,
    bool? isWaitingForResponse,
    List<Offset>? breadcrumbs,
    bool? isErraticDriving,
    List<ScheduledEvent>? scheduledEvents,
    String? lastVoiceNote,
    bool? isCriticalFeedback,
    bool? isHardwareDisconnected,
    double? humidity,
    String? dataSource,
    int? moodScore,
    bool? isFallDetected,
    int? phq2Score,
    List<ManagedDevice>? managedDevices,
    bool? isAuthorized,
    String? subRole,
  }) {
    return FamilyMember(
      id: id,
      name: name,
      role: role,
      status: status ?? this.status,
      hr: hr ?? this.hr,
      bp: bp ?? this.bp,
      info: info ?? this.info,
      auraColor: auraColor ?? this.auraColor,
      hasWarning: hasWarning ?? this.hasWarning,
      warningType: warningType ?? this.warningType,
      currentSpeed: currentSpeed ?? this.currentSpeed,
      isOnCampus: isOnCampus ?? this.isOnCampus,
      isHome: isHome ?? this.isHome,
      isMedicationOverdue: isMedicationOverdue ?? this.isMedicationOverdue,
      medicationsTaken: medicationsTaken ?? this.medicationsTaken,
      prescriptions: prescriptions ?? this.prescriptions,
      batteryLevel: batteryLevel ?? this.batteryLevel,
      gpsAccuracy: gpsAccuracy ?? this.gpsAccuracy,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      isWaitingForResponse: isWaitingForResponse ?? this.isWaitingForResponse,
      breadcrumbs: breadcrumbs ?? this.breadcrumbs,
      isErraticDriving: isErraticDriving ?? this.isErraticDriving,
      scheduledEvents: scheduledEvents ?? this.scheduledEvents,
      lastVoiceNote: lastVoiceNote ?? this.lastVoiceNote,
      isCriticalFeedback: isCriticalFeedback ?? this.isCriticalFeedback,
      isHardwareDisconnected:
          isHardwareDisconnected ?? this.isHardwareDisconnected,
      humidity: humidity ?? this.humidity,
      dataSource: dataSource ?? this.dataSource,
      moodScore: moodScore ?? this.moodScore,
      isFallDetected: isFallDetected ?? this.isFallDetected,
      phq2Score: phq2Score ?? this.phq2Score,
      managedDevices: managedDevices ?? this.managedDevices,
      isAuthorized: isAuthorized ?? this.isAuthorized,
      subRole: subRole ?? this.subRole,
    );
  }
}

class VoiceLogNotifier extends Notifier<List<String>> {
  @override
  List<String> build() => [];
  void addLog(String log) => state = [...state, log];
}

final voiceLogProvider = NotifierProvider<VoiceLogNotifier, List<String>>(
  VoiceLogNotifier.new,
);

final familyStreamProvider = StreamProvider<List<FamilyMember>>((ref) {
  final user = ref.watch(userProvider);
  if (user.familyId == null) return Stream.value([]);

  return Supabase.instance.client
      .from('profiles')
      .stream(primaryKey: ['id'])
      .eq('family_id', user.familyId!)
      .asyncMap((data) async {
        final members = <FamilyMember>[];
        for (final m in data) {
          final medsData = await Supabase.instance.client
              .from('medications')
              .select()
              .eq('profile_id', m['id']);

          final prescriptions = (medsData as List)
              .map((p) => Prescription.fromJson(p))
              .toList();
          members.add(
            FamilyMember.fromJson(m).copyWith(prescriptions: prescriptions),
          );
        }
        return members;
      });
});

class FamilyNotifier extends Notifier<List<FamilyMember>> {
  StreamSubscription? _familySubscription;

  @override
  List<FamilyMember> build() {
    final user = ref.watch(userProvider);
    if (user.familyId != null) {
      _listenToFamilyUpdates(user.familyId!);
    }
    return [];
  }

  void _listenToFamilyUpdates(String familyId) {
    _familySubscription?.cancel();
    _familySubscription = Supabase.instance.client
        .from('profiles')
        .stream(primaryKey: ['id'])
        .eq('family_id', familyId)
        .listen((data) async {
          final members = <FamilyMember>[];
          for (final m in data) {
            // Fetch medications for each member
            final medsData = await Supabase.instance.client
                .from('medications')
                .select()
                .eq('profile_id', m['id']);

            final prescriptions = (medsData as List)
                .map((p) => Prescription.fromJson(p))
                .toList();
            members.add(
              FamilyMember.fromJson(m).copyWith(prescriptions: prescriptions),
            );
          }
          state = members;
        });
  }

  Future<void> authorizeMember(String memberId) async {
    await Supabase.instance.client
        .from('profiles')
        .update({
          'status': 'Active',
          'is_authorized': true,
          'last_updated': DateTime.now().toIso8601String(),
        })
        .eq('id', memberId);
  }

  Future<void> updateMemberStatus(
    String profileId,
    String status, {
    String? auraColor,
  }) async {
    await Supabase.instance.client
        .from('profiles')
        .update({
          'status': status,
          'aura_color': ?auraColor,
          'last_updated': DateTime.now().toIso8601String(),
        })
        .eq('id', profileId);
  }

  Future<void> addManagedMember(String firstName, UserRole role) async {
    final user = ref.read(userProvider);
    if (user.familyId == null) return;

    await Supabase.instance.client.from('profiles').insert({
      'family_id': user.familyId,
      'first_name': firstName,
      'role': role.name,
      'is_managed': true,
    });
  }

  Future<void> markMedicationTaken(
    String profileId,
    String medicationId, {
    bool viaVoice = false,
  }) async {
    if (viaVoice) {
      ref
          .read(voiceLogProvider.notifier)
          .addLog("Member $profileId: Medication confirmed via voice");
      ShieldLogger.clinical(
        "MEDICATION",
        "Voice confirmation for member $profileId",
        isSensitive: false,
      );
    }

    await Supabase.instance.client.from('medication_logs').insert({
      'profile_id': profileId,
      'medication_id': medicationId,
      'method': viaVoice ? 'voice' : 'button',
    });
  }

  Future<void> addPrescription(
    String profileId,
    String name,
    String schedule,
    String dosage,
  ) async {
    final user = ref.read(userProvider);
    await Supabase.instance.client.from('medications').insert({
      'profile_id': profileId,
      'family_id': user.familyId,
      'name': name,
      'schedule': schedule,
      'dosage': dosage,
    });
  }

  Future<void> triggerAlert(
    String profileId,
    String type,
    String message,
    String severity,
  ) async {
    final user = ref.read(userProvider);
    await Supabase.instance.client.from('alerts').insert({
      'profile_id': profileId,
      'family_id': user.familyId,
      'type': type,
      'message': message,
      'severity': severity,
    });
  }

  Future<void> logVitals(String profileId, String hr, String bp) async {
    await Supabase.instance.client.from('vitals_log').insert({
      'profile_id': profileId,
      'heart_rate': hr,
      'blood_pressure': bp,
    });
  }

  Future<void> updateMood(String profileId, int score) async {
    final isStressed = score <= 2;
    await updateMemberStatus(
      profileId,
      isStressed ? 'EMOTIONAL DISTRESS' : 'Stable',
      auraColor: isStressed ? '0xFFF59E0B' : '0xFF0D9488',
    );
    // Also log vitals or mood separately if needed
  }

  Future<void> setPHQ2Score(String profileId, int score) async {
    // Write-back to a specific field or vitals_log
    await Supabase.instance.client
        .from('profiles')
        .update({'status': 'PHQ-2 Scored: $score'})
        .eq('id', profileId);
  }

  Future<void> joinFamily(String inviteCode, UserRole selectedRole) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    final family = await Supabase.instance.client
        .from('families')
        .select()
        .eq('invite_code', inviteCode.toUpperCase())
        .maybeSingle();

    if (family == null) {
      throw Exception("Invalid or expired invite code.");
    }

    final familyId = family['id'];

    await Supabase.instance.client.auth.updateUser(
      UserAttributes(
        data: {
          'family_id': familyId,
          'role': UserRole.member.name, // PRIMARY ROLE LOCKDOWN
          'sub_role': selectedRole.name,
          'is_authorized': false,
        },
      ),
    );

    // SAFE UPDATE: Ensure joining members NEVER overwrite the existing Family Head
    await Supabase.instance.client.from('profiles').upsert({
      'auth_id': user.id,
      'family_id': familyId,
      'role': UserRole.member.name, // FORCE MEMBER ROLE
      'sub_role': selectedRole.name, // STORE SUB-ROLE
      'first_name': user.userMetadata?['first_name'] ?? 'Member',
      'is_managed': false,
      'is_authorized': false,
      'status': 'Pending',
    }, onConflict: 'auth_id');
  }

  Future<void> sendCheckIn(String memberId) async {
    await updateMemberStatus(
      memberId,
      'CHECK-IN REQUESTED',
      auraColor: '0xFF3B82F6',
    );
    await Supabase.instance.client
        .from('profiles')
        .update({'is_waiting_for_response': true})
        .eq('id', memberId);
  }

  Future<void> resolveCheckIn(String memberId) async {
    await Supabase.instance.client
        .from('profiles')
        .update({'is_waiting_for_response': false})
        .eq('id', memberId);
  }

  Future<void> addScheduledEvent(
    String memberId,
    String name,
    String time,
  ) async {
    try {
      await Supabase.instance.client.from('scheduled_events').insert({
        'profile_id': memberId,
        'title': name,
        'time': time,
      });
    } catch (e) {
      ShieldLogger.clinical(
        "EVENT",
        "Failed to add scheduled event: $e",
        isSensitive: false,
      );
      // Stubbing for UI stability if table doesn't exist
      await updateMemberStatus(memberId, 'Event Added: $name at $time');
    }
  }

  Future<void> updateMember(
    String memberId,
    FamilyMember Function(FamilyMember) updateLogic,
  ) async {
    final member = state.firstWhere((m) => m.id == memberId);
    final updated = updateLogic(member);

    await Supabase.instance.client
        .from('profiles')
        .update({
          'status': updated.status,
          'info': updated.info,
          'aura_color': updated.auraColor,
        })
        .eq('id', memberId);
  }

  Future<void> setVoiceNote(
    String memberId,
    String text, {
    bool isCritical = false,
  }) async {
    await Supabase.instance.client
        .from('profiles')
        .update({
          'last_voice_note': text,
          'is_critical_feedback': isCritical,
          if (isCritical) 'status': 'CRITICAL VOICE FEEDBACK',
          if (isCritical) 'aura_color': '0xFFFF4444',
        })
        .eq('id', memberId);
  }

  void loadSampleData() {}
}

final familyProvider = NotifierProvider<FamilyNotifier, List<FamilyMember>>(
  FamilyNotifier.new,
);

final shieldSubtitleProvider = Provider<String>((ref) {
  final members = ref.watch(familyProvider);
  if (members.isEmpty) return "Family Shield initializing...";

  final activeMembers = members.where((m) => m.isAuthorized).toList();
  if (activeMembers.isEmpty) return "Awaiting member activation...";

  final allHome = activeMembers.every((m) => m.isHome);
  return allHome ? "All family members are home" : "The Shield is active";
});
