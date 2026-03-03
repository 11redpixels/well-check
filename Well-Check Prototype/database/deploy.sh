#!/bin/bash
# =====================================================================
# WELL-CHECK DATABASE DEPLOYMENT SCRIPT
# Production-ready deployment with validation
# =====================================================================
# 
# Usage:
#   ./database/deploy.sh [environment]
# 
# Environments:
#   dev      - Deploy to development database
#   staging  - Deploy to staging database
#   prod     - Deploy to production database (with confirmation)
# 
# Example:
#   ./database/deploy.sh dev
# 
# Requirements:
#   - psql installed
#   - DATABASE_URL environment variable set
#   - Or SUPABASE_DB_URL for Supabase projects
# =====================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get environment from argument (default: dev)
ENVIRONMENT=${1:-dev}

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# =====================================================================
# HELPER FUNCTIONS
# =====================================================================

print_header() {
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# =====================================================================
# PRE-FLIGHT CHECKS
# =====================================================================

print_header "Well-Check Database Deployment"

echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
  print_error "psql not found. Please install PostgreSQL client."
  exit 1
fi
print_success "psql found"

# Determine database URL
if [ -n "$SUPABASE_DB_URL" ]; then
  DATABASE_URL="$SUPABASE_DB_URL"
elif [ -z "$DATABASE_URL" ]; then
  print_error "DATABASE_URL or SUPABASE_DB_URL environment variable not set"
  echo ""
  echo "Set one of the following:"
  echo "  export DATABASE_URL='postgresql://user:pass@host:5432/db'"
  echo "  export SUPABASE_DB_URL='postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres'"
  exit 1
fi
print_success "Database URL configured"

# Test database connection
if psql "$DATABASE_URL" -c "SELECT 1" &> /dev/null; then
  print_success "Database connection successful"
else
  print_error "Cannot connect to database"
  exit 1
fi

# Production safety check
if [ "$ENVIRONMENT" = "prod" ]; then
  print_warning "You are about to deploy to PRODUCTION"
  echo ""
  echo -e "${RED}This will modify your production database!${NC}"
  echo ""
  read -p "Type 'DEPLOY' to confirm: " confirmation
  
  if [ "$confirmation" != "DEPLOY" ]; then
    print_error "Deployment cancelled"
    exit 1
  fi
  echo ""
fi

# =====================================================================
# BACKUP (Production only)
# =====================================================================

if [ "$ENVIRONMENT" = "prod" ]; then
  print_header "Creating Backup"
  
  BACKUP_FILE="$SCRIPT_DIR/backups/well_check_backup_$(date +%Y%m%d_%H%M%S).sql"
  mkdir -p "$SCRIPT_DIR/backups"
  
  print_info "Backing up database to: $BACKUP_FILE"
  
  if pg_dump "$DATABASE_URL" -f "$BACKUP_FILE"; then
    print_success "Backup created successfully"
  else
    print_error "Backup failed. Deployment aborted."
    exit 1
  fi
fi

# =====================================================================
# DEPLOY SCHEMA
# =====================================================================

print_header "Deploying Schema"

SCHEMA_FILE="$SCRIPT_DIR/well_check_core_v1.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
  print_error "Schema file not found: $SCHEMA_FILE"
  exit 1
fi

print_info "Deploying: well_check_core_v1.sql"

if psql "$DATABASE_URL" -f "$SCHEMA_FILE"; then
  print_success "Schema deployed successfully"
else
  print_error "Schema deployment failed"
  
  if [ "$ENVIRONMENT" = "prod" ] && [ -f "$BACKUP_FILE" ]; then
    print_warning "Restore from backup: psql \$DATABASE_URL -f $BACKUP_FILE"
  fi
  
  exit 1
fi

# =====================================================================
# VALIDATION
# =====================================================================

print_header "Running Validation Tests"

TEST_FILE="$SCRIPT_DIR/test_deployment.sql"

if [ ! -f "$TEST_FILE" ]; then
  print_warning "Test file not found: $TEST_FILE (skipping validation)"
else
  print_info "Running: test_deployment.sql"
  
  if psql "$DATABASE_URL" -f "$TEST_FILE" 2>&1 | tee /tmp/well_check_test_output.txt; then
    
    # Check if all tests passed
    if grep -q "ALL TESTS PASSED" /tmp/well_check_test_output.txt; then
      print_success "All validation tests passed"
    else
      print_warning "Some tests may have failed. Check output above."
    fi
    
  else
    print_error "Validation tests failed"
    exit 1
  fi
fi

# =====================================================================
# POST-DEPLOYMENT CHECKS
# =====================================================================

print_header "Post-Deployment Checks"

# Check table count
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('tenants', 'users', 'family_members', 'ping_requests', 'verified_pulses', 'emergency_events', 'audit_logs', 'proximity_snapshots');")

if [ "$TABLE_COUNT" -eq 8 ]; then
  print_success "All 8 core tables exist"
else
  print_error "Expected 8 tables, found $TABLE_COUNT"
  exit 1
fi

# Check RLS policies
POLICY_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';")

if [ "$POLICY_COUNT" -ge 18 ]; then
  print_success "RLS policies active ($POLICY_COUNT policies)"
else
  print_error "Expected 18+ RLS policies, found $POLICY_COUNT"
  exit 1
fi

# Check functions
FUNCTION_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_proc WHERE proname IN ('calculate_proximity_distance', 'get_distance_zone', 'audit_verified_pulse', 'audit_emergency_event', 'cleanup_expired_verified_pulses');")

if [ "$FUNCTION_COUNT" -ge 5 ]; then
  print_success "Core functions exist"
else
  print_warning "Expected 5+ functions, found $FUNCTION_COUNT"
fi

# =====================================================================
# NEXT STEPS
# =====================================================================

print_header "Deployment Complete"

print_success "Schema V1.0 deployed to $ENVIRONMENT"
echo ""

print_info "Next Steps:"
echo ""
echo "1. Configure automated cleanup:"
echo "   - Set up pg_cron (see DEPLOYMENT_GUIDE.md)"
echo "   - OR deploy Edge Function for maintenance"
echo ""
echo "2. Enable Realtime:"
echo "   - family_members"
echo "   - emergency_events"
echo "   - ping_requests"
echo ""
echo "3. Test with frontend:"
echo "   - Update NEXT_PUBLIC_SUPABASE_URL in .env"
echo "   - Update NEXT_PUBLIC_SUPABASE_ANON_KEY in .env"
echo "   - Test multi-tenant isolation"
echo ""
echo "4. Set up monitoring:"
echo "   - Slow query alerts (>100ms)"
echo "   - Active emergency alerts (>5 min)"
echo "   - Audit log growth rate"
echo ""

print_info "Documentation:"
echo "  • Deployment Guide: /database/DEPLOYMENT_GUIDE.md"
echo "  • Quick Reference: /database/QUICK_REFERENCE.md"
echo "  • Full Schema: /database/well_check_core_v1.sql"
echo ""

if [ "$ENVIRONMENT" = "prod" ] && [ -f "$BACKUP_FILE" ]; then
  print_info "Backup Location: $BACKUP_FILE"
  echo ""
fi

print_success "🎉 Deployment successful!"
echo ""
