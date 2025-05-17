# Database Schema: Daily Wellness AI

---

## Users
- **_id**: ObjectId (Primary Key)
- **email**: String (unique)
- **passwordHash**: String
- **name**: String
- **createdAt**: Date
- **settings**: Object

---

## ActivityTypes
- **_id**: ObjectId (Primary Key)
- **userId**: ObjectId (ref: Users)
- **name**: String
- **type**: String (e.g., sleep, meal, workout)
- **description**: String (optional)
- **fields**: [
    - **name**: String
    - **fieldType**: String (Boolean, Number, Time, Date, Text, etc.)
  ]

---

## Activities
- **_id**: ObjectId (Primary Key)
- **userId**: ObjectId (ref: Users)
- **activityTypeId**: ObjectId (ref: ActivityTypes)
- **startTime**: Date
- **fields**: Object (key-value pairs for type-specific fields)
- **createdAt**: Date

---

## WellnessMetrics
- **_id**: ObjectId (Primary Key)
- **userId**: ObjectId (ref: Users)
- **name**: String (e.g., Energy, Mood, Stress)
- **isPredefined**: Boolean
- **enabled**: Boolean

---

## MetricEntries
- **_id**: ObjectId (Primary Key)
- **userId**: ObjectId (ref: Users)
- **metricId**: ObjectId (ref: WellnessMetrics)
- **value**: Number or String
- **note**: String (optional)
- **timestamp**: Date

---

## AIInsights
- **_id**: ObjectId (Primary Key)
- **userId**: ObjectId (ref: Users)
- **title**: String
- **description**: String
- **insightType**: String (correlation, trend, summary, etc.)
- **data**: Object (chart data, stats, etc.)
- **createdAt**: Date

---

## Reminders
- **_id**: ObjectId (Primary Key)
- **userId**: ObjectId (ref: Users)
- **type**: String (activity, metric, general)
- **message**: String
- **scheduledFor**: Date
- **createdAt**: Date

---

## ChatHistory
- **_id**: ObjectId (Primary Key)
- **userId**: ObjectId (ref: Users)
- **messages**: [
    - **role**: String (user, ai)
    - **content**: String
    - **timestamp**: Date
  ]
- **createdAt**: Date 