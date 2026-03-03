import 'package:flutter_riverpod/flutter_riverpod.dart';

class ShieldSettings {
  final int speedLimit;
  final double minTemp;
  final double maxTemp;
  final int hrAlertThreshold;

  ShieldSettings({
    this.speedLimit = 75,
    this.minTemp = 68.0,
    this.maxTemp = 74.0,
    this.hrAlertThreshold = 100,
  });

  ShieldSettings copyWith({
    int? speedLimit,
    double? minTemp,
    double? maxTemp,
    int? hrAlertThreshold,
  }) {
    return ShieldSettings(
      speedLimit: speedLimit ?? this.speedLimit,
      minTemp: minTemp ?? this.minTemp,
      maxTemp: maxTemp ?? this.maxTemp,
      hrAlertThreshold: hrAlertThreshold ?? this.hrAlertThreshold,
    );
  }
}

class SettingsNotifier extends Notifier<ShieldSettings> {
  @override
  ShieldSettings build() {
    return ShieldSettings();
  }

  void updateSpeedLimit(int value) => state = state.copyWith(speedLimit: value);
  void updateTempRange(double min, double max) =>
      state = state.copyWith(minTemp: min, maxTemp: max);
  void updateHrThreshold(int value) =>
      state = state.copyWith(hrAlertThreshold: value);
}

final settingsProvider = NotifierProvider<SettingsNotifier, ShieldSettings>(
  SettingsNotifier.new,
);
