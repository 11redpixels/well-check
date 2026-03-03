class ManagedDevice {
  final String id;
  final String familyId;
  final String assignedProfileId;
  final String deviceType;
  final String syncStatus;
  final DateTime lastPing;

  ManagedDevice({
    required this.id,
    required this.familyId,
    required this.assignedProfileId,
    required this.deviceType,
    required this.syncStatus,
    required this.lastPing,
  });

  factory ManagedDevice.fromJson(Map<String, dynamic> json) => ManagedDevice(
    id: json['id'],
    familyId: json['family_id'],
    assignedProfileId: json['assigned_profile_id'],
    deviceType: json['device_type'],
    syncStatus: json['sync_status'] ?? 'active',
    lastPing: DateTime.parse(json['last_ping']),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'family_id': familyId,
    'assigned_profile_id': assignedProfileId,
    'device_type': deviceType,
    'sync_status': syncStatus,
    'last_ping': lastPing.toIso8601String(),
  };
}
