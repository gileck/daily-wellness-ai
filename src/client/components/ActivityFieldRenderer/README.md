# ActivityFieldRenderer - Shared Activity Field Components

This module provides shared components and hooks for rendering activity type fields consistently across the application.

## Problem Solved

Previously, `TrackActivityDialog.tsx` and `AddActivityPresetDialog.tsx` had duplicated field rendering logic, leading to:
- Maintenance burden (changes needed in multiple places)
- Inconsistent behavior between dialogs
- Data format mismatches causing bugs
- Code duplication

## Components

### `ActivityFieldRenderer`

A shared component that renders individual activity type fields with consistent styling and behavior.

**Props:**
- `field: ActivityTypeField` - The field definition from the activity type
- `value: ActivityFieldValue` - Current field value (automatically detects format for Foods fields)
- `onChange: (fieldName: string, value: ActivityFieldValue) => void` - Change handler
- `onFoodSelection?: (fieldName: string) => void` - Food selection handler for Foods fields
- `foodsCache?: Map<string, unknown>` - Cache of food data for display
- `error?: boolean` - Whether the field has an error
- `activityColor?: string` - Theme color for the activity

### `useActivityFieldState`

A custom hook for managing activity field state with automatic data format conversion.

**Options:**
- `activityType: ActivityTypeClient | null` - The activity type
- `initialValues?: Record<string, unknown>` - Initial field values

**Returns:**
- `fieldState: ActivityFieldState` - Current field values
- `updateField: (fieldName: string, value: ActivityFieldValue) => void` - Update a field
- `resetFields: (newInitialValues?: Record<string, unknown>) => void` - Reset all fields
- `validateFields: () => { isValid: boolean; errors: string[] }` - Validate fields
- `getFieldValuesForSubmission: () => TrackedActivityValue[]` - Get API-ready values

## Usage Examples

### Basic Field Rendering

```tsx
import { ActivityFieldRenderer } from '@/client/components/ActivityFieldRenderer';

// In your component
<ActivityFieldRenderer
    field={field}
    value={fieldState[field.name]}
    onChange={handleFieldChange}
    onFoodSelection={handleFoodSelection}
    foodsCache={foodsCache}
    activityColor={activityType.color}
/>
```

### Using the Hook

```tsx
import { useActivityFieldState } from '@/client/components/ActivityFieldRenderer';

const MyComponent = ({ activityType, initialValues }) => {
    const {
        fieldState,
        updateField,
        resetFields,
        validateFields,
        getFieldValuesForSubmission
    } = useActivityFieldState({
        activityType,
        initialValues
    });

    const handleSubmit = () => {
        const validation = validateFields();
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        const values = getFieldValuesForSubmission();
        // Submit values...
    };

    return (
        <Grid container spacing={2}>
            {activityType?.fields.map(field => (
                <Grid size={12} key={field.name}>
                    <ActivityFieldRenderer
                        field={field}
                        value={fieldState[field.name]}
                        onChange={updateField}
                        onFoodSelection={handleFoodSelection}
                        foodsCache={foodsCache}
                        activityColor={activityType.color}
                    />
                </Grid>
            ))}
        </Grid>
    );
};
```

## Data Format Handling

The components automatically handle different data formats for Foods fields and display them consistently:

### `FoodPortion[]` Format
- Used by `TrackActivityDialog`
- Stores detailed portion information with amount, serving type, and gram equivalents
- Displays actual portion data

### `string[]` Format
- Used by `AddActivityPresetDialog`
- Stores just food IDs for simplicity
- Automatically converts to `FoodPortion[]` format for display with default values (1g each)

**Auto-Detection**: The component automatically detects the data format and renders both formats identically with the detailed list view, ensuring consistent UX across all dialogs.

## Migration Guide

### Before (Duplicated Code)
```tsx
// In AddActivityPresetDialog.tsx
const renderFieldInput = (field: ActivityTypeField) => {
    // 100+ lines of duplicated field rendering logic
};

// In TrackActivityDialog.tsx
const renderField = (field: ActivityTypeField) => {
    // 100+ lines of duplicated field rendering logic
};
```

### After (Shared Components)
```tsx
// In both components
import { ActivityFieldRenderer } from '@/client/components/ActivityFieldRenderer';

<ActivityFieldRenderer
    field={field}
    value={value}
    onChange={onChange}
    // ... other props
/>
```

## Benefits

1. **Single Source of Truth**: Field rendering logic is centralized
2. **Consistent UX**: Same behavior across all dialogs
3. **Automatic Data Conversion**: Handles format differences transparently
4. **Type Safety**: Full TypeScript support
5. **Easy Maintenance**: Changes in one place affect all usages
6. **Bug Prevention**: Eliminates sync issues between components

## Future Improvements

- Add field validation rules to the shared component
- Support for custom field renderers
- Built-in error handling and display
- Automated testing for field rendering consistency 