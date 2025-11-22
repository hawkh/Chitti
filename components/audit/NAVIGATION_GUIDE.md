# ISO Audit Dashboard - Navigation Guide

## Quick Access Map

### 🏠 Main Dashboard
**URL:** `/audit`

Your central hub for all audit features. Start here!

---

## 📋 Inspector Features

### 1. New Audit (Offline Ready) ⭐
**URL:** `/audit/inspector`

**What it does:**
- Create ISO 9001:2015 audits
- Upload evidence photos/videos
- Work offline automatically
- Auto-sync when online

**How to access:**
1. Go to `/audit`
2. Click "New Audit" card (blue, top-left)
3. Start filling out the form

**Offline Features:**
- 📱 Works without internet
- 💾 Auto-saves drafts locally
- 📸 Queues evidence uploads
- 🔄 Auto-syncs when online
- 🔔 Shows sync status

**Look for:**
- Floating sync indicator (bottom-right corner)
- Online/offline badge in header
- Orange notice when offline

---

### 2. Form Demo
**URL:** `/audit/form-demo`

**What it does:**
- Interactive demo of audit form
- Test all features
- See validation in action

**How to access:**
1. Go to `/audit`
2. Click "Form Demo" card

---

### 3. My Profile
**URL:** `/audit/profile`

**What it does:**
- View your profile
- Update settings
- Manage preferences

**How to access:**
1. Go to `/audit`
2. Click "My Profile" card

---

## 📊 Manager Features

### 1. Manager Dashboard
**URL:** `/audit/manager/dashboard`

**What it does:**
- Review pending audits
- View team metrics
- Approve/reject audits

**How to access:**
1. Go to `/audit`
2. Scroll to "Manager Tools"
3. Click "Manager Dashboard" card

---

### 2. Compliance Analytics
**URL:** `/audit/manager/analytics`

**What it does:**
- Site comparison
- Benchmarking
- Performance metrics

**How to access:**
1. Go to `/audit`
2. Click "Compliance Analytics" card

---

### 3. Compliance Scores
**URL:** `/audit/compliance`

**What it does:**
- View compliance trends
- Site benchmarks
- Historical data

**How to access:**
1. Go to `/audit`
2. Click "Compliance Scores" card

---

### 4. Trend Monitoring
**URL:** `/audit/trends`

**What it does:**
- Monitor performance trends
- View alerts
- Track improvements

**How to access:**
1. Go to `/audit`
2. Click "Trend Monitoring" card

---

## 🔄 PDCA & Continuous Improvement

### 1. PDCA Dashboard
**URL:** `/audit/pdca`

**What it does:**
- Track Plan-Do-Check-Act cycles
- View PDCA stage distribution
- Monitor cycle completion

**How to access:**
1. Go to `/audit`
2. Scroll to "PDCA & Continuous Improvement"
3. Click "PDCA Dashboard" card

---

### 2. PDCA Analytics
**URL:** `/audit/pdca/analytics`

**What it does:**
- Analyze PDCA trends
- Cycle completion metrics
- Stage distribution charts

**How to access:**
1. Go to `/audit`
2. Click "PDCA Analytics" card

---

### 3. Improvement Actions
**URL:** `/audit/improvement`

**What it does:**
- Track improvement initiatives
- Schedule follow-ups
- Measure effectiveness

**How to access:**
1. Go to `/audit`
2. Click "Improvement Actions" card

---

## 🛡️ Administration

### 1. Admin Panel
**URL:** `/audit/admin`

**What it does:**
- Manage users
- Configure sites
- System settings

**How to access:**
1. Go to `/audit`
2. Scroll to "Administration"
3. Click "Admin Panel" card

**Requires:** Admin role

---

### 2. Checklist Config
**URL:** `/audit/checklist-config`

**What it does:**
- Configure ISO 9001 checklist
- Edit questions
- Manage sections

**How to access:**
1. Go to `/audit`
2. Click "Checklist Config" card

**Requires:** Admin role

---

## 🔍 Finding Features

### By Role

**Inspector:**
- New Audit ⭐
- Form Demo
- My Profile

**Manager:**
- Manager Dashboard
- Compliance Analytics
- Compliance Scores
- Trend Monitoring

**Admin:**
- All of the above, plus:
- Admin Panel
- Checklist Config

### By Task

**Creating an Audit:**
→ `/audit/inspector`

**Reviewing Audits:**
→ `/audit/manager/dashboard`

**Viewing Compliance:**
→ `/audit/compliance` or `/audit/manager/analytics`

**Tracking PDCA:**
→ `/audit/pdca` or `/audit/pdca/analytics`

**Managing Improvements:**
→ `/audit/improvement`

**System Administration:**
→ `/audit/admin`

---

## 📱 Offline Features

### Where to Find Offline Support

**Primary Location:**
- `/audit/inspector` - Main audit form with offline support

**Indicators:**
- 🟢 Green Wifi icon = Online
- 🟠 Orange WifiOff icon = Offline
- Floating sync indicator (bottom-right)

### Using Offline Mode

1. **Go to Inspector Page:**
   - Navigate to `/audit/inspector`

2. **Check Status:**
   - Look at header for online/offline indicator
   - Orange banner appears when offline

3. **Work Normally:**
   - Fill out audit form
   - Upload evidence (gets queued)
   - Save drafts

4. **Monitor Sync:**
   - Click floating indicator (bottom-right)
   - See pending uploads
   - View sync progress

5. **Manual Sync:**
   - Click "Sync Now" button
   - Wait for completion

### Sync Indicator Location

```
┌─────────────────────────────────┐
│  Header                         │
├─────────────────────────────────┤
│                                 │
│  Audit Form Content             │
│                                 │
│                                 │
│                                 │
│                          ┌────┐ │
│                          │Sync│ │ ← Bottom-right corner
│                          └────┘ │
└─────────────────────────────────┘
```

---

## 🎯 Common Workflows

### Workflow 1: Create Audit (Online)

1. Go to `/audit`
2. Click "New Audit"
3. Fill out form
4. Upload evidence
5. Submit
6. Done! ✅

### Workflow 2: Create Audit (Offline)

1. Go to `/audit`
2. Click "New Audit"
3. See "Offline Mode" indicator
4. Fill out form
5. Upload evidence (queued)
6. Save draft
7. Come back online
8. Auto-sync happens
9. Submit
10. Done! ✅

### Workflow 3: Review Audits

1. Go to `/audit`
2. Click "Manager Dashboard"
3. View pending audits
4. Click audit to review
5. Approve or reject
6. Done! ✅

### Workflow 4: View Compliance

1. Go to `/audit`
2. Click "Compliance Scores"
3. Select sites to compare
4. View charts and trends
5. Export report if needed
6. Done! ✅

### Workflow 5: Track PDCA

1. Go to `/audit`
2. Click "PDCA Dashboard"
3. View cycle distribution
4. Check completion rates
5. Navigate to analytics for details
6. Done! ✅

---

## 🆘 Troubleshooting

### Can't Find a Feature?

1. **Start at Main Dashboard:**
   - Go to `/audit`
   - All features are linked from here

2. **Check Your Role:**
   - Some features require Manager or Admin role
   - Contact admin if you need access

3. **Use Browser Search:**
   - Press Ctrl+F (or Cmd+F on Mac)
   - Search for feature name on dashboard

### Sync Indicator Not Showing?

**Reason:** It auto-hides when:
- Queue is empty
- You're online
- No pending uploads

**Solution:**
- Upload evidence to see it appear
- Go offline to see offline indicator

### Can't Access a Page?

**Possible Reasons:**
1. Not logged in
2. Insufficient permissions
3. Wrong URL

**Solutions:**
1. Log in at `/audit/login`
2. Contact admin for role assignment
3. Start from main dashboard `/audit`

---

## 📚 Additional Resources

### Documentation

- **Offline Evidence Guide:** `components/audit/OFFLINE_EVIDENCE_GUIDE.md`
- **Form Engine Guide:** `components/audit/FORM_ENGINE_GUIDE.md`
- **PDCA Usage Guide:** `components/audit/PDCA_USAGE_GUIDE.md`
- **Compliance Guide:** `components/audit/COMPLIANCE_ANALYTICS_GUIDE.md`

### Support

- Check documentation files in `components/audit/`
- Review implementation guides in `.kiro/specs/iso-audit-dashboard/`
- Contact system administrator

---

## 🚀 Quick Tips

1. **Bookmark the Dashboard:**
   - Add `/audit` to your bookmarks
   - It's your starting point for everything

2. **Use Offline Mode:**
   - Don't worry about connectivity
   - System handles everything automatically

3. **Check Sync Status:**
   - Click the floating indicator anytime
   - See what's pending or failed

4. **Save Drafts Often:**
   - Use "Save Draft" button
   - Drafts persist even offline

5. **Explore Features:**
   - All features are on the main dashboard
   - Click around to discover capabilities

---

## 📞 Need Help?

**Can't find something?**
→ Start at `/audit` - everything is there!

**Offline issues?**
→ Check the floating sync indicator (bottom-right)

**Permission issues?**
→ Contact your system administrator

**Technical issues?**
→ Check browser console for errors

---

**Remember:** The main dashboard at `/audit` is your home base. Everything is accessible from there! 🏠
