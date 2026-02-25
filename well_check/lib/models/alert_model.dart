enum AlertType {
  fall,
  speeding,
  heartRate,
  weather,
  inactivity,
  manual;

  String toJson() => name.replaceAllMapped(RegExp(r'[A-Z]'), (match) => '_${match.group(0)!.toLowerCase()}');

  static AlertType fromJson(String value) {
    final camelCase = value.replaceAllMapped(RegExp(r'_([a-z])'), (match) => match.group(1)!.toUpperCase());
    return AlertType.values.firstWhere((e) => e.name == camelCase);
  }
}

enum AlertSeverity {
  low,
  medium,
  high,
  critical;

  String toJson() => name;

  static AlertSeverity fromJson(String value) {
    return AlertSeverity.values.firstWhere((e) => e.name == value);
  }
}

class Alert {
  final String id;
  final String familyId;
  final String profileId;
  final AlertType type;
  final AlertSeverity severity;
  final String message;
  final Map<String, dynamic>? metadata;
  final bool isResolved;
  final DateTime createdAt;

  Alert({
    required this.id,
    required this.familyId,
    required this.profileId,
    required this.type,
    required this.severity,
    required this.message,
    this.metadata,
    this.isResolved = false,
    required this.createdAt,
  });

  factory Alert.fromJson(Map<String, dynamic> json) {
    return Alert(
      id: json['id'],
      familyId: json['family_id'],
      profileId: json['profile_id'],
      type: AlertType.fromJson(json['type']),
      severity: AlertSeverity.fromJson(json['severity']),
      message: json['message'],
      metadata: json['metadata'],
      isResolved: json['is_resolved'] ?? false,
      createdAt: DateTime.parse(json['created_at']).toUtc(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'family_id': familyId,
      'profile_id': profileId,
      'type': type.toJson(),
      'severity': severity.toJson(),
      'message': message,
      'metadata': metadata,
      'is_resolved': isResolved,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
