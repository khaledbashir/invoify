# Would Ahmad Think It's Shit? - UX Evaluation Framework

## Overview

This framework provides a systematic approach to evaluating user experience from the perspective of "Ahmad" - a pragmatic user who wants tools that work efficiently without unnecessary complexity. The framework focuses on 5 core axes that determine whether a product feels intuitive and respectful of the user's time and intelligence.

## The 5 Core Axes

### 1. CLARITY (0-2 points)

**Score Guide:**
- **0/2 (EXCELLENT):** User understands everything in 2-3 seconds
- **1/2 (MEH):** Mostly clear, but some confusion
- **2/2 (SHIT):** Confusing, abstract, or overwhelming

**What to Check:**
- Are labels and buttons clear and actionable?
- Can users understand what each view/mode does?
- Is there a clear visual hierarchy?
- Do error messages explain what went wrong and how to fix it?

**Red Flags:**
- Abstract labels ("Ingestion", "Intelligence Engine", "Math")
- No clear primary actions
- Everything looks the same weight
- Vague error messages

**Quick Wins:**
- Use user-friendly terminology
- Add clear visual hierarchy
- Provide actionable error messages
- Show examples or placeholders

---

### 2. NAVIGATION (0-2 points)

**Score Guide:**
- **0/2 (EXCELLENT):** Never lost, always know where you are
- **1/2 (MEH):** Can navigate, but sometimes confused
- **2/2 (SHIT):** Frequently lost, disorienting layout

**What to Check:**
- Can users understand the flow in 2-3 seconds?
- Are there breadcrumbs or progress indicators?
- Can users easily go back to previous steps?
- Does navigation hide important labels when collapsed?

**Red Flags:**
- Three-pane layouts with stacked panels
- No breadcrumbs or "you are here" indicators
- Sidebar collapse hides navigation labels
- Too many view modes without clear purpose

**Quick Wins:**
- Add progress indicators (Step 1 of 4)
- Keep navigation labels visible
- Add breadcrumbs for deep navigation
- Simplify view modes

---

### 3. EFFORT TO DO BASICS (0-2 points)

**Score Guide:**
- **0/2 (EXCELLENT):** Common tasks take 1-2 clicks
- **1/2 (MEH):** Doable, but requires too many steps
- **2/2 (SHIT):** Simple tasks require complex workflows

**What to Check:**
- How many clicks to create a new item?
- Are critical actions buried in menus/accordions?
- Can users do common tasks without hunting?
- Are there bulk operations for repetitive tasks?

**Red Flags:**
- Browser prompts for input (unacceptable in 2026)
- Critical actions buried 4+ clicks deep
- No bulk operations
- Expanding/collapsing required for basic editing

**Quick Wins:**
- Replace prompts with proper modals
- Make critical actions always visible
- Add bulk operations
- Reduce clicks for common tasks

---

### 4. VISUAL SANITY (0-2 points)

**Score Guide:**
- **0/2 (EXCELLENT):** Clean, scannable, appropriate density
- **1/2 (MEH):** Too much information, but usable
- **2/2 (SHIT):** Overwhelming, poor contrast, decorative animations

**What to Check:**
- Is information density overwhelming?
- Is there sufficient contrast (4.5:1 ratio)?
- Do animations slow down interaction?
- Can users quickly identify what's important?

**Red Flags:**
- Low contrast text (zinc-500 on zinc-950)
- Decorative animations >150ms
- Too much information in one view
- No visual hierarchy

**Quick Wins:**
- Improve contrast (zinc-500 → zinc-400 on dark)
- Remove or speed up animations
- Use progressive disclosure
- Add visual hierarchy

---

### 5. RESPECT FOR USER (0-2 points)

**Score Guide:**
- **0/2 (EXCELLENT):** Feels respectful, forgiving, helpful
- **1/2 (MEH):** Mostly respectful, but some frustrations
- **2/2 (SHIT):** Feels hostile, unforgiving, condescending

**What to Check:**
- Are there undo options for destructive actions?
- Does the app validate input before submission?
- Are error messages helpful or blaming?
- Can users recover from mistakes?

**Red Flags:**
- No undo for delete actions
- Browser prompts for input
- Instant destructive actions without confirmation
- Vague error messages

**Quick Wins:**
- Add undo with toast notifications
- Replace prompts with proper forms
- Add confirmation for destructive actions
- Provide helpful error messages

---

## The "Ahmad Vibe" Test

### Mental Mapping Test
**Question:** Can a user understand the flow in 2-3 seconds?

**Pass Criteria:**
- Clear purpose of each view/mode
- Obvious next steps
- No hidden workflows

**Fail Indicators:**
- Multiple stacked panels
- Abstract labels
- Hidden critical actions

---

### Built for User vs KPI Test
**Question:** Does it feel built for the user or for internal metrics?

**Pass Criteria:**
- Features solve real user problems
- Workflows are streamlined
- No over-engineering

**Fail Indicators:**
- Complex workflows for simple tasks
- Unnecessary animations
- Feature creep

---

### One-Sentence Explanation Test
**Question:** Can you explain the core workflow in one sentence?

**Pass Criteria:**
- "To create a proposal, upload your Excel and click export."
- <10 words, <3 steps

**Fail Indicators:**
- >30 words
- >5 steps
- Requires technical jargon

---

## Scoring System

**Total Score: 0-10 points**

| Score Range | Verdict | Action |
|-------------|---------|--------|
| 0-3 | Excellent | Ship it |
| 4-6 | Good | Minor tweaks |
| 7-8 | Meh | Needs work |
| 9-10 | Shit | Critical issues |

**Note:** Lower is better! Each axis is scored 0-2, where 0 is excellent and 2 is shit.

---

## Quick Wins Checklist

### Fixable in 1 Day (4-6 hours total)

1. **Replace browser prompts** (30 min)
   - Use proper modal components
   - Add validation
   - Allow editing after creation

2. **Simplify labels** (15 min)
   - Use user-friendly terms
   - Avoid engineering jargon
   - Test with non-technical users

3. **Add progress indicators** (1 hour)
   - Show step numbers (1 of 4)
   - Add visual progress bar
   - Allow jumping to previous steps

4. **Make critical actions visible** (30 min)
   - Remove accordions for important features
   - Show upload buttons by default
   - Reduce clicks to 1-2

5. **Add undo for delete** (45 min)
   - Show toast with undo button
   - Keep deleted items in memory for 30 seconds
   - Restore to original position

6. **Fix contrast** (30 min)
   - Change zinc-500 to zinc-400 on dark backgrounds
   - Ensure 4.5:1 contrast ratio
   - Test with color blindness simulators

7. **Remove slow animations** (15 min)
   - Reduce duration from 500ms to 150ms
   - Or remove entirely
   - Test for perceived performance

---

## Implementation Guidelines

### Before Making Changes

1. **Audit the current state**
   - Score each axis (0-2)
   - Document specific issues
   - Prioritize by impact vs effort

2. **Create a baseline**
   - Record current user flow
   - Measure task completion time
   - Note user pain points

3. **Plan the fixes**
   - Start with quick wins
   - Group related changes
   - Test with real users

### While Making Changes

1. **Follow the principle of least surprise**
   - Actions should do what users expect
   - Consistent patterns throughout
   - No hidden behaviors

2. **Respect the user's intelligence**
   - Don't dumb things down
   - Provide helpful guidance
   - Trust users to make decisions

3. **Optimize for the 80% use case**
   - Most users want to do basic tasks
   - Advanced features should be secondary
   - Don't optimize for edge cases

### After Making Changes

1. **Test with real users**
   - Observe without interfering
   - Note where they struggle
   - Ask them to explain the flow

2. **Measure improvement**
   - Re-score each axis
   - Compare task completion times
   - Track error rates

3. **Iterate**
   - Fix new issues that emerge
   - Refine based on feedback
   - Don't ship until it passes

---

## Common Anti-Patterns

### 1. The "Spaceship Control Panel"
**Symptom:** Too many controls, labels, and indicators
**Fix:** Progressive disclosure, hide advanced features

### 2. The "Rube Goldberg Machine"
**Symptom:** Simple tasks require complex workflows
**Fix:** Streamline to 1-2 clicks for common tasks

### 3. The "Mystery Meat Navigation"
**Symptom:** Icons without labels, abstract terms
**Fix:** Use clear labels, add tooltips

### 4. The "Browser Prompt"
**Symptom:** Using `window.prompt()` for input
**Fix:** Always use proper form modals

### 5. The "Instant Delete"
**Symptom:** Destructive actions without undo
**Fix:** Always provide undo with toast

### 6. The "Animation Overload"
**Symptom:** Decorative animations >150ms
**Fix:** Remove or speed up to <150ms

### 7. The "Low Contrast"
**Symptom:** Text that's hard to read
**Fix:** Ensure 4.5:1 contrast ratio

---

## Case Study: ANC Proposal Engine

### Before (Score: 8/14 - SHIT)

**Issues:**
- Browser prompt for client name
- Abstract wizard labels ("Ingestion", "Math")
- Excel upload buried in accordion
- No undo for delete
- Slow animations (500ms)
- Low contrast text

### After (Score: 3/14 - Good)

**Fixes:**
- ✅ Replaced prompt with proper modal
- ✅ Simplified labels (Setup, Configure, Review, Export)
- ✅ Made Excel upload always visible
- ✅ Added undo for delete with toast
- ✅ Reduced animations to 150ms
- ✅ Improved contrast (zinc-500 → zinc-400)

**Result:** Ahmad would say "This is good. I can create a proposal without fighting the interface."

---

## Conclusion

The "Would Ahmad Think It's Shit?" framework is a practical tool for evaluating UX from a user's perspective. By focusing on clarity, navigation, effort, visual sanity, and respect, you can identify and fix critical issues before they reach users.

**Remember:**
- Lower scores are better
- Focus on the 80% use case
- Respect the user's time and intelligence
- Test with real users
- Iterate based on feedback

**Ahmad's Final Verdict:** "Make it simple, make it fast, make it respectful. Anything else is shit."
