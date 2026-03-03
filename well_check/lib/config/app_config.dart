class AppConfig {
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://lravvptfltbfbfmbhomp.supabase.co',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYXZ2cHRmbHRiZmJmbWJob21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5OTQyMDgsImV4cCI6MjA4NzU3MDIwOH0.h1q2XuRI-nwPJhulmrnvP_ma5DrTqC85INTVDBzwHv0',
  );

  // Add other production keys here as environment variables
  static const String revenueCatApiKey = String.fromEnvironment(
    'REVENUECAT_API_KEY',
    defaultValue: '',
  );
}
