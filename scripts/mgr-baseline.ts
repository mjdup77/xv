// BASELINE difficulty measurement, kept for the record. This measured the
// ORIGINAL Phase-1 slice engine before the management rework and no longer
// compiles against the new engine. The numbers it produced (200 seasons per
// club, passive player who only taps Sim):
//
//   never touches team:   bath avgPos 1.23  top4 100%  title 72%  winRate 84%
//                         sale avgPos 4.33  top4  57%  title  7%  winRate 56%
//                         newc avgPos 10.0  top4   0%  title  0%  winRate  4%
//   weekly Suggest XV:    bath avgPos 1.44  top4  99%  title 63%  winRate 79%
//                         sale avgPos 4.81  top4  47%  title  2%  winRate 52%
//
// AI-vs-AI (no user bias): bath won the title 66% of seasons.
//
// Post-rework numbers come from scripts/mgr-sim.ts.

console.log("See the comment block — this recorded the pre-rework baseline.");
