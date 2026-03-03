import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:developer' as developer;

class ConsentLogEntry {
  final String userId;
  final String permissionKey;
  final bool enabled;
  final DateTime timestamp;

  ConsentLogEntry({
    required this.userId,
    required this.permissionKey,
    required this.enabled,
    required this.timestamp,
  });
}

class ConsentLogNotifier extends Notifier<List<ConsentLogEntry>> {
  @override
  List<ConsentLogEntry> build() => [];

  void addEntry(String userId, String permissionKey, bool enabled) {
    final entry = ConsentLogEntry(
      userId: userId,
      permissionKey: permissionKey,
      enabled: enabled,
      timestamp: DateTime.now(),
    );
    state = [entry, ...state];
    developer.log(
      "AUDIT LOG | ${entry.timestamp} | User: $userId | Action: ${enabled ? 'GRANTED' : 'REVOKED'} | Permission: $permissionKey",
    );
  }
}

final consentLogProvider =
    NotifierProvider<ConsentLogNotifier, List<ConsentLogEntry>>(
      ConsentLogNotifier.new,
    );

// Service class to handle logging from within other services (using Ref)
class ConsentTracker {
  final Ref ref;
  ConsentTracker(this.ref);

  void logPermissionChange(String userId, String permissionKey, bool enabled) {
    ref
        .read(consentLogProvider.notifier)
        .addEntry(userId, permissionKey, enabled);
  }
}

final consentTrackerProvider = Provider<ConsentTracker>(
  (ref) => ConsentTracker(ref),
);
