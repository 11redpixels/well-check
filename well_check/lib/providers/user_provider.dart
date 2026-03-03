import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/models/user_role.dart';

class UserState {
  final String? id;
  final String? familyId;
  final String? firstName;
  final UserRole role;
  final String? subRole;
  final bool isAuthenticated;
  final bool isLocked;
  final bool isAuthorized;
  final bool isBooted; // Added for V46.1 stable boot

  UserState({
    this.id,
    this.familyId,
    this.firstName,
    required this.role,
    this.subRole,
    required this.isAuthenticated,
    this.isLocked = false,
    this.isAuthorized = false,
    this.isBooted = false,
  });

  UserState copyWith({
    String? id,
    String? familyId,
    String? firstName,
    UserRole? role,
    String? subRole,
    bool? isAuthenticated,
    bool? isLocked,
    bool? isAuthorized,
    bool? isBooted,
  }) {
    return UserState(
      id: id ?? this.id,
      familyId: familyId ?? this.familyId,
      firstName: firstName ?? this.firstName,
      role: role ?? this.role,
      subRole: subRole ?? this.subRole,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLocked: isLocked ?? this.isLocked,
      isAuthorized: isAuthorized ?? this.isAuthorized,
      isBooted: isBooted ?? this.isBooted,
    );
  }
}

class UserNotifier extends Notifier<UserState> {
  @override
  UserState build() {
    return UserState(
      role: UserRole.none,
      isAuthenticated: false,
      isLocked: false,
      isAuthorized: false,
      isBooted: false,
    );
  }

  void setBooted() => state = state.copyWith(isBooted: true);

  void setRole(
    UserRole role, {
    String? id,
    String? familyId,
    String? firstName,
    String? subRole,
    bool isAuthorized = false,
  }) {
    state = state.copyWith(
      role: role,
      id: id,
      familyId: familyId,
      firstName: firstName,
      subRole: subRole,
      isAuthenticated: true,
      isLocked: false,
      isAuthorized: isAuthorized,
      isBooted: true,
    );
  }

  void lock() {
    if (state.isAuthenticated) {
      state = state.copyWith(isLocked: true);
    }
  }

  void unlock() => state = state.copyWith(isLocked: false);

  void logout() {
    state = UserState(
      role: UserRole.none,
      isAuthenticated: false,
      isLocked: false,
      isBooted: true,
    );
  }
}

final userProvider = NotifierProvider<UserNotifier, UserState>(
  UserNotifier.new,
);
