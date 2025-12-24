export const emojiMap: { [key: string]: string } = {
    ":rocket:": "🚀",
    ":smile:": "😄",
    ":laughing:": "😂",
    ":wink:": "😉",
    ":heart:": "❤️",
    ":thumbsup:": "👍",
    ":thumbsdown:": "👎",
    ":fire:": "🔥",
    ":tada:": "🎉",
    ":party:": "🎉",
    ":bug:": "🐛",
    ":sparkles:": "✨",
    ":star:": "⭐",
    ":warning:": "⚠️",
    ":check:": "✅",
    ":white_check_mark:": "✅",
    ":x:": "❌",
    ":red_circle:": "🔴",
    ":green_circle:": "🟢",
    ":blue_circle:": "🔵",
    ":link:": "🔗",
    ":point_right:": "👉",
    ":point_left:": "👈",
    ":point_up:": "👆",
    ":point_down:": "👇",
    ":wave:": "👋",
    ":clap:": "👏",
    ":pray:": "🙏",
    ":brain:": "🧠",
    ":speech_bubble:": "💬",
    ":thought_balloon:": "💭",
    ":eyes:": "👀",
    ":lock:": "🔒",
    ":unlock:": "🔓",
    ":key:": "🔑",
    ":zap:": "⚡",
    ":recycle:": "♻️",
    ":bulb:": "💡",
    ":moneybag:": "💰",
    ":chart_with_upwards_trend:": "📈",
    ":chart_with_downwards_trend:": "📉",
  };
  
  export function replaceEmojiShortcuts(text: string): string {
    // Regex to find all emoji shortcuts like :shortcode:
    const regex = /:([a-zA-Z0-9_]+):/g;
    return text.replace(regex, (match) => {
      return emojiMap[match] || match;
    });
  }
  
