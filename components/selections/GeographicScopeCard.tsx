import { formatNumber, formatPercentage } from '@/lib/utils';
import type { SchoolSummaryStats, GeographicScopeBreakdown } from '@/types';

interface GeographicScopeCardProps {
  stats?: SchoolSummaryStats;
  wardScope?: number;
  councilScope?: number;
  regionalScope?: number;
  outsideRegion?: number;
  totalAlevel?: number;
}

export function GeographicScopeCard({ 
  stats, 
  wardScope = 0, 
  councilScope = 0, 
  regionalScope = 0, 
  outsideRegion = 0,
  totalAlevel = 0
}: GeographicScopeCardProps) {
  // Use stats if provided, otherwise use individual props
  const breakdown: GeographicScopeBreakdown = stats ? {
    ward: stats.outgoing_ward_scope,
    council: stats.outgoing_council_scope,
    regional: stats.outgoing_regional_scope,
    outsideRegion: Math.max(
      0,
      stats.outgoing_alevel - stats.outgoing_ward_scope - 
      stats.outgoing_council_scope - stats.outgoing_regional_scope
    ),
    totalAlevel: stats.outgoing_alevel,
  } : {
    ward: wardScope,
    council: councilScope,
    regional: regionalScope,
    outsideRegion: outsideRegion,
    totalAlevel: totalAlevel,
  };

  const scopes = [
    { key: 'ward', label: 'Ndani ya Kata', value: breakdown.ward },
    { key: 'council', label: 'Ndani ya Halmashauri', value: breakdown.council },
    { key: 'regional', label: 'Ndani ya Mkoa', value: breakdown.regional },
    { key: 'outsideRegion', label: 'Nje ya Mkoa', value: breakdown.outsideRegion },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Umbali wa Shule walizochaguliwa
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Eneo la kijiografia ambapo wanafunzi walipata uchaguzi wa A-Level.
        Takwimu hizi zinaonyesha umbali kutoka shule ya asili hadi shule walizochaguliwa.
      </p>
      
      <div className="space-y-4">
        {scopes.map((scope) => (
          <div key={scope.key} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                scope.key === 'ward' ? 'bg-green-500' :
                scope.key === 'council' ? 'bg-blue-500' :
                scope.key === 'regional' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-gray-700">{scope.label}</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatNumber(scope.value)}
              </div>
              <div className="text-sm text-gray-500">
                {formatPercentage(scope.value, breakdown.totalAlevel)} wa jumla
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Jumla ya wanafunzi waliochaguliwa A-Level:</span>
          <span className="font-semibold text-gray-900">{formatNumber(breakdown.totalAlevel)}</span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Maelezo:</strong> Wanafunzi waliochaguliwa ndani ya kata yao (KATA) 
          huenda shule za karibu. Waliochaguliwa ndani ya mkoa (MKOA) huenda shule 
          zinazovuta wanafunzi kutoka eneo pana. Waliochaguliwa nje ya mkoa huenda 
          shule za kitaifa zenye ushindani mkubwa.
        </p>
      </div>
    </div>
  );
}
