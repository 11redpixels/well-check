enum UserRole {
  familyHead('family_head'),
  member('member'),
  protected('protected'),
  minor('minor'),
  monitor('monitor'),
  none('none');

  final String id;
  const UserRole(this.id);
}
