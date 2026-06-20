# User Personas

These four personas represent the primary user types for CivicsStudy.com. Use them when making product, design, and content decisions.

---

## 1. Maria — The Motivated Immigrant

**The primary persona. Design for her first.**

| | |
|---|---|
| Age | 35–55 |
| Primary language | Spanish |
| Interview timeline | 2–4 months away |
| Device | Mobile (iPhone or Android) |
| Study pattern | 20–30 min/day, usually evenings or commute |

### Context
Maria has been a lawful permanent resident for several years. Her interview is scheduled. She is highly motivated but anxious — she understands the stakes. Every app she's tried has been multiple choice, which doesn't reflect how the actual interview works. She wants to practice in a way that feels close to the real thing.

### Goals
- Know exactly which questions she has mastered vs. still needs to work on
- Practice in Spanish when possible, then check English
- Build confidence through repetition and clear progress signals
- Get through all 128 questions before her interview date

### Pain points
- Multiple-choice apps don't match the oral interview format
- Can't tell at a glance what she still needs to study
- Loses progress if she switches devices or browsers
- The "variable answer" questions (senators, governor, capital) require her specific state info

### Design implications
- Spanish content and EN/ES toggle must be immediately visible — not buried in a menu
- Category progress bars on the dashboard are critical for her ("what do I still need?")
- Session resume matters — she studies in bursts and needs to pick up where she left off
- Streak and last-studied signal reinforce her daily habit
- Confetti and positive feedback on milestones, not every single answer

---

## 2. Robert — The 65/20 Candidate

**Design for accessibility and simplicity.**

| | |
|---|---|
| Age | 65+ |
| Primary language | English or Spanish |
| Interview timeline | Varies — has already qualified for the 65/20 exemption |
| Device | Tablet or desktop, occasionally mobile |
| Study pattern | Irregular — may study a few times a week with family help |

### Context
Robert has been a permanent resident for 20+ years. Under the 65/20 rule, he only needs to study the 20 specially marked (starred) questions. The officer will ask 10 of them, and he needs 6 correct to pass. He is less tech-comfortable and may be studying alongside a family member who helps navigate the app.

### Goals
- Know immediately that he only needs 20 questions, not 128
- Study only those 20 in a simple, distraction-free interface
- Practice with a family member present who can prompt him

### Pain points
- Standard study mode shows all 128 questions — overwhelming and irrelevant to him
- Small UI elements and low-contrast text are hard to read
- Technical jargon ("65/20 mode", "starred questions") requires explanation before it makes sense
- Switching devices is common (might start on a tablet, continue on a phone with a family member)

### Design implications
- The 65/20 mode should be labeled clearly: "65+ Rule — Just 20 questions"
- First-time onboarding should explain the rule in plain language before he starts
- Text size, tap target size, and contrast matter more for this persona
- Streak is less important than raw completion — he just needs to pass once
- Saving progress to the DB (not just localStorage) is important since he may switch devices

---

## 3. Alex — The Time-Crunched Candidate

**Optimize for speed of re-entry.**

| | |
|---|---|
| Age | 28–40 |
| Primary language | English |
| Interview timeline | 1–3 months away |
| Device | Phone (commute), laptop (lunch break) |
| Study pattern | 5–15 minute bursts, multiple times per day |

### Context
Alex works full-time and studies in stolen moments — waiting for the subway, eating lunch at a desk. He doesn't have long focused sessions. He needs to jump in fast, study a few questions, and get out. He trusts that the app is tracking his progress accurately so he doesn't have to think about it.

### Goals
- Immediately see where he stands without navigating menus
- Resume quickly from where he left off (no re-reading what he already knows)
- Know which categories are weakest so he can drill those specifically
- Take mock tests to simulate test-day pressure

### Pain points
- Apps that require setup or orientation before he can study anything
- Starting from question 1 every time instead of resuming
- No way to drill a specific weak area — has to study all 128 every time
- Mock test results that don't show him *what* he got wrong and *why*

### Design implications
- Dashboard must answer "what should I do right now?" in under 3 seconds
- Session resume is a top-priority feature for this persona
- "Needs Practice" study mode is his primary mode once he's studied the full set once
- Category drill is important — he wants to fix "1800s" specifically, not re-do everything
- Keyboard shortcuts matter for desktop study sessions
- Cross-device sync (DB-backed progress) is critical

---

## 4. Elena — The Supporter

**A secondary persona — design to make her invisible in the primary flow.**

| | |
|---|---|
| Age | 25–45 |
| Primary language | English (native) |
| Role | Spouse, child, or friend helping an immigrant study |
| Device | Phone or laptop |
| Study pattern | Studies alongside the primary user (Maria or Robert) |

### Context
Elena is not taking the test herself. She sits with her parent or spouse and helps them practice. She reads questions aloud, checks the answers, and tracks their progress. She may set up the account on their behalf or be the one explaining how the app works to them.

### Goals
- Understand the app quickly enough to help someone else use it
- See the primary user's progress at a glance ("how are they doing overall?")
- Know what the real test looks like so she can set expectations accurately
- Share progress with other family members ("mom got 12/12 today!")

### Pain points
- Apps that assume the user is studying alone
- No way to quickly check "what do they still need to work on?"
- Share functionality that is hard to find or confusing to use
- Language barrier if the app is English-only and the primary user is ES

### Design implications
- The landing page's "how it works" section needs to serve Elena as much as Maria — she's often the one who discovers and sets up the app
- Share score / share progress should be easy to find and use after a session
- The dashboard's category progress bars serve Elena well — she can see the full picture at a glance
- The founder story on the landing page builds trust with Elena as much as with Maria

---

## Summary

| Persona | Primary device | Language | Streak matters? | Session resume? | Most critical feature |
|---|---|---|---|---|---|
| Maria | Mobile | Spanish/EN | Yes | Yes | Category progress + EN/ES toggle |
| Robert | Tablet/desktop | EN or ES | No | Somewhat | 65/20 mode clarity + accessibility |
| Alex | Mobile + laptop | English | Somewhat | Yes (critical) | Dashboard orientation + category drill |
| Elena | Phone/laptop | English | No | No | Shareable results + landing page clarity |
