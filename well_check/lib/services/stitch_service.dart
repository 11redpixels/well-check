import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/family_provider.dart';
import '../models/user_role.dart';

class StitchService {
  // THE STITCH PROTOCOL (Mock API)
  // Now generic: provides simulated real-time updates for any member list.

  Stream<List<FamilyMember>> listenToFamilyStatus(
    List<FamilyMember> currentMembers,
  ) async* {
    while (true) {
      await Future.delayed(const Duration(seconds: 15));

      yield currentMembers.map((m) {
        // Randomly nudge some stats for simulation
        if (m.role == UserRole.protected) {
          return m.copyWith(
            hr: (70 + (DateTime.now().second % 10)).toString(),
            lastUpdated: DateTime.now(),
          );
        }
        return m;
      }).toList();
    }
  }
}

final stitchProvider = StreamProvider<List<FamilyMember>>((ref) {
  final members = ref.watch(familyProvider);
  return StitchService().listenToFamilyStatus(members);
});
