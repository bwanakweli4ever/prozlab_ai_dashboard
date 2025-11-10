# 🔗 Shared Constants - Specialties Synchronization

## 🎯 What Was Done

Synchronized the specialties/skills between `/proz` and `/onboarding-wizard` routes by creating a shared constants file.

## ✅ Problem Solved

**Before:**
- `/onboarding-wizard` had its own hardcoded list of skills
- `/proz` had its own hardcoded list of specialties
- No guarantee they would stay in sync
- Duplicate code maintenance

**After:**
- Single source of truth in `lib/constants.ts`
- Both routes use the same shared constants
- Guaranteed synchronization
- Easy to add/remove specialties in one place

## 📁 New File Created

### `lib/constants.ts`

This file contains all shared constants used across the application:

```typescript
// Specialties/Skills with icons and colors
export const TECH_SKILLS = [...]

// Simple array of specialty names
export const SPECIALTIES = TECH_SKILLS.map(skill => skill.name)

// Availability options
export const AVAILABILITY_OPTIONS = [...]

// Experience levels
export const EXPERIENCE_LEVELS = [...]

// Specialty synonyms for better matching
export const SPECIALTY_SYNONYMS = {...}

// Categories for grouping
export const SPECIALTY_CATEGORIES = [...]
```

## 🔄 Files Updated

### 1. `/onboarding-wizard/page.tsx`
**Before:**
```typescript
const techSkills = [
  { name: "Computer Repair", icon: Laptop, ... },
  // ... hardcoded list
]

const experienceLevels = [
  { level: "0-1 years", ... },
  // ... hardcoded list
]
```

**After:**
```typescript
import { TECH_SKILLS, EXPERIENCE_LEVELS } from "@/lib/constants"

// Use imported constants directly
{TECH_SKILLS.map((skill) => ...)}
{EXPERIENCE_LEVELS.map((exp) => ...)}
```

### 2. `/proz/page.tsx`
**Before:**
```typescript
const specialties = [
  "Computer Repair",
  "Network Setup",
  // ... hardcoded list
]

const availability = ["Weekdays", "Evenings", ...]

const synonymMap: Record<string, string[]> = {
  // ... hardcoded synonyms
}
```

**After:**
```typescript
import { SPECIALTIES, AVAILABILITY_OPTIONS, SPECIALTY_SYNONYMS } from "@/lib/constants"

// Use imported constants
{SPECIALTIES.map((specialty) => ...)}
{AVAILABILITY_OPTIONS.map((avail) => ...)}
// Use SPECIALTY_SYNONYMS for matching
```

## 📋 Available Constants

### `TECH_SKILLS`
Full skill objects with icons, colors, and categories:
```typescript
[
  { 
    name: "Computer Repair", 
    icon: Laptop, 
    color: "bg-blue-500", 
    category: "Hardware" 
  },
  // ... 11 more skills
]
```

### `SPECIALTIES`
Simple array of specialty names (extracted from TECH_SKILLS):
```typescript
[
  "Computer Repair",
  "Network Setup",
  "Data Recovery",
  "Mobile Repair",
  "Hardware Install",
  "Software Support",
  "Web Development",
  "Digital Marketing",
  "Graphic Design",
  "Business Consulting",
  "Content Writing",
  "Data Analysis"
]
```

### `AVAILABILITY_OPTIONS`
```typescript
[
  "Weekdays",
  "Evenings",
  "Weekends",
  "Remote Support"
]
```

### `EXPERIENCE_LEVELS`
```typescript
[
  {
    level: "0-1 years",
    icon: "👨‍💻",
    title: "Getting Started",
    description: "New to tech support"
  },
  // ... 3 more levels
]
```

### `SPECIALTY_SYNONYMS`
For better search matching:
```typescript
{
  "computer repair": ["pc repair", "laptop repair", "desktop repair"],
  "network setup": ["network installation", "networking", "wifi setup"],
  // ... more synonyms
}
```

### `SPECIALTY_CATEGORIES`
```typescript
[
  "Hardware",
  "Networking",
  "Data",
  "Mobile",
  "Software",
  "Development",
  "Marketing",
  "Design",
  "Consulting",
  "Writing",
  "Analytics"
]
```

## 🎨 Benefits

### 1. **Single Source of Truth**
- Add a new specialty in one place
- It automatically appears in both onboarding and browse pages

### 2. **Consistency**
- Guaranteed same specialties across the app
- Same availability options everywhere
- Consistent experience levels

### 3. **Maintainability**
- Easy to update - change once, applies everywhere
- No duplicate code
- Clear organization

### 4. **Type Safety**
- TypeScript ensures correct usage
- `as const` for literal types
- Autocomplete support

### 5. **Reusability**
- Can be imported in any component
- Used in forms, filters, display, etc.
- Consistent across frontend and backend

## 🚀 How to Use

### In a New Component

```typescript
import { SPECIALTIES, TECH_SKILLS, AVAILABILITY_OPTIONS } from "@/lib/constants"

// Use simple names array
{SPECIALTIES.map(spec => <div>{spec}</div>)}

// Use full objects with icons
{TECH_SKILLS.map(skill => (
  <div>
    <skill.icon className={skill.color} />
    {skill.name}
  </div>
))}

// Use availability
{AVAILABILITY_OPTIONS.map(avail => <Checkbox>{avail}</Checkbox>)}
```

### Adding a New Specialty

Just update `lib/constants.ts`:

```typescript
export const TECH_SKILLS = [
  // ... existing skills
  { 
    name: "Cloud Computing", 
    icon: Cloud, 
    color: "bg-sky-500", 
    category: "Infrastructure" 
  },
]
```

This automatically updates:
- ✅ Onboarding wizard skill selection
- ✅ Browse page specialty filters
- ✅ Any other component using these constants
- ✅ SPECIALTIES array (derived from TECH_SKILLS)

### Adding Synonyms

```typescript
export const SPECIALTY_SYNONYMS: Record<string, string[]> = {
  // ... existing synonyms
  "cloud computing": ["aws", "azure", "gcp", "cloud services"],
}
```

## 📊 Synchronization Status

| Constant | Onboarding Wizard | Browse /proz | Other Pages |
|----------|------------------|--------------|-------------|
| Specialties | ✅ Using TECH_SKILLS | ✅ Using SPECIALTIES | Ready to use |
| Availability | N/A | ✅ Using AVAILABILITY_OPTIONS | Ready to use |
| Experience | ✅ Using EXPERIENCE_LEVELS | N/A | Ready to use |
| Synonyms | N/A | ✅ Using SPECIALTY_SYNONYMS | Ready to use |

## 🔍 Where These Constants Are Used

1. **Onboarding Wizard (`/onboarding-wizard`)**
   - TECH_SKILLS → Skill selection cards with icons
   - EXPERIENCE_LEVELS → Experience level selection

2. **Browse Professionals (`/proz`)**
   - SPECIALTIES → Filter checkboxes
   - AVAILABILITY_OPTIONS → Availability filters
   - SPECIALTY_SYNONYMS → Smart search matching

3. **Future Use Cases**
   - Profile creation/editing
   - Search functionality
   - Admin dashboards
   - Reporting and analytics
   - Public profile displays

## 💡 Best Practices

### Do's ✅
- Import from `@/lib/constants`
- Use TECH_SKILLS when you need icons/colors
- Use SPECIALTIES when you just need names
- Add synonyms for better search
- Use `as const` for type safety

### Don'ts ❌
- Don't hardcode specialty lists
- Don't duplicate constants
- Don't modify imported constants
- Don't create new specialty lists elsewhere

## 🛠️ Maintenance

### To Add a Specialty:
1. Open `lib/constants.ts`
2. Add to `TECH_SKILLS` array
3. Add synonyms to `SPECIALTY_SYNONYMS` if needed
4. That's it! It's now available everywhere

### To Remove a Specialty:
1. Open `lib/constants.ts`
2. Remove from `TECH_SKILLS` array
3. Remove synonyms if they exist
4. Check if any hardcoded references exist (should be none)

### To Update Availability:
1. Open `lib/constants.ts`
2. Update `AVAILABILITY_OPTIONS` array
3. Automatically applies to all filters

## ✨ Summary

**What was accomplished:**

1. ✅ Created `lib/constants.ts` with all shared constants
2. ✅ Updated `/onboarding-wizard` to use TECH_SKILLS and EXPERIENCE_LEVELS
3. ✅ Updated `/proz` to use SPECIALTIES, AVAILABILITY_OPTIONS, and SPECIALTY_SYNONYMS
4. ✅ Removed all duplicate hardcoded lists
5. ✅ Ensured perfect synchronization
6. ✅ Made future updates easy (one place to change)

**Benefits:**

- 🎯 Single source of truth
- 🔄 Always in sync
- 🛠️ Easy maintenance
- 📦 Reusable everywhere
- 🎨 Consistent UX
- ⚡ TypeScript support

---

**Status**: ✅ **COMPLETE**  
**No Linting Errors**: ✅  
**Fully Synchronized**: ✅  
**Ready for Production**: ✅


