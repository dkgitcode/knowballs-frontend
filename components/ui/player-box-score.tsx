import React from 'react';
import { cn } from "@/utils/utils";

// PLAYER STATS INTERFACE FOR BOX SCORE DISPLAY 📊
export interface PlayerStat {
  GAME_ID: string;
  TEAM_ID: number;
  TEAM_ABBREVIATION: string;
  TEAM_CITY: string;
  PLAYER_ID: number;
  PLAYER_NAME: string;
  NICKNAME: string;
  START_POSITION: string;
  COMMENT: string;
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

interface PlayerBoxScoreProps {
  playerStats: PlayerStat[];
  className?: string;
}

export function PlayerBoxScore({ playerStats, className }: PlayerBoxScoreProps) {
  if (!playerStats || playerStats.length === 0) {
    return <div className="text-center py-4">No player stats available</div>;
  }

  // COLUMN DEFINITIONS FOR PLAYER STATS TABLE 📋
  const columns = [
    { key: 'PLAYER_NAME', label: 'PLAYER' },
    { key: 'MIN', label: 'MIN' },
    { key: 'PTS', label: 'PTS' },
    { key: 'REB', label: 'REB' },
    { key: 'AST', label: 'AST' },
    { key: 'FGM', label: 'FGM' },
    { key: 'FGA', label: 'FGA' },
    { key: 'FG_PCT', label: 'FG%', format: (val: number) => (val * 100).toFixed(1) + '%' },
    { key: 'FG3M', label: '3PM' },
    { key: 'FG3A', label: '3PA' },
    { key: 'FG3_PCT', label: '3P%', format: (val: number) => (val * 100).toFixed(1) + '%' },
    { key: 'FTM', label: 'FTM' },
    { key: 'FTA', label: 'FTA' },
    { key: 'FT_PCT', label: 'FT%', format: (val: number) => (val * 100).toFixed(1) + '%' },
    { key: 'OREB', label: 'OREB' },
    { key: 'DREB', label: 'DREB' },
    { key: 'STL', label: 'STL' },
    { key: 'BLK', label: 'BLK' },
    { key: 'TO', label: 'TO' },
    { key: 'PF', label: 'PF' },
    { key: 'PLUS_MINUS', label: '+/-', format: (val: number) => val > 0 ? `+${val}` : val }
  ];

  // DISPLAY ONLY THE MOST IMPORTANT STATS BY DEFAULT 🔍
  const defaultColumns = columns.filter(col => 
    ['PLAYER_NAME', 'MIN', 'PTS', 'REB', 'AST', 'FGM', 'FGA', 'FG_PCT', 'FG3M', 'FG3A', 'STL', 'BLK', 'TO', 'PLUS_MINUS'].includes(col.key)
  );

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-accent/20 border-b border-accent/30">
            {defaultColumns.map((column) => (
              <th 
                key={column.key} 
                className={cn(
                  "px-3 py-2 text-left font-medium text-primary/80",
                  column.key === 'PLAYER_NAME' ? "sticky left-0 bg-accent/20 z-10 min-w-[140px]" : "text-center"
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {playerStats.map((player, index) => (
            <tr 
              key={`${player.PLAYER_ID}-${index}`} 
              className={cn(
                "border-b border-accent/10 hover:bg-accent/5 transition-colors",
                player.START_POSITION ? "font-medium" : "text-primary/80"
              )}
            >
              {defaultColumns.map((column) => (
                <td 
                  key={`${player.PLAYER_ID}-${column.key}`} 
                  className={cn(
                    "px-3 py-2",
                    column.key === 'PLAYER_NAME' ? "sticky left-0 bg-background z-10 font-medium" : "text-center",
                    column.key === 'PTS' && player.PTS >= 20 ? "font-bold text-primary" : "",
                    column.key === 'PLUS_MINUS' ? (player.PLUS_MINUS > 0 ? "text-green-500" : player.PLUS_MINUS < 0 ? "text-red-500" : "") : ""
                  )}
                >
                  {column.key === 'PLAYER_NAME' ? (
                    <div className="flex items-center">
                      <span>{player.PLAYER_NAME}</span>
                      {player.START_POSITION && (
                        <span className="ml-2 text-xs bg-accent/30 px-1.5 py-0.5 rounded">
                          {player.START_POSITION}
                        </span>
                      )}
                    </div>
                  ) : column.format ? (
                    column.format(player[column.key as keyof PlayerStat] as number)
                  ) : (
                    player[column.key as keyof PlayerStat]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 