# Feature Planning: AI-Powered Food Data Generation

## 1. **High-Level Solution**

The feature will integrate AI-powered food data generation directly into the existing `CustomFoodDialog.tsx` component. Users will see a compact "Generate with AI" button that expands into an inline AI generation interface within the same dialog. Users can enter a food description, select an AI model, and generate comprehensive nutrition data that populates the form fields. The interface will display the generation cost after completion and provide options to clear fields and regenerate data. A progress bar will indicate loading states while disabling form inputs during generation. The selected AI model will persist across dialog reopenings for better user experience.

**User Flow**: User clicks "Generate with AI" button → inline interface expands → user enters food description and selects model → clicks Generate → progress bar shows → AI data populates form → cost displayed after generation → user can clear and regenerate or edit fields → saves custom food.

## 2. **Implementation Details**

### **Phase 1: Create AI Food Generation API**

**Target Files:**
- `src/apis/foods/index.ts`
- `src/apis/foods/types.ts` 
- `src/apis/foods/server.ts`
- `src/apis/foods/client.ts`
- `src/apis/foods/handlers/generateFoodDataHandler.ts` (new)
- `src/common/utils/foodUtils.ts` (new)

**Changes Required:**

1. **Create shared food utilities** in `src/common/utils/foodUtils.ts`:
   - Define `REQUIRED_NUTRITION_FIELDS` and `ALL_NUTRITION_FIELDS` constants
   - Create `VALID_FOOD_CATEGORIES` array and `FOOD_CATEGORY_LABELS` mapping
   - Export `DEFAULT_NUTRITION` object with zero values for all nutrition fields
   - Implement `validateAIFoodResponse()` function to validate AI response schema
   - Create `generateFoodDataPrompt()` function that dynamically builds the AI prompt using shared constants

2. **Add new API endpoint** in `src/apis/foods/index.ts`:
   - Export `API_GENERATE_FOOD_DATA = 'foods/generate-ai-data'` constant

3. **Add request/response types** in `src/apis/foods/types.ts`:
   - Create `GenerateFoodDataRequest` interface with foodDescription, optional additionalContext, and optional modelId
   - Create `GenerateFoodDataResponse` interface with suggestedFood object, aiCost, modelUsed, and optional error

4. **Register server handler** in `src/apis/foods/server.ts`:
   - Import and add generateFoodDataProcess to foodsApiHandlers object

5. **Add client function** in `src/apis/foods/client.ts`:
   - Export `generateFoodData()` function that calls apiClient with the new endpoint

6. **Create AI handler** in `src/apis/foods/handlers/generateFoodDataHandler.ts`:
   - Import AIModelAdapter, getModelById, and shared food utilities
   - Validate user authentication and model ID
   - Initialize AIModelAdapter with provided or default model
   - Generate prompt using shared `generateFoodDataPrompt()` utility
   - Call `adapter.processPromptToJSON()` for structured response
   - Validate response using shared `validateAIFoodResponse()` function
   - Return response with suggestedFood data, cost, and model used
   - Handle errors gracefully with descriptive error messages

### **Phase 2: Enhance CustomFoodDialog with Integrated AI Generation**

**Target Files:**
- `src/client/components/FoodSelectionDialog/CustomFoodDialog.tsx`

**Changes Required:**

1. **Add imports and state management**:
   - Import LinearProgress, Chip, AutoAwesome from Material-UI
   - Import generateFoodData client function and getAllModels utility
   - Import shared food utilities (DEFAULT_NUTRITION, VALID_FOOD_CATEGORIES, FOOD_CATEGORY_LABELS)
   - Add state variables: showAISection, isGenerating, aiDescription, aiContext, selectedModel (with localStorage persistence), lastGenerationCost, hasGeneratedData

2. **Update form initialization**:
   - Initialize formData.nutritionPer100g with spread of DEFAULT_NUTRITION
   - Load selectedModel from localStorage with 'gpt-4o-mini' fallback

3. **Implement AI generation functions**:
   - `handleAIGenerate()`: Call generateFoodData API, populate form fields, save model preference to localStorage, handle errors
   - `handleClearAndRegenerate()`: Reset form data using DEFAULT_NUTRITION, keep AI section open
   - `handleCloseAI()`: Close AI section and reset AI-related state

4. **Add AI generation UI section**:
   - Conditional rendering: show "Generate with AI" button or expanded AI interface
   - AI interface includes: food description input, model selector dropdown, optional context input, generate/regenerate buttons, cost display chip, loading progress bar
   - Implement proper loading states with LinearProgress and field disabling during generation
   - Show success message after generation with option to edit fields

5. **Update form fields and handlers**:
   - Add `disabled={isGenerating}` prop to all form inputs
   - Update category dropdown to use VALID_FOOD_CATEGORIES and FOOD_CATEGORY_LABELS
   - Modify handleClose to reset all state including AI-related variables using DEFAULT_NUTRITION

6. **Add loading overlay**:
   - Position absolute overlay during generation with CircularProgress
   - Prevent user interaction with form during AI processing

## 3. **Implementation Phases**

### **Phase 1: Core API Infrastructure (2-3 hours)**
- Create shared food utilities with constants and validation functions
- Implement AI food generation API endpoint with model selection support
- Add proper model validation and cost tracking
- Test API endpoint with different models

### **Phase 2: UI Integration (3-4 hours)**
- Enhance CustomFoodDialog with integrated AI generation interface
- Implement model selection dropdown and cost display
- Add clear/regenerate functionality with proper state management
- Implement loading states with progress bar and field disabling

### **Phase 3: Testing & Polish (1-2 hours)**
- Test complete user flow with different models
- Verify cost calculation and display formatting
- Ensure proper loading states and error handling
- Validate TypeScript compliance

## 4. **Implementation Decisions & Technical Notes**

### **Resolved Design Decisions:**
- **Model Persistence**: Selected AI model persists across dialog reopenings using localStorage key `preferredAIModel`
- **Cost Display**: Cost shown only after generation in small chip, rounded to 2 decimal places using `toFixed(2)`
- **Cost Warnings**: No maximum cost warning thresholds implemented
- **Token Limits**: Long food descriptions that might exceed token limits will not be handled in this implementation

### **Technical Challenges:**
- **Model Import**: Ensure `getAllModels()` can be imported client-side (may need to move to shared location)
- **Error States**: Handle both API errors and AI model errors gracefully
- **State Management**: Properly manage AI generation state alongside existing form state

### **Implementation Notes:**
- Use localStorage to persist model selection with key `preferredAIModel`
- Cost display uses `toFixed(2)` for consistent 2-decimal formatting
- AI section expands inline without additional dialogs for streamlined UX
- All form fields disabled during generation to prevent conflicts
- **Shared Food Utilities**: All food-related constants and utilities are centralized in `src/common/utils/foodUtils.ts` for consistency across the application
- Prefer simplicity over complexity

### **Benefits of Shared Food Utilities:**
- **Consistency**: All components use the same food categories, nutrition fields, and validation logic
- **Maintainability**: Changes to food data structure only need to be made in one place
- **Reusability**: Other components like `FoodSelectionDialog.tsx`, food management pages, and nutrition tracking can use the same utilities
- **Type Safety**: Shared constants ensure TypeScript compliance across all food-related code

### **Usage in Other Components:**
Other components can import shared utilities for form initialization, category filtering, nutrition field rendering, and data validation. This ensures consistency when food data types are modified in the future.

This revised plan addresses all feedback points and provides clear implementation guidance with resolved design decisions for a smooth development process.

## 5. **Implementation Task List**

update the completion of the tasks as you finish implement each task.


### **Phase 1: Core API Infrastructure**
- [x] Create shared food utilities (`src/common/utils/foodUtils.ts`)
- [x] Add AI food generation API endpoint to foods API
- [x] Implement AI handler (`src/apis/foods/handlers/generateFoodDataHandler.ts`)
- [x] Test API endpoint functionality

### **Phase 2: UI Integration**
- [x] Add AI generation UI to `CustomFoodDialog.tsx`
- [x] Implement state management and localStorage persistence
- [x] Add AI generation functions (generate, clear, close)
- [x] Implement loading states and form field disabling

### **Completion Criteria**
- [x] All tasks above are completed
- [x] `yarn checks` passes with 0 errors
- [ ] Feature works end-to-end in development environment
