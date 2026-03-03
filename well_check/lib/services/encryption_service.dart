import 'dart:typed_data';
import 'package:encrypt/encrypt.dart' as encrypt;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:developer' as developer;

class EncryptionService {
  static const _storage = FlutterSecureStorage();
  static const _keyAlias = 'shield_aes_key';
  static const _ivAlias = 'shield_aes_iv';

  static encrypt.Key? _cachedKey;
  static encrypt.IV? _cachedIV;

  static Future<void> _initialize() async {
    if (_cachedKey != null && _cachedIV != null) return;

    String? base64Key = await _storage.read(key: _keyAlias);
    String? base64IV = await _storage.read(key: _ivAlias);

    if (base64Key == null || base64IV == null) {
      // Generate new key and IV if they don't exist
      final key = encrypt.Key.fromSecureRandom(32);
      final iv = encrypt.IV.fromSecureRandom(16);

      await _storage.write(key: _keyAlias, value: key.base64);
      await _storage.write(key: _ivAlias, value: iv.base64);

      _cachedKey = key;
      _cachedIV = iv;
      developer.log("ENCRYPTION | New AES key generated and stored securely.");
    } else {
      _cachedKey = encrypt.Key.fromBase64(base64Key);
      _cachedIV = encrypt.IV.fromBase64(base64IV);
      developer.log(
        "ENCRYPTION | Existing AES key retrieved from secure storage.",
      );
    }
  }

  static Future<Uint8List> encryptData(Uint8List data) async {
    await _initialize();
    final encrypter = encrypt.Encrypter(encrypt.AES(_cachedKey!));
    final encrypted = encrypter.encryptBytes(data, iv: _cachedIV!);
    return encrypted.bytes;
  }

  static Future<Uint8List> decryptData(Uint8List encryptedData) async {
    await _initialize();
    final encrypter = encrypt.Encrypter(encrypt.AES(_cachedKey!));
    final decrypted = encrypter.decryptBytes(
      encrypt.Encrypted(encryptedData),
      iv: _cachedIV!,
    );
    return Uint8List.fromList(decrypted);
  }

  static Future<String> encryptString(String plainText) async {
    await _initialize();
    final encrypter = encrypt.Encrypter(encrypt.AES(_cachedKey!));
    final encrypted = encrypter.encrypt(plainText, iv: _cachedIV!);
    return encrypted.base64;
  }

  static Future<String> decryptString(String encryptedBase64) async {
    await _initialize();
    final encrypter = encrypt.Encrypter(encrypt.AES(_cachedKey!));
    return encrypter.decrypt(
      encrypt.Encrypted.fromBase64(encryptedBase64),
      iv: _cachedIV!,
    );
  }
}
