// ==========================================
// 🎵 SONG PLAYLIST — EASY TO EDIT!
// ==========================================
// Just add your songs below. Each song needs:
//   - name: The song title to show on screen
//   - artist: Artist/band name
//   - youtubeId: The YouTube video ID (the part after "v=" in the URL)
//     Example: https://youtube.com/watch?v=dQw4w9WgXcQ → youtubeId = "dQw4w9WgXcQ"
//   - emoji: An emoji that fits the vibe (optional, defaults to 🎵)
//
// To find the YouTube ID:
//   1. Go to YouTube and find your song
//   2. Copy the URL: https://www.youtube.com/watch?v=XXXXXXXXXXX
//   3. The ID is the XXXXXXXXXXX part after "v="
//
// Add as many songs as you want!
// ==========================================

export interface Song {
  name: string;
  artist: string;
  youtubeId: string;
  emoji?: string;
}

const playlist: Song[] = [
  {
    name: "Tum Ho",
    artist: "Mohit Chauhan",
    youtubeId: "ik2YF05IkdY",
    emoji: "💕",
  },
  {
    name: "Agar Tum Saath Ho",
    artist: "Arijit Singh & Alka Yagnik",
    youtubeId: "sK7riqg2mr4",
    emoji: "🌙",
  },
  {
    name: "Raabta",
    artist: "Arijit Singh",
    youtubeId: "XmTOFUJaiRQ",
    emoji: "🔗",
  },
  {
    name: "Tere Bina",
    artist: "A.R. Rahman",
    youtubeId: "2CfEKhMBnvo",
    emoji: "🌸",
  },
  {
    name: "Khairiyat",
    artist: "Arijit Singh",
    youtubeId: "hoNb6HuNmU0",
    emoji: "🦋",
  },
  {
    name: "Hawayein",
    artist: "Arijit Singh",
    youtubeId: "cYOB941gyXI",
    emoji: "🌬️",
  },
  {
    name: "Channa Mereya",
    artist: "Arijit Singh",
    youtubeId: "284Ov7yFfnE",
    emoji: "🕯️",
  },
  {
    name: "Tum Se Hi",
    artist: "Mohit Chauhan",
    youtubeId: "mt9xg0JbKAE",
    emoji: "☀️",
  },
  // ==========================================
  // 👇 ADD MORE SONGS HERE — just copy the format above!
  // ==========================================
];

export default playlist;
