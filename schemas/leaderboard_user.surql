DEFINE TABLE leaderboard_user TYPE NORMAL AS
SELECT
  name,
  math::sum(->discovered->task.points_discovered) + math::sum(->(submitted WHERE correct = true)->task.points_solved) AS points,
  count(->discovered) AS discover_count,
  count(->submitted) as answer_count,
  count(->(submitted WHERE correct = true)) AS solve_count
FROM user
WHERE count(->discovered) > 0;
