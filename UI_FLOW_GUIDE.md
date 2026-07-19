# RevSheet - UI/UX Flow Guide

## 🎨 User Journey

```
┌─────────────────┐
│   User Visits   │
│   App (Home)    │
└────────┬────────┘
         │
         ├─→ [Not Logged In] → LoginPage / RegisterPage
         │
         └─→ [Logged In] → Dashboard
```

## 📊 Screen Navigation Map

```
                    ┌────────────────┐
                    │    Dashboard   │ ← Landing
                    └────────┬───────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Subjects    │  │    Topics    │  │Notifications │
    │   (Browse    │  │  (CRUD +     │  │ (View & Mark)│
    │    Create)   │  │  Repetition) │  │ (Auto-gen)   │
    └──────────────┘  └──────────────┘  └──────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │   Profile   │
                      │  / Logout   │
                      └─────────────┘
```

## 🖼️ Dashboard Layout

```
┌─────────────────────────────────────────────┐
│              NAVBAR / HEADER                │
│  Logo│Subjects│Topics│Notifications│Profile │
└─────────────────────────────────────────────┘
│
├─ Dashboard Title + Subtitle
│
├─ STATS GRID (4 Cards - Responsive)
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  │Total    │ │Complete │ │ Pending │ │Upcoming │
│  │Topics   │ │ Topics  │ │ Topics  │ │ (7 day) │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘
│
├─ SUBJECTS SECTION
│  ┌──────────┐ ┌──────────┐ ┌──────────┐
│  │📚 History│ │📖 Economy│ │✏️  Law    │
│  │3/10 done │ │5/15 done │ │8/12 done │
│  │Progress: │ │Progress: │ │Progress: │
│  │▓▓░░░░░░░░│ │▓▓▓▓▓░░░░░│ │▓▓▓▓▓▓▓▓░░│
│  └──────────┘ └──────────┘ └──────────┘
│
└─ RECENT TOPICS LIST
   ├─ [📚] Mughal Empire [High] Review: Dec 20
   ├─ [📚] British Raj [Medium] Review: Dec 22
   └─ [📚] Indian Constitution [High] ✓ Completed
```

## 📖 Subjects Page Layout

```
┌──────────────────────────────┐
│  Subjects              [+Add] │
└──────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Subject Cards Grid (Responsive)             │
│                                              │
│  ┌─────────────┐  ┌─────────────┐          │
│  │ 📚          │  │ 🎯          │          │
│  │ History     │  │ Economics   │          │
│  │ 10 topics   │  │ 15 topics   │          │
│  │ 3 complete  │  │ 8 complete  │          │
│  │ [Edit][Del] │  │ [Edit][Del] │          │
│  │ Progress:   │  │ Progress:   │          │
│  │ ▓▓▓░░░░░░░░ │  │ ▓▓▓▓▓▓░░░░░ │          │
│  └─────────────┘  └─────────────┘          │
│                                              │
│  [More cards...]                             │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Modal: Add/Edit Subject                      │
├──────────────────────────────────────────────┤
│ Subject Name: [___________________]         │
│ Description: [___________________]          │
│ Icon: [📚] [🎯] [📖] [🔬]...               │
│ Color: [●] [●] [●] [●]...                 │
├──────────────────────────────────────────────┤
│              [Cancel] [Create]              │
└──────────────────────────────────────────────┘
```

## 📝 Topics Page Layout

```
┌──────────────────────────────┐
│  Topics                 [+Add] │
└──────────────────────────────┘

Filters:
  Subject: [All Subjects ▼]
  Status:  [All] [Pending] [Completed]

┌────────────────────────────────────────────────────┐
│ Topic Cards (List View)                            │
│                                                    │
│ ┌─────────────────────────────────────────────┐  │
│ │ Title: The Mughal Empire                    │  │
│ │ Description: Focus on Akbar's administrative│  │
│ │ reforms and culture                         │  │
│ │ Tags: [History] [High] [Moderate]           │  │
│ │ Notes: Important for Paper 1 & 2            │  │
│ │                                             │  │
│ │ Next Review: Dec 20, 2024                   │  │
│ │ [✓] [Edit] [Delete]                         │  │
│ └─────────────────────────────────────────────┘  │
│                                                    │
│ ┌─────────────────────────────────────────────┐  │
│ │ Title: British Raj Period                   │  │
│ │ [📖 History] [Medium] [Easy]                │  │
│ │ ✓ Completed on Dec 15 | Rep: 2              │  │
│ │ [Edit] [Delete]                             │  │
│ └─────────────────────────────────────────────┘  │
│                                                    │
│ [More topics...]                                   │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ Modal: Add/Edit Topic                              │
├────────────────────────────────────────────────────┤
│ Title: [_____________________]                    │
│ Subject: [History ▼]                              │
│ Description: [_____________________]              │
│ Priority: ◉ Low  ○ Medium  ○ High                │
│ Difficulty: ◉ Easy  ○ Moderate  ○ Hard           │
│ Notes: [_____________________]                    │
├────────────────────────────────────────────────────┤
│              [Cancel] [Create]                    │
└────────────────────────────────────────────────────┘
```

## 🔔 Notifications Page Layout

```
┌──────────────────────────────┐
│  Notifications         [9]   │
│  Your review reminders       │
└──────────────────────────────┘

Filters: [All] [Unread] [Read]

┌────────────────────────────────────────────────────┐
│ Notification Items (Newest First)                  │
│                                                    │
│ ┌─────────────────────────────────────────────┐  │
│ │ 📋 Review Reminder                [NEW]     │  │
│ │ Title: The Mughal Empire                    │  │
│ │ Time to review: "The Mughal Empire" -       │  │
│ │ Day 3 of spaced repetition                  │  │
│ │ Created: Today at 10:30 AM                  │  │
│ │ [✓ Mark Read]                               │  │
│ └─────────────────────────────────────────────┘  │
│                                                    │
│ ┌─────────────────────────────────────────────┐  │
│ │ ✅ Completion Notice                  [Read]│  │
│ │ Title: Vedic Period                         │  │
│ │ Great job! Next review on Dec 20            │  │
│ │ Created: Yesterday at 2:15 PM               │  │
│ └─────────────────────────────────────────────┘  │
│                                                    │
│ [More notifications...]                           │
└────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme & Components

```
┌─ Color Palette ─────────────────┐
│ Primary: #3b82f6 (Blue)         │
│ Success: #10b981 (Green)        │
│ Warning: #f59e0b (Amber)        │
│ Danger:  #ef4444 (Red)          │
│ Dark:    #1f2937               │
│ Light:   #f3f4f6               │
└─────────────────────────────────┘

Badge Examples:
  [Low Priority]      - Green background
  [Medium Priority]   - Amber background
  [High Priority]     - Red background
  [Easy]              - Light gray
  [Moderate]          - Light gray
  [Hard]              - Light gray
  
Button States:
  Primary:    Blue bg, white text, hover darker
  Secondary:  Gray bg, dark text
  Danger:     Red bg, white text
  Disabled:   Reduced opacity, no hover
```

## 🔄 Interaction Flow

### Creating & Completing a Topic

```
User Action              System Response
─────────────────        ────────────────
1. Click "+ Add Topic"   → Modal opens

2. Fill form:
   - Title: "Topic name"
   - Subject: Select
   - Priority: Choose
   - Difficulty: Choose
   
3. Click "Create"        → Topic saved to DB
                         → Notification: "Topic created"
                         → nextReviewDate = Day 1
                         
4. Find topic            → Shows review date

5. Click "✓" button      → Modal confirmation
   (Mark as read)        → Topic marked as read
                         → repetitionCount++
                         → nextReviewDate = Day 3
                         → Notification created
                         → Toast: "Next review scheduled"
                         
6. Day 3 arrives         → Cron job creates notification
                         → Notification appears in Navbar
                         → User sees in Notifications page
                         
7. Click notification    → Shows topic again
                         → User reviews content
                         → Marks as read again
                         → Cycle continues...
```

## 📱 Responsive Breakpoints

```
Desktop (1920px+):
  ├─ 4-column grid layouts
  ├─ Full navbar with all text
  ├─ Side-by-side panels
  └─ Maximum width containers

Tablet (768px - 1024px):
  ├─ 2-column grid layouts
  ├─ Navbar with icons + labels
  ├─ Stacked panels
  └─ Medium width containers

Mobile (< 768px):
  ├─ 1-column layouts
  ├─ Icon-only navbar
  ├─ Full-width modals
  └─ Optimized touch targets
```

## 🎭 Animation Effects

```
Page Transitions:     Fade in + slide up
Component Hover:      Subtle scale + shadow
Modal Open:           Zoom in + fade overlay
Badge Appearance:     Fade + pop
Icon Hover:           Scale + color change
Loading State:        Pulse animation
Success Toast:        Slide in from top
```

## ✨ Visual Hierarchy

```
Level 1 (Most Important):
  - Page Title (h1, 32px, bold)
  - Call-to-action buttons
  - Unread notification badges

Level 2 (Important):
  - Section titles (h2, 22px)
  - Stats values
  - Topic titles

Level 3 (Supporting):
  - Descriptions
  - Metadata (dates, counts)
  - Filter options

Level 4 (Secondary):
  - Helper text
  - Timestamps
  - Muted information
```

---

This UI is designed for maximum usability during UPSC exam preparation with focus on clarity and quick information scanning. 📚
