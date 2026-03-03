import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:well_check/providers/user_provider.dart';

class CurrentFamily {
  final String id;
  final String name;
  final String adminId;
  final String inviteCode;

  CurrentFamily({
    required this.id,
    required this.name,
    required this.adminId,
    required this.inviteCode,
  });

  factory CurrentFamily.fromJson(Map<String, dynamic> json) => CurrentFamily(
    id: json['id'],
    name: json['name'],
    adminId: json['admin_id'],
    inviteCode: json['invite_code'] ?? '------',
  );
}

final currentFamilyProvider = FutureProvider<CurrentFamily?>((ref) async {
  final user = ref.watch(userProvider);
  if (user.familyId == null) return null;

  // FETCH FRESH DATA: Ensure no caching of old family names
  final response = await Supabase.instance.client
      .from('families')
      .select()
      .eq('id', user.familyId!)
      .single();

  return CurrentFamily.fromJson(response);
});
