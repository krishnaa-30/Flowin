# Flowin ✦

Flowin is a browser-based habit and personal-growth app designed to turn small daily actions into a motivating progression system.

## Overview

Flowin combines habit tracking, streaks, daily reflection, focus sessions, rewards, and RPG-style progression. The app is designed around the idea that consistent small actions build momentum over time.

The core app stores its data in the browser using `localStorage`, including habits, account information, reminders, and progression state. The uploaded source also contains a V2 progression layer that extends the base habit tracker with missions, skills, trophies, a Life Tree, a personal room, and a local Flowin Coach. fileciteturn0file1L1-L12 fileciteturn0file0L5-L12

## Features

### Habit Tracking
- Create daily or custom-schedule habits.
- Assign categories, icons, colors, and reminder times.
- Mark habits complete for the current day.
- Delete habits.
- Track individual habit streaks.
- View daily completion progress.

The base app includes default habits such as meditation, reading, movement, and drinking water. fileciteturn0file1L1-L3

### Progress & Analytics
- Daily completion percentage.
- Weekly activity score.
- Best current streak.
- All-time check-ins.
- Active habit count.
- Yearly activity heatmap.
- Motivational quotes.

The dashboard calculates weekly progress and maintains a yearly heatmap based on completed habit check-ins. fileciteturn0file1L14-L21

### Daily Compass
The Daily Compass lets users:
- Select their current mood.
- Receive mood-based encouragement.
- Complete a two-minute reset.
- Start a 10-minute Flow Sprint.
- Earn coins from completing the reset and sprint.

The Compass stores its daily state locally and starts a 10-minute focus timer when requested. fileciteturn0file2L1-L4 fileciteturn0file2L8-L17

### RPG Progression — V2
The V2 layer adds:
- Daily missions.
- Skill points.
- Focus, Discipline, Wealth, and Wellness skills.
- Life Tree growth.
- A customizable room that expands with level.
- Trophy milestones.
- Flowin Coach insights.
- Level-up notifications.
- Bonus XP and coin rewards.

The progression system persists its state under the `flowin-v2-v1` local-storage key. fileciteturn0file0L2-L12

### Daily Missions
Current missions include:
- Complete 3 habits.
- Finish a Flow Sprint.
- Complete a scheduled habit.

Missions award XP and coins, and completing all daily missions unlocks a reward chest. fileciteturn0file0L26-L39 fileciteturn0file0L115-L130

### Skills
Four progression skills are currently defined:

| Skill | Effect |
|---|---|
| Focus | Flow Sprint rewards +8% per level |
| Discipline | Quest XP +5% per level |
| Wealth | Coin rewards +6% per level |
| Wellness | Energy resilience +5% per level |

Skill points can be spent to upgrade these skills. fileciteturn0file0L134-L143

### Trophies
Milestones include:
- 🌱 First Ritual
- 🔥 7-Day Flame
- 👑 30-Day Legend
- 💯 Century Club
- ☁️ Sky Sanctuary
- 🌳 Life Tree

These are unlocked automatically when the relevant progression conditions are reached. fileciteturn0file0L57-L71

### Reminders
Habit reminders use the browser Notification API when permission is granted. Reminder timers are scheduled locally for eligible habits. fileciteturn0file1L22-L22

### Authentication
The current implementation provides a lightweight local account flow:
- Create an account with a name and password.
- Log in using the saved credentials.
- Keep the account information in browser `localStorage`.

This is a client-side demo/authentication mechanism, not a server-backed authentication system. fileciteturn0file1L23-L26

## Project Structure

Based on the uploaded source files:

```text
Flowin/
├── flowin-logo.svg
├── manifest.webmanifest
├── app.js
├── flow.js
├── v2.js
└── README.md
```

### JavaScript files

**`app.js`**  
Contains the main habit-tracking application logic, including habit creation, completion, streaks, progress rendering, reminders, authentication, and theme controls.

**`flow.js`**  
Adds the Daily Compass experience, mood selection, the two-minute starter quest, and the Flow Sprint timer. fileciteturn0file2L8-L21

**`v2.js`**  
Adds the RPG/progression layer, including missions, skills, Life Tree, room, trophies, coach, level-up handling, and progression rewards. fileciteturn0file0L174-L188

**`manifest.webmanifest`**  
Provides the web-app manifest for the project.

**`flowin-logo.svg`**  
Project logo asset.

## Data Storage

Flowin currently relies on browser `localStorage`.

Important storage keys visible in the source include:

```text
flowin-habits-v1
flowin-account-v1
flowin-reminders-v1
flowin-daily-compass-v1
flowin-v2-v1
```

Because this storage is browser-local, clearing site data or switching browsers/devices can remove or separate the saved application state.

## Running the Project

Flowin is a client-side web application. To run it locally:

1. Keep the HTML file and uploaded JavaScript/assets in the same project directory.
2. Make sure the JavaScript files are loaded in the intended order by the HTML entry point.
3. Serve the project through a local HTTP server.
4. Open the app in a modern browser.
5. Allow notification permission if you want habit reminders.

A simple local server can be started with:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Browser Permissions

The reminder feature can request browser notification permission. If notification permission is denied, the rest of the application can still function, but browser notifications will not be available. fileciteturn0file1L22-L22

## Design Philosophy

Flowin is built around four ideas:

1. **Start small** — make the next action easy.
2. **Build consistency** — streaks and activity history make progress visible.
3. **Reward progress** — XP, coins, skills, trophies, and world-building provide additional motivation.
4. **Meet yourself where you are** — the Daily Compass adapts its encouragement to the user's selected mood. fileciteturn0file2L5-L7

## Current Limitations

The uploaded source indicates that this is primarily a client-side application.

- Authentication is stored locally rather than handled by a backend.
- Habit and progression data are stored in `localStorage`.
- There is no visible server/database layer in the supplied files.
- Reminder scheduling depends on browser notification support and permission.
- Data is not automatically synchronized between devices.

## Future Ideas

Possible next steps for Flowin include:

- Cloud account synchronization.
- Secure backend authentication.
- Cross-device habit syncing.
- Persistent database storage.
- More quests and seasonal content.
- Expanded skill trees.
- More room decorations and customization.
- Achievement notifications.
- Social or accountability features.
- Data export/import.
- Improved accessibility and keyboard navigation.
- Offline/PWA enhancements.

## License

No license information was included in the supplied project files. Add a license before publicly distributing or open-sourcing the project.

## Credits

**Flowin** — a habit and personal-growth experience focused on turning consistency into visible progress.
