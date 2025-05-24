# **Product Definition Document (PDD)**

**Product Name:** Daily Wellness AI

---

## **Purpose**

Daily Wellness AI helps users track their daily habits, wellness metrics (like sleep, energy, stress, etc.), and discover patterns through AI-powered insights. The app provides a personalized experience with smart suggestions, customizable activity tracking, and interactive data exploration.

---

## **Core Features**

### **1\. Daily Activity Tracking**

* Track activities such as meals, water intake, exercise, meditation, and sleep.

* Each activity includes:

  * Name

  * Type (e.g., sleep, meal, workout)

  * Description (optional)

  * Start time

  * Type-specific fields (e.g., duration, quality, intensity, calories)

* Only activities defined in the **Activity Configuration Dashboard** can be tracked or suggested by the app.

* Users must manually define each activity type before tracking it.

### **2\. Daily Wellness Metric Tracking**

* Track subjective metrics like energy level, mood, stress, fatigue, and pain.

* Each metric can be logged with a timestamp and optional note.

* The app includes a set of **pre-defined wellness metrics** (e.g., Energy, Mood, Stress).

### **3\. Activity Configuration Dashboard**

* Manage custom activity types and their fields.

* Add/edit/delete field definitions per type (e.g., sleep: quality, duration; workout: duration, type, effort).

* When defining a new activity type, users specify the fields to track (e.g., "Sleep" with "Duration" and "Quality").

* Each field must include a **field type**, such as Boolean, Number, Time, Date, Text, etc.

* The app will include a selection of **pre-defined activities** such as Sleep, Meals, etc., which users can enable or customize.  
* Configuration Dashboard BehaviorUsers will see a list of pre-defined metrics and activities in the dashboard.  
* Each item will have a checkbox to enable or disable tracking.  
* Enabling one of these will activate it for tracking and suggestions.  
* Users can also add custom activities or metrics, which they configure with:  
  * Name  
  * Type ("Activity" or "Metric")  
  * Field list (e.g., Duration, Quality, Value, etc.)  
  * Field types (number, boolean, text, time, etc.)  
* This gives full flexibility while keeping the experience beginner-friendly by offering a curated list to start from.  
* 

### **4\. Activity Presets**

* Create presets for activities with pre-filled field values for quick tracking.

* **Preset Management in Configuration Dashboard:**
  * Add new presets for any configured activity type
  * Define custom preset names (e.g., "Good Night Sleep", "Morning Coffee")
  * Set default values for all activity fields
  * Edit or delete existing presets

* **Quick Tracking from Home Screen:**
  * View presets as dedicated cards/buttons
  * One-tap tracking using preset values
  * "Edit & Track" option to modify field values before saving
  * Show preset usage for popular presets

* **Example Use Cases:**
  * Sleep preset: "22:30 bedtime, 8 hours, good quality"
  * Meal preset: "Breakfast, 400 calories, at home"
  * Workout preset: "30min cardio, medium intensity"

### **5\. Activity Log Page**

* View, edit, delete, or duplicate past tracked activities and metrics.

* Filter and sort entries by time, type, tags, or keyword.

### **6\. AI-Powered Home Page**

* Displays:

  * **Quick action cards:**

    * **Track Activity** – with suggested activity types based on time of day, habits, and patterns

    * **Add Metric** – with suggested wellness metrics based on previous entries and trends

  * **Activity Presets** – quick access to user-defined presets for one-tap tracking

  * Intelligent reminders (e.g., "You usually log lunch around now. Want to log it?")

  * Smart logging shortcuts (e.g., "Log same breakfast as yesterday")

  * Quick entry for today's metrics (energy, mood, etc.)

  * Suggested activities based on time of day and user patterns

### **7\. AI Chat Interface**

* Conversational interface to explore personal data.

* Example prompts:

  * "How does my sleep affect next-day energy?"

  * "Have I been more stressed this week than last?"

* Data summaries generated using AI with access to user's tracking history.

### **8\. Correlations & Insights Page**

* Dedicated area for viewing AI-discovered patterns and trends.

* Example insights:

  * "Meditation reduces stress by 30% on average."

  * "Poor sleep is linked to low mood 3 days a week."

* Simple visualizations (bar/line charts, heatmaps).

* Option to explore specific time ranges or activity types.

---

## **Future Enhancements & Known Issues**

### **Activity Presets - Potential Issues & Solutions**

**Field Validation Conflicts:**
* Issue: ActivityType fields change after preset creation
* Solution: Validate presets against current schema, show warnings for mismatches

**Data Consistency:**
* Issue: ActivityType deleted but presets reference it  
* Solution: Cascade delete or mark presets as inactive

**UI Complexity:**
* Issue: Too many presets cluttering Home screen
* Solution: Show top 6 most-used presets, "Show All" option

**Performance:**
* Issue: Loading all presets on Home screen
* Solution: Lazy load, cache frequently used presets

**User Experience:**
* Issue: Preset naming complexity
* Solution: Auto-generate names from key field values, allow custom names

### **Planned Future Features**

**Smart Preset Features:**
* Auto-generate preset names from key fields: "Sleep: 22:30, 8hrs, Good"
* Usage analytics and favorites
* Time-based preset suggestions
* Preset templates/sharing

---

## **Design Principles**

* Personalization through data

* Frictionless logging

* Explainable AI insights

* Clean, minimal UI with strong data visualization support

* Fun and modern feel with bright colors and an easy-to-use interface

* Mobile-first responsive design to ensure optimal experience across all devices  
