-- =============================================
-- Korean Wordle Game - Supabase Schema
-- =============================================

-- Words table
CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  difficulty INTEGER DEFAULT 1
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  word TEXT NOT NULL,
  attempts INTEGER,
  status TEXT NOT NULL DEFAULT 'playing', -- 'playing', 'won', 'lost'
  duration INTEGER, -- seconds
  guesses TEXT[] DEFAULT '{}',
  jamo_pattern TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_nickname ON games(nickname);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);

-- Leaderboard view (today's games)
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  nickname,
  COUNT(*) FILTER (WHERE status = 'won') AS wins,
  COUNT(*) AS total_games,
  ROUND(AVG(attempts) FILTER (WHERE status = 'won'), 1) AS avg_attempts,
  ROUND(AVG(duration) FILTER (WHERE status = 'won'), 0) AS avg_duration
FROM games
WHERE created_at >= CURRENT_DATE::TIMESTAMPTZ
  AND created_at < (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMPTZ
  AND status != 'playing'
GROUP BY nickname
HAVING COUNT(*) FILTER (WHERE status = 'won') > 0
ORDER BY wins DESC, avg_attempts ASC, avg_duration ASC;

-- Enable Realtime for games table
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- RLS Policies
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow all reads on words
CREATE POLICY "words_read_all" ON words FOR SELECT USING (true);

-- Allow all operations on games (nickname-based auth)
CREATE POLICY "games_read_all" ON games FOR SELECT USING (true);
CREATE POLICY "games_insert" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "games_update" ON games FOR UPDATE USING (true) WITH CHECK (true);

-- =============================================
-- Seed words (5-jamo Korean words)
-- =============================================
INSERT INTO words (word, difficulty) VALUES
  ('겨울', 1), ('여름', 1), ('가을', 1), ('하늘', 1), ('바람', 1),
  ('사랑', 1), ('구름', 1), ('도둑', 1), ('소원', 1), ('자동', 1),
  ('사막', 1), ('세상', 1), ('새벽', 1), ('아침', 1), ('수학', 1),
  ('세월', 1), ('세금', 2), ('우물', 1), ('이별', 1), ('이상', 1),
  ('노력', 1), ('보람', 1), ('조각', 1), ('소방', 2), ('도움', 1),
  ('우산', 1), ('지붕', 1), ('바닥', 1), ('하품', 1), ('모험', 1),
  ('보물', 1), ('고민', 1), ('자연', 1), ('소문', 1), ('나중', 1),
  ('도망', 1), ('추위', 1), ('더위', 1), ('고통', 1), ('기쁨', 1),
  ('슬픔', 1), ('사건', 1), ('고장', 1), ('자랑', 1), ('모양', 1),
  ('소리', 1), ('가방', 1), ('고향', 1), ('소설', 1), ('도전', 1),
  ('희망', 1), ('미래', 1), ('소득', 2), ('노동', 2), ('투자', 2),
  ('경우', 1), ('정치', 2), ('봉투', 1), ('망고', 1), ('실수', 1),
  ('원래', 1), ('발표', 1), ('봄비', 1), ('동부', 2), ('장미', 1),
  ('단추', 1), ('친구', 1), ('문어', 1), ('봉사', 1), ('전기', 1),
  ('순수', 1), ('물가', 2), ('왕자', 1), ('동서', 2), ('장수', 1),
  ('단어', 1), ('전자', 1), ('경기', 1), ('향수', 1), ('영어', 1),
  ('공부', 1), ('취미', 1), ('여행', 1), ('요리', 1), ('낚시', 1),
  ('등산', 1), ('수영', 1), ('독서', 1), ('그림', 1), ('부자', 1),
  ('행복', 1), ('성공', 1), ('실패', 1), ('인내', 1), ('용기', 1),
  ('지혜', 1), ('강물', 1), ('바다', 1), ('호수', 1), ('연못', 1),
  ('봄꽃', 1), ('낙엽', 1), ('햇살', 1), ('안개', 1), ('이슬', 1),
  ('신발', 1), ('바지', 1), ('모자', 1), ('장갑', 1), ('연필', 1),
  ('볼펜', 1), ('공책', 1), ('편지', 1), ('메모', 1), ('일기', 1),
  ('커피', 1), ('녹차', 1), ('주스', 1), ('우유', 1), ('과자', 1),
  ('세탁', 1), ('청소', 1), ('요리', 1), ('빨래', 1), ('다림', 1),
  ('창문', 1), ('지붕', 1), ('계단', 1), ('현관', 1), ('정원', 1),
  ('책상', 1), ('의자', 1), ('침대', 1), ('소파', 1), ('냉장', 1),
  ('거울', 1), ('시계', 1), ('전화', 1), ('컴퓨', 1), ('사진', 1),
  ('음악', 1), ('미술', 1), ('체육', 1), ('과학', 1), ('역사', 1),
  ('지리', 1), ('경제', 2), ('사회', 1), ('문화', 1), ('예술', 1),
  ('문학', 1), ('언어', 1), ('논리', 2), ('철학', 2), ('심리', 2),
  ('의학', 2), ('법학', 2), ('공학', 2), ('수학', 1), ('통계', 2),
  ('가족', 1), ('친척', 1), ('이웃', 1), ('선생', 1), ('학생', 1),
  ('의사', 1), ('간호', 1), ('경찰', 1), ('소방', 1), ('군인', 1),
  ('농부', 1), ('어부', 1), ('상인', 1), ('장인', 1), ('예인', 1),
  ('강아', 1), ('고양', 1), ('토끼', 1), ('거북', 1), ('금붕', 1),
  ('사자', 1), ('호랑', 1), ('곰돌', 1), ('늑대', 1), ('여우', 1),
  ('독수', 1), ('까치', 1), ('참새', 1), ('비둘', 1), ('펭귄', 1),
  ('사과', 1), ('배추', 1), ('당근', 1), ('감자', 1), ('오이', 1),
  ('호박', 1), ('양파', 1), ('마늘', 1), ('생강', 1), ('고추', 1),
  ('딸기', 1), ('포도', 1), ('수박', 1), ('참외', 1), ('복숭', 1),
  ('자두', 1), ('매실', 1), ('귤껍', 1), ('레몬', 1), ('바나', 1),
  ('봉지', 1), ('정수', 1), ('충전', 1), ('방전', 1), ('온도', 1),
  ('난방', 1), ('환기', 1), ('구역', 1), ('로봇', 1), ('기계', 1),
  ('엔진', 1), ('모터', 1), ('배터', 1), ('충전', 1), ('케이', 1),
  ('인터', 1), ('와이', 1), ('블루', 1), ('핸드', 1), ('스마', 1)
ON CONFLICT (word) DO NOTHING;
