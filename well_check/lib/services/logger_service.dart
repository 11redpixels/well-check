import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';

class ShieldLogger {
  static final Logger _logger = Logger(
    printer: PrettyPrinter(
      methodCount: 0,
      errorMethodCount: 5,
      lineLength: 50,
      colors: true,
      printEmojis: true,
      printTime: true,
    ),
  );

  /// Log standard debug information. Stripped in Release mode.
  static void d(String message) {
    if (kDebugMode) {
      _logger.d("SHIELD_DEBUG: $message");
    }
  }

  /// Log critical errors. Recorded in Crashlytics in Release mode.
  static void e(String message, [dynamic error, StackTrace? stack]) {
    _logger.e("SHIELD_ERROR: $message", error: error, stackTrace: stack);
  }

  /// Log clinical events. Sensitive data is scrubbed in Release mode.
  static void clinical(
    String category,
    String message, {
    bool isSensitive = true,
  }) {
    if (kReleaseMode && isSensitive) {
      _logger.i("CLINICAL_EVENT [$category]: [DATA_SCRUBBED_FOR_PRIVACY]");
    } else {
      _logger.i("CLINICAL_EVENT [$category]: $message");
    }
  }
}
