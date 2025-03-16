import React from 'react';
import { cn } from "@/utils/utils";

// TEAM STATS INTERFACE FOR BOX SCORE DISPLAY 🏀
export interface TeamStat {
  GAME_ID: string;
  TEAM_ID: number;
  TEAM_NAME: string;
  TEAM_ABBREVIATION: string;
  TEAM_CITY: string;
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
  PLUS_MINUS: number;
}

interface TeamBoxScoreProps {
  teamStats: TeamStat[];
  className?: string;
}

export function TeamBoxScore({ teamStats, className }: TeamBoxScoreProps) {
  if (!teamStats || teamStats.length === 0) {
    return <div className="text-center py-4">No team stats available</div>;
  }

  // COLUMN DEFINITIONS FOR TEAM STATS TABLE 📊
  const columns = [
    { key: 'TEAM_NAME', label: 'TEAM' },
    { key: 'PTS', label: 'PTS' },
    { key: 'FGM', label: 'FGM' },
    { key: 'FGA', label: 'FGA' },
    { key: 'FG_PCT', label: 'FG%', format: (val: number) => (val * 100).toFixed(1) + '%' },
    { key: 'FG3M', label: '3PM' },
    { key: 'FG3A', label: '3PA' },
    { key: 'FG3_PCT', label: '3P%', format: (val: number) => (val * 100).toFixed(1) + '%' },
    { key: 'FTM', label: 'FTM' },
    { key: 'FTA', label: 'FTA' },
    { key: 'FT_PCT', label: 'FT%', format: (val: number) => (val * 100).toFixed(1) + '%' },
    { key: 'REB', label: 'REB' },
    { key: 'OREB', label: 'OREB' },
    { key: 'DREB', label: 'DREB' },
    { key: 'AST', label: 'AST' },
    { key: 'STL', label: 'STL' },
    { key: 'BLK', label: 'BLK' },
    { key: 'TO', label: 'TO' },
    { key: 'PF', label: 'PF' },
    { key: 'PLUS_MINUS', label: '+/-', format: (val: number) => val > 0 ? `+${val}` : val }
  ];

  // DETERMINE WINNER FOR HIGHLIGHTING 🏆
  const winner = teamStats.reduce((prev, current) => 
    (prev.PTS > current.PTS) ? prev : current
  );

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-accent/20 border-b border-accent/30">
            {columns.map((column) => (
              <th 
                key={column.key} 
                className={cn(
                  "px-3 py-2 text-left font-medium text-primary/80",
                  column.key === 'TEAM_NAME' ? "sticky left-0 bg-accent/20 z-10 min-w-[140px]" : "text-center"
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teamStats.map((team) => (
            <tr 
              key={team.TEAM_ID} 
              className={cn(
                "border-b border-accent/10 hover:bg-accent/5 transition-colors",
                team.TEAM_ID === winner.TEAM_ID ? "bg-accent/10" : ""
              )}
            >
              {columns.map((column) => (
                <td 
                  key={`${team.TEAM_ID}-${column.key}`} 
                  className={cn(
                    "px-3 py-2",
                    column.key === 'TEAM_NAME' ? "sticky left-0 bg-background z-10 font-medium" : "text-center",
                    column.key === 'PTS' && team.TEAM_ID === winner.TEAM_ID ? "font-bold text-primary" : "",
                    column.key === 'PLUS_MINUS' ? (team.PLUS_MINUS > 0 ? "text-green-500" : team.PLUS_MINUS < 0 ? "text-red-500" : "") : ""
                  )}
                >
                  {column.key === 'TEAM_NAME' ? (
                    <div className="flex items-center">
                      <span className="font-medium">{team.TEAM_CITY} {team.TEAM_NAME}</span>
                      <span className="ml-2 text-xs bg-accent/30 px-1.5 py-0.5 rounded">
                        {team.TEAM_ABBREVIATION}
                      </span>
                    </div>
                  ) : column.format ? (
                    column.format(team[column.key as keyof TeamStat] as number)
                  ) : (
                    team[column.key as keyof TeamStat]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* TEAM COMPARISON VISUALIZATION 📈 */}
      {teamStats.length === 2 && (
        <div className="mt-6 px-4">
          <h3 className="text-sm font-medium mb-3">KEY STATS COMPARISON</h3>
          <div className="space-y-3">
            {['PTS', 'REB', 'AST', 'STL', 'BLK', 'TO'].map(stat => {
              const team1Value = teamStats[0][stat as keyof TeamStat] as number;
              const team2Value = teamStats[1][stat as keyof TeamStat] as number;
              const total = team1Value + team2Value;
              const team1Percent = (team1Value / total) * 100;
              
              return (
                <div key={stat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{teamStats[0].TEAM_ABBREVIATION}: {team1Value}</span>
                    <span>{stat}</span>
                    <span>{teamStats[1].TEAM_ABBREVIATION}: {team2Value}</span>
                  </div>
                  <div className="h-2 bg-accent/20 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full",
                        stat === 'TO' ? "bg-red-500/70" : "bg-blue-500/70"
                      )}
                      style={{ width: `${team1Percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 