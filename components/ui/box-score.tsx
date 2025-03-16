import { PlayerBoxScore, type PlayerStat } from './player-box-score';
import { TeamBoxScore, type TeamStat } from './team-box-score';
import { StarterBenchBoxScore, type StarterBenchStat } from './starter-bench-box-score';

// MAIN BOX SCORE INTERFACE FOR COMPLETE DATA 📊
export interface BoxScoreData {
  player_stats: PlayerStat[];
  team_stats: TeamStat[];
  team_starter_bench_stats: StarterBenchStat[];
}

// COMBINED BOX SCORE COMPONENT FOR EASY USAGE 🏀
export function BoxScore({ data, className }: { data: BoxScoreData; className?: string }) {
  return (
    <div className={className}>
      {/* TEAM COMPARISON SECTION */}
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4">Team Box Score</h2>
        <TeamBoxScore teamStats={data.team_stats} />
      </section>
      
      {/* PLAYER STATS SECTION */}
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4">Player Box Score</h2>
        <PlayerBoxScore playerStats={data.player_stats} />
      </section>
      
      {/* STARTERS VS BENCH SECTION */}
      <section>
        <h2 className="text-lg font-medium mb-4">Starters vs Bench</h2>
        <StarterBenchBoxScore starterBenchStats={data.team_starter_bench_stats} />
      </section>
    </div>
  );
}

// EXPORT INDIVIDUAL COMPONENTS FOR FLEXIBLE USAGE 🧩
export { PlayerBoxScore, TeamBoxScore, StarterBenchBoxScore };
export type { PlayerStat, TeamStat, StarterBenchStat }; 