-- Add to schema.sql after the existing functions
-- XP Award function (called from client via rpc)
CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_xp INTEGER)
RETURNS VOID AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_today DATE := CURRENT_DATE;
  v_last_date DATE;
  v_new_streak INTEGER;
BEGIN
  SELECT total_xp, last_activity_date, current_streak
  INTO v_new_xp, v_last_date, v_new_streak
  FROM profiles WHERE id = p_user_id;

  v_new_xp := GREATEST(0, v_new_xp + p_xp);
  v_new_level := FLOOR(SQRT(v_new_xp::FLOAT / 100)) + 1;

  -- Update streak only when adding XP
  IF p_xp > 0 THEN
    IF v_last_date IS NULL OR v_last_date < v_today - INTERVAL '1 day' THEN
      v_new_streak := 1;
    ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
      v_new_streak := v_new_streak + 1;
    END IF;
    -- same day: no change to streak

    UPDATE profiles SET
      total_xp = v_new_xp,
      level = v_new_level,
      last_activity_date = v_today,
      current_streak = v_new_streak,
      longest_streak = GREATEST(longest_streak, v_new_streak),
      updated_at = NOW()
    WHERE id = p_user_id;
  ELSE
    UPDATE profiles SET
      total_xp = v_new_xp,
      level = v_new_level,
      updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION award_xp(UUID, INTEGER) TO authenticated;
