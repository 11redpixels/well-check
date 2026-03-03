// 🛡️ Asset Card - Compact Tracker Display for Family Horizon
// V7.7: Pet & Asset Integration (Phase 5)
// Reference: prd.md (Passive Asset Archetype)

import { MapPin, Battery, Clock, Tag } from 'lucide-react';
import type { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  onSelect: (id: string) => void;
}

// Icon mapping for asset types
const getAssetIcon = (iconType: Asset['iconType']) => {
  const iconMap = {
    paw: '🐾',
    tag: '🏷️',
    key: '🔑',
    car: '🚗',
    purse: '👜',
    bike: '🚲',
    backpack: '🎒',
    other: '📍',
  };
  return iconMap[iconType] || '📍';
};

const getTrackerTypeName = (type: Asset['trackerType']) => {
  const nameMap = {
    airtag: 'AirTag',
    tile: 'Tile',
    chipolo: 'Chipolo',
    samsung_tag: 'SmartTag',
    pet_collar: 'Pet Collar',
    other: 'Tracker',
  };
  return nameMap[type] || 'Tracker';
};

export function AssetCard({ asset, onSelect }: AssetCardProps) {
  const formatLastSeen = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusColor = () => {
    const minutesSinceLastSeen = (Date.now() - asset.lastSeen) / 60000;
    if (minutesSinceLastSeen < 5) return '#84CC16'; // Green - Recent
    if (minutesSinceLastSeen < 60) return '#FBBF24'; // Yellow - Moderate
    return '#64748B'; // Gray - Stale
  };

  return (
    <button
      onClick={() => onSelect(asset.id)}
      className="w-full bg-[#1E293B] border-2 border-[#334155] rounded-xl p-4 hover:border-[#FBBF24] transition-all active:scale-95"
    >
      {/* Header: Icon + Name */}
      <div className="flex items-start gap-3 mb-3">
        {/* Asset Icon */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{
            backgroundColor: asset.iconColor || '#FBBF24' + '20',
            border: `2px solid ${asset.iconColor || '#FBBF24'}`,
          }}
        >
          {getAssetIcon(asset.iconType)}
        </div>

        {/* Name & Tracker Type */}
        <div className="flex-1 text-left">
          <h3 className="text-white font-bold text-base mb-1">{asset.name}</h3>
          <div className="flex items-center gap-2">
            <Tag className="w-3 h-3 text-[#FBBF24]" />
            <p className="text-[#FBBF24] text-xs">{getTrackerTypeName(asset.trackerType)}</p>
          </div>
        </div>

        {/* Online Status Indicator */}
        <div className="flex flex-col items-end">
          <div
            className={`w-2.5 h-2.5 rounded-full ${asset.isOnline ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: getStatusColor() }}
          />
          <p className="text-[#64748B] text-xs mt-1">
            {asset.isOnline ? 'Live' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Status Grid (Compact) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Last Seen */}
        <div className="bg-[#0F172A] rounded-lg p-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6366F1]" />
          <div className="flex-1">
            <p className="text-[#64748B] text-xs">Last Seen</p>
            <p className="text-white font-bold text-xs">{formatLastSeen(asset.lastSeen)}</p>
          </div>
        </div>

        {/* Battery (if available) */}
        {asset.batteryLevel !== undefined ? (
          <div className="bg-[#0F172A] rounded-lg p-2 flex items-center gap-2">
            <Battery
              className={`w-4 h-4 ${
                asset.batteryLevel > 20 ? 'text-[#84CC16]' : 'text-[#FF4444]'
              }`}
            />
            <div className="flex-1">
              <p className="text-[#64748B] text-xs">Battery</p>
              <p className="text-white font-bold text-xs">{asset.batteryLevel}%</p>
            </div>
          </div>
        ) : (
          <div className="bg-[#0F172A] rounded-lg p-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#FBBF24]" />
            <div className="flex-1">
              <p className="text-[#64748B] text-xs">Location</p>
              <p className="text-white font-bold text-xs">
                {asset.lastLocation ? 'Tracked' : 'Unknown'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Low Battery Warning */}
      {asset.batteryLevel !== undefined && asset.batteryLevel <= 10 && (
        <div className="mt-2 p-2 bg-[#FF4444]/20 border border-[#FF4444] rounded-lg">
          <p className="text-[#FF4444] font-bold text-xs text-center">
            ⚠️ Critical Battery - Check {asset.name}
          </p>
        </div>
      )}

      {/* Stale Location Warning */}
      {(Date.now() - asset.lastSeen) > 24 * 60 * 60 * 1000 && (
        <div className="mt-2 p-2 bg-[#FBBF24]/20 border border-[#FBBF24] rounded-lg">
          <p className="text-[#FBBF24] font-bold text-xs text-center">
            ⏱️ Location data is over 24 hours old
          </p>
        </div>
      )}
    </button>
  );
}
