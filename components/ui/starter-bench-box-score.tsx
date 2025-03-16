import React from 'react';
import { cn } from "@/utils/utils";

// STARTER/BENCH STATS INTERFACE FOR BOX SCORE DISPLAY 🏀
export interface StarterBenchStat {
  GAME_ID: string;
  TEAM_ID: number;
  TEAM_NAME: string;
  TEAM_ABBREVIATION: string;
  TEAM_CITY: string;
  STARTERS_BENCH: string; // "Starters" or "Bench"
  MIN: string;
  FGM: number;
  FGA: number;
  FG_PCT: number;
  FG3M: number;
  FG3A: number;
  FG3_PCT: number;
  FTM: number;
  FTA: number;
  FT_PCT: number;
  OREB: number;
  DREB: number;
  REB: number;
  AST: number;
  STL: number;
  BLK: number;
  TO: number;
  PF: number;
  PTS: number;
}

interface StarterBenchBoxScoreProps {
  starterBenchStats: StarterBenchStat[];
  className?: string;
}

export function StarterBenchBoxScore({ starterBenchStats, className }: StarterBenchBoxScoreProps) {
  if (!starterBenchStats || starterBenchStats.length === 0) {
    return <div className="text-center py-4">No starter/bench stats available</div>;
  }

  // GROUP STATS BY TEAM FOR BETTER DISPLAY 📊
  const teamGroups = starterBenchStats.reduce((groups, stat) => {
    const teamKey = stat.TEAM_ID.toString();
    if (!groups[teamKey]) {
      groups[teamKey] = {
        teamName: `${stat.TEAM_CITY} ${stat.TEAM_NAME}`,
        teamAbbreviation: stat.TEAM_ABBREVIATION,
        stats: []
      };
    }
    groups[teamKey].stats.push(stat);
    return groups;
  }, {} as Record<string, { teamName: string; teamAbbreviation: string; stats: StarterBenchStat[] }>);

  // COLUMN DEFINITIONS FOR STARTER/BENCH STATS TABLE 📋
  const columns = [
    { key: 'STARTERS_BENCH', label: 'GROUP' },
    { key: 'MIN', label: 'MIN' },
    { key: 'PTS', label: 'PTS' },
    { key: 'FGM', label: 'FGM' },
    { key: 'FGA', label: 'FGA' },
    { key: 'FG_PCT', label: 'FG%', format: (val: number) => (val * 100).toFixed(1) + '%' },
    { key: 'FG3M', label: '3PM' },
    { key: 'FG3A', label: '3PA' },
    { key: 'FG3_PCT', label: '3P%', format: (val: number) => (val * 100).toFixed(1) + '%' },
    { key: 'REB', label: 'REB' },
    { key: 'AST', label: 'AST' },
    { key: 'STL', label: 'STL' },
    { key: 'BLK', label: 'BLK' },
    { key: 'TO', label: 'TO' },
    { key: 'PF', label: 'PF' }
  ];

  return (
    <div className={cn("space-y-8", className)}>
      {Object.values(teamGroups).map((group) => (
        <div key={group.teamAbbreviation} className="overflow-hidden rounded-md border border-accent/20">
          <div className="bg-accent/20 px-4 py-2 flex items-center justify-between">
            <h3 className="font-medium">{group.teamName}</h3>
            <span className="text-xs bg-accent/30 px-2 py-0.5 rounded">
              {group.teamAbbreviation}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-accent/10 border-b border-accent/20">
                  {columns.map((column) => (
                    <th 
                      key={column.key} 
                      className={cn(
                        "px-3 py-2 text-left font-medium text-primary/80",
                        column.key === 'STARTERS_BENCH' ? "sticky left-0 bg-accent/10 z-10" : "text-center"
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.stats.map((stat) => (
                  <tr 
                    key={`${stat.TEAM_ID}-${stat.STARTERS_BENCH}`} 
                    className={cn(
                      "border-b border-accent/10 hover:bg-accent/5 transition-colors",
                      stat.STARTERS_BENCH === 'Starters' ? "font-medium" : "text-primary/80"
                    )}
                  >
                    {columns.map((column) => (
                      <td 
                        key={`${stat.TEAM_ID}-${stat.STARTERS_BENCH}-${column.key}`} 
                        className={cn(
                          "px-3 py-2",
                          column.key === 'STARTERS_BENCH' ? "sticky left-0 bg-background z-10" : "text-center",
                          column.key === 'PTS' ? "font-medium" : ""
                        )}
                      >
                        {column.key === 'STARTERS_BENCH' ? (
                          <div className="flex items-center">
                            <span>{stat.STARTERS_BENCH}</span>
                            {stat.STARTERS_BENCH === 'Starters' && (
                              <span className="ml-2 text-xs bg-blue-500/20 px-1.5 py-0.5 rounded-full">
                                FIRST UNIT 🏀
                              </span>
                            )}
                            {stat.STARTERS_BENCH === 'Bench' && (
                              <span className="ml-2 text-xs bg-green-500/20 px-1.5 py-0.5 rounded-full">
                                SECOND UNIT 💪
                              </span>
                            )}
                          </div>
                        ) : column.format ? (
                          column.format(stat[column.key as keyof StarterBenchStat] as number)
                        ) : (
                          stat[column.key as keyof StarterBenchStat]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* STARTERS VS BENCH CONTRIBUTION VISUALIZATION 📊 */}
          {group.stats.length === 2 && (
            <div className="p-4 border-t border-accent/20">
              <h4 className="text-xs font-medium mb-3">STARTERS VS BENCH CONTRIBUTION</h4>
              <div className="space-y-3">
                {['PTS', 'REB', 'AST'].map(stat => {
                  const starterStat = group.stats.find(s => s.STARTERS_BENCH === 'Starters');
                  const benchStat = group.stats.find(s => s.STARTERS_BENCH === 'Bench');
                  
                  if (!starterStat || !benchStat) return null;
                  
                  const starterValue = starterStat[stat as keyof StarterBenchStat] as number;
                  const benchValue = benchStat[stat as keyof StarterBenchStat] as number;
                  const total = starterValue + benchValue;
                  const starterPercent = (starterValue / total) * 100;
                  const benchPercent = 100 - starterPercent;
                  
                  return (
                    <div key={stat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{stat}</span>
                        <span>Starters: {starterValue} ({starterPercent.toFixed(1)}%)</span>
                        <span>Bench: {benchValue} ({benchPercent.toFixed(1)}%)</span>
                      </div>
                      <div className="h-3 bg-accent/10 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-blue-500/70 h-full"
                          style={{ width: `${starterPercent}%` }}
                        />
                        <div 
                          className="bg-green-500/70 h-full"
                          style={{ width: `${benchPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 