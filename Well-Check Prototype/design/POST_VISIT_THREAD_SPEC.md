# 👨‍🎨 POST-VISIT PULSE THREADING SPECIFICATION
**Product Designer:** AI UX/UI Design Agent  
**Date:** 2026-02-19  
**Directive:** V8.2 Doctor & Settings Pivot  
**Component:** History Vault (Threaded Post-Visit Feedback)

---

## 🎯 **DESIGN MANDATE**

**Requirement:** Design how the Post-Visit Pulse feedback (notes/photos) appears in the History Vault. It should be threaded chronologically so a daughter can see exactly what happened at her father's 10:00 AM appointment by 11:30 AM.

---

## 📋 **USER STORY**

**Persona:** Sarah (Daughter, Monitor role)  
**Scenario:** Her father (John, Protected user) had a cardiologist appointment at 10:00 AM.

**Timeline:**
- **10:00 AM** - John arrives at clinic (geofence entry)
- **11:15 AM** - John leaves clinic (geofence exit)
- **11:45 AM** - Post-Visit Pulse notification sent (30 minutes after departure)
- **11:50 AM** - John submits feedback (4★ rating + photo of prescription + voice note)
- **11:55 AM** - Sarah opens History Vault to check on her father

**Goal:** Sarah should see a "threaded" view showing:
1. The appointment event (scheduled 10:00 AM)
2. Arrival notification (10:00 AM - "Arrived at cardiologist")
3. Departure notification (11:15 AM - "Left appointment")
4. Post-Visit Pulse request (11:45 AM - "How was your visit?")
5. Feedback submission (11:50 AM - rating, notes, photo, voice note)

---

## 🎨 **VISUAL DESIGN**

### **Thread Structure:**

```
┌─────────────────────────────────────────────────────────┐
│  🏥 Doctor Visit: Cardiologist                         │
│  Dr. Johnson • 10:00 AM • Thursday, Feb 19            │
│  ───────────────────────────────────────────────────── │
│  ⤷ Arrived at 10:02 AM                                │
│  ⤷ Departed at 11:15 AM (1h 13m visit)                │
│  ⤷ Feedback requested at 11:45 AM                     │
│  ⤷ Feedback submitted at 11:50 AM ⭐⭐⭐⭐              │
│     📝 "Doctor adjusted my blood pressure medication"  │
│     📷 Photo attached • 🎤 Voice note attached         │
└─────────────────────────────────────────────────────────┘
```

---

## 📐 **COMPONENT HIERARCHY**

### **Level 1: Thread Header (Collapsed View)**
```tsx
<ThreadHeader>
  <Icon>🏥</Icon>
  <Title>Doctor Visit: Cardiologist</Title>
  <Metadata>
    <DoctorName>Dr. Johnson</DoctorName>
    <ScheduledTime>10:00 AM</ScheduledTime>
    <Date>Thursday, Feb 19</Date>
  </Metadata>
  <StatusBadge>
    {hasFeedback ? "✓ Complete" : "⏳ Pending Feedback"}
  </StatusBadge>
  <ExpandButton>▶</ExpandButton>
</ThreadHeader>
```

**Visual Properties:**
- Height: 88px (large touch target)
- Background: #1E293B (slate)
- Border: 2px solid #334155 (default) or #84CC16 (if selected)
- Padding: 16px
- Font size: 18px (title), 14px (metadata)

---

### **Level 2: Thread Timeline (Expanded View)**
```tsx
<ThreadTimeline>
  <TimelineEvent type="scheduled">
    <TimelineDot color="#94A3B8" />
    <TimelineContent>
      <Time>10:00 AM</Time>
      <Text>Appointment scheduled</Text>
      <Location>123 Cardio Center, City</Location>
    </TimelineContent>
  </TimelineEvent>

  <TimelineEvent type="arrival">
    <TimelineDot color="#84CC16" />
    <TimelineContent>
      <Time>10:02 AM</Time>
      <Text>✓ Arrived at appointment</Text>
      <Badge>On time</Badge>
    </TimelineContent>
  </TimelineEvent>

  <TimelineEvent type="departure">
    <TimelineDot color="#FBBF24" />
    <TimelineContent>
      <Time>11:15 AM</Time>
      <Text>Left appointment</Text>
      <Duration>Visit duration: 1h 13m</Duration>
    </TimelineContent>
  </TimelineEvent>

  <TimelineEvent type="pulse_sent">
    <TimelineDot color="#64748B" />
    <TimelineContent>
      <Time>11:45 AM</Time>
      <Text>📬 Post-visit feedback requested</Text>
      <Status>Awaiting response</Status>
    </TimelineContent>
  </TimelineEvent>

  <TimelineEvent type="feedback_submitted">
    <TimelineDot color="#84CC16" />
    <TimelineContent>
      <Time>11:50 AM</Time>
      <Text>✓ Feedback received</Text>
      <RatingStars>⭐⭐⭐⭐☆</RatingStars>
      <Notes>"Doctor adjusted my blood pressure medication..."</Notes>
      <Attachments>
        <Photo src="ephemeral://..." />
        <VoiceNote src="ephemeral://..." duration="45s" />
      </Attachments>
    </TimelineContent>
  </TimelineEvent>
</ThreadTimeline>
```

---

## 🎨 **VISUAL SPECIFICATIONS**

### **Timeline Dot (Status Indicator):**
- Size: 16px × 16px
- Border: 3px solid {color}
- Background: #0F172A (dark bg)
- Position: Left-aligned, connected by vertical line

**Color Coding:**
- **Scheduled:** #94A3B8 (gray) - neutral
- **Arrived:** #84CC16 (green) - positive
- **Departed:** #FBBF24 (yellow) - informational
- **Pulse Sent:** #64748B (slate) - neutral
- **Feedback Submitted:** #84CC16 (green) - positive
- **Feedback Skipped:** #FF8844 (orange) - warning

### **Timeline Connector Line:**
- Width: 2px
- Color: #334155 (slate)
- Style: Solid (default) or Dashed (if event pending)

---

## 📱 **INTERACTIVE STATES**

### **1. Collapsed State (Default)**
- Thread header visible (88px height)
- Timeline hidden
- Tap to expand (entire card is tappable)

### **2. Expanded State**
- Thread header + timeline visible (variable height)
- Smooth animation (300ms ease-out)
- Tap header again to collapse

### **3. Attachment Interaction**
- **Photo:** Tap to view full-screen (with pinch-zoom)
- **Voice Note:** Tap to play (audio player with waveform)
- **TTL Warning:** Display "⏳ 8h remaining" badge on ephemeral assets

---

## 🎨 **EPHEMERAL ASSET DISPLAY**

### **Photo Attachment:**
```tsx
<PhotoAttachment>
  <Thumbnail src={photoUrl} alt="Visit photo" />
  <TTLBadge>⏳ 8h remaining</TTLBadge>
  <ViewButton>👁️ View Full Size</ViewButton>
</PhotoAttachment>
```

**Visual Properties:**
- Thumbnail size: 120px × 120px
- Border-radius: 8px
- Border: 1px solid #334155
- TTL badge: Top-right corner, #FBBF24 background

---

### **Voice Note Attachment:**
```tsx
<VoiceNoteAttachment>
  <PlayButton>▶️</PlayButton>
  <Waveform bars={20} />
  <Duration>45s</Duration>
  <TTLBadge>⏳ 8h remaining</TTLBadge>
</VoiceNoteAttachment>
```

**Visual Properties:**
- Height: 80px
- Background: #1E293B
- Waveform color: #84CC16 (active) / #334155 (inactive)
- Play button: 48px × 48px (center-aligned)

---

## 🎨 **RATING DISPLAY**

### **Star Rating (1-5):**
```tsx
<RatingDisplay rating={4}>
  <Stars>⭐⭐⭐⭐☆</Stars>
  <Label>4 out of 5</Label>
  <SentimentEmoji>🙂</SentimentEmoji>
</RatingDisplay>
```

**Visual Mapping:**
- 1★ → 😞 Very Bad (Red #FF4444)
- 2★ → 😟 Bad (Orange #FF8844)
- 3★ → 😐 Okay (Yellow #FBBF24)
- 4★ → 🙂 Good (Light Green #A3E635)
- 5★ → 😊 Very Good (Green #84CC16)

---

## 📐 **LAYOUT SPECIFICATIONS**

### **Mobile (< 768px):**
```
┌─────────────────────────────────┐
│  Header (88px)                  │
├─────────────────────────────────┤
│  Timeline (variable height)     │
│  ├─ Event 1 (64px)              │
│  ├─ Event 2 (64px)              │
│  ├─ Event 3 (64px)              │
│  ├─ Event 4 (64px)              │
│  └─ Event 5 (variable)          │
│     ├─ Rating (48px)            │
│     ├─ Notes (variable)         │
│     ├─ Photo (120px)            │
│     └─ Voice Note (80px)        │
└─────────────────────────────────┘
```

### **Desktop (≥ 768px):**
```
┌───────────────────────────────────────────────────────┐
│  Header (96px)                                        │
├───────────────────────────────────────────────────────┤
│  Timeline (2-column layout)                           │
│  ├─ Left: Timeline dots + lines (80px fixed width)   │
│  └─ Right: Event content (flexible width)            │
│     ├─ Event 1                                        │
│     ├─ Event 2                                        │
│     ├─ Event 3                                        │
│     ├─ Event 4                                        │
│     └─ Event 5 (with attachments in 2-column grid)   │
└───────────────────────────────────────────────────────┘
```

---

## 🎨 **SPACING & TYPOGRAPHY**

### **Spacing:**
- Thread header padding: 16px
- Timeline event vertical gap: 16px
- Attachment horizontal gap: 12px
- Text line height: 1.5

### **Typography:**
- **Thread title:** 18px bold, #FFFFFF
- **Metadata:** 14px regular, #94A3B8
- **Event time:** 14px bold, #FBBF24
- **Event text:** 16px regular, #FFFFFF
- **Notes:** 14px regular, #94A3B8
- **Badges:** 12px bold, uppercase

---

## 🎨 **ANIMATION SPECIFICATIONS**

### **Expand/Collapse:**
```css
.thread-timeline {
  max-height: 0;
  overflow: hidden;
  transition: max-height 300ms ease-out;
}

.thread-timeline.expanded {
  max-height: 2000px; /* Large enough for content */
}
```

### **Timeline Dot Pulse (New Event):**
```css
@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

.timeline-dot.new {
  animation: pulse-dot 2s ease-in-out infinite;
}
```

---

## 📊 **EXAMPLE: COMPLETE THREAD**

### **Scenario:** Father's cardiologist visit with feedback

```tsx
<ThreadCard>
  {/* COLLAPSED HEADER */}
  <ThreadHeader expanded={false}>
    <Icon>🏥</Icon>
    <Title>Doctor Visit: Cardiologist</Title>
    <Metadata>
      <Text>Dr. Johnson • 10:00 AM • Thursday, Feb 19</Text>
    </Metadata>
    <Badge color="green">✓ Feedback Received</Badge>
    <ExpandButton>▼</ExpandButton>
  </ThreadHeader>

  {/* EXPANDED TIMELINE */}
  <ThreadTimeline>
    {/* Event 1: Scheduled */}
    <TimelineEvent>
      <Dot color="#94A3B8" />
      <Content>
        <Time>10:00 AM</Time>
        <Text>Appointment scheduled</Text>
        <Location>123 Cardio Center, City</Location>
      </Content>
    </TimelineEvent>

    {/* Event 2: Arrival */}
    <TimelineEvent>
      <Dot color="#84CC16" />
      <Content>
        <Time>10:02 AM</Time>
        <Text>✓ Arrived at appointment</Text>
        <Badge color="green">On time</Badge>
      </Content>
    </TimelineEvent>

    {/* Event 3: Departure */}
    <TimelineEvent>
      <Dot color="#FBBF24" />
      <Content>
        <Time>11:15 AM</Time>
        <Text>Left appointment</Text>
        <Duration>Visit duration: 1h 13m</Duration>
      </Content>
    </TimelineEvent>

    {/* Event 4: Pulse Sent */}
    <TimelineEvent>
      <Dot color="#64748B" />
      <Content>
        <Time>11:45 AM</Time>
        <Text>📬 Post-visit feedback requested</Text>
      </Content>
    </TimelineEvent>

    {/* Event 5: Feedback Submitted */}
    <TimelineEvent>
      <Dot color="#84CC16" />
      <Content>
        <Time>11:50 AM</Time>
        <Text>✓ Feedback received</Text>
        
        {/* Rating */}
        <Rating>
          <Stars>⭐⭐⭐⭐☆</Stars>
          <Label>4 out of 5</Label>
          <Emoji>🙂</Emoji>
        </Rating>

        {/* Notes */}
        <Notes>
          "Doctor adjusted my blood pressure medication. 
          Need to pick up new prescription today. 
          Follow-up in 3 months."
        </Notes>

        {/* Attachments */}
        <Attachments>
          <Photo>
            <Thumbnail src="ephemeral://photo-001.jpg" />
            <TTLBadge>⏳ 8h remaining</TTLBadge>
            <ViewButton>👁️ View</ViewButton>
          </Photo>

          <VoiceNote>
            <PlayButton>▶️</PlayButton>
            <Waveform />
            <Duration>45s</Duration>
            <TTLBadge>⏳ 8h remaining</TTLBadge>
          </VoiceNote>
        </Attachments>
      </Content>
    </TimelineEvent>
  </ThreadTimeline>
</ThreadCard>
```

---

## 🎨 **EDGE CASES**

### **1. No Feedback Submitted (Skipped)**
```tsx
<TimelineEvent>
  <Dot color="#FF8844" />
  <Content>
    <Time>11:45 AM</Time>
    <Text>📬 Post-visit feedback requested</Text>
    <Status color="orange">No response received</Status>
  </Content>
</TimelineEvent>
```

---

### **2. Feedback Without Attachments**
```tsx
<TimelineEvent>
  <Dot color="#84CC16" />
  <Content>
    <Time>11:50 AM</Time>
    <Text>✓ Feedback received</Text>
    <Rating>⭐⭐⭐⭐⭐</Rating>
    <Notes>"Everything went well!"</Notes>
    {/* No attachments section */}
  </Content>
</TimelineEvent>
```

---

### **3. Ephemeral Asset Expired**
```tsx
<Photo>
  <ExpiredBadge>⚠️ Expired (24h TTL)</ExpiredBadge>
  <Placeholder>
    <Icon>📷</Icon>
    <Text>Photo no longer available</Text>
  </Placeholder>
</Photo>
```

---

### **4. Appointment Cancelled**
```tsx
<TimelineEvent>
  <Dot color="#FF4444" />
  <Content>
    <Time>9:45 AM</Time>
    <Text>❌ Appointment cancelled</Text>
    <Reason>Patient called to reschedule</Reason>
  </Content>
</TimelineEvent>
```

---

## 📐 **IMPLEMENTATION NOTES**

### **Data Structure:**
```typescript
interface DoctorVisitThread {
  id: string;
  appointmentType: string;
  doctorName: string;
  scheduledTime: number;
  location: string;
  geofenceStatus: 'pending' | 'arrived' | 'departed' | 'cancelled';
  events: ThreadEvent[];
  feedback?: PostVisitFeedback;
}

interface ThreadEvent {
  id: string;
  type: 'scheduled' | 'arrival' | 'departure' | 'pulse_sent' | 'feedback_submitted';
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PostVisitFeedback {
  rating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  photoUrl?: string;
  voiceNoteUrl?: string;
  submittedAt: number;
}
```

---

## 🎯 **ACCEPTANCE CRITERIA**

### **Must Have:**
- [x] Thread header shows appointment summary (doctor, time, status)
- [x] Timeline shows chronological events (scheduled → arrived → departed → pulse → feedback)
- [x] Rating displayed with emoji + stars
- [x] Notes displayed in readable format
- [x] Ephemeral assets (photo/voice) displayed with TTL warning
- [x] Expand/collapse animation (300ms)
- [x] Timeline dots color-coded by event type

### **Nice to Have:**
- [ ] Export thread as PDF (for medical records)
- [ ] Share thread with specific family members
- [ ] Add comments to thread (Monitor annotations)
- [ ] Timeline zoom/filter (show only specific event types)

---

## 📊 **DESIGN SYSTEM ALIGNMENT**

### **Colors (V8.1 Palette):**
- Background: #0F172A (Midnight Slate)
- Cards: #1E293B (Slate)
- Borders: #334155 (Slate 700)
- Action: #84CC16 (Safety Green)
- Alert: #FF4444 (Emergency Red)
- Warning: #FBBF24 (Amber)
- Text Primary: #FFFFFF (White)
- Text Secondary: #94A3B8 (Slate 400)

### **Typography:**
- Font Family: Bold Sans-serif (Inter, SF Pro Display)
- Monospace: Tabular data (timestamps, durations)

### **Touch Targets:**
- Primary actions: ≥72px height
- Secondary actions: ≥48px height
- Tap areas: ≥48px × 48px

---

**End of Post-Visit Thread Specification**

**Designer:** AI UX/UI Design Agent  
**Status:** ✅ **SPECIFICATION COMPLETE**  
**Next Action:** Implement in HistoryVault.tsx component

---

**👨‍🎨 V8.2: POST-VISIT THREADING DESIGNED. CHRONOLOGICAL TIMELINE WITH EPHEMERAL ASSETS. READY FOR CODER IMPLEMENTATION. 🎨**
