import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

/**
 * Type definition for a form field.
 *
 * Represents the structure of a single form field, including its value
 * and validation status.
 */
type FieldType = {
  value: string;
  valid: boolean;
};

/**
 * Initial state for the form fields reducer.
 *
 * Defines the default values for the form fields state when the application starts
 * or when the state is reset. Initially contains an empty fields object.
 */
const initialState: {
  fields: {
    [key: string]: FieldType;
  };
} = {
  fields: {},
};

/**
 * Get the first key from an object.
 *
 * Helper function to extract the first key from a fields object.
 * This is used when adding new fields to the state.
 * @param   {Record<string, FieldType>} obj - Object containing form fields.
 * @returns {string | undefined}            The first key in the object, or undefined if the object is empty.
 */
function getFirstKey(obj: Record<string, FieldType>): string | undefined {
  const keys = Object.keys(obj);
  return keys.length > 0 ? keys[0] : undefined;
}

/**
 * Redux slice for managing form field state.
 *
 * This slice handles the state of form fields including their values and validation status.
 * Fields are stored in an object indexed by their markers for easy access and updates.
 * @name formFieldsSlice
 * @example
 * ```typescript
 * import { formFieldsSlice } from './FormFieldsSlice';
 *
 * // In store configuration
 * const store = configureStore({
 *   reducer: {
 *     formFields: formFieldsSlice.reducer
 *   }
 * });
 * ```
 */
const formFieldsSlice = createSlice({
  name: 'form-fields',
  initialState,
  reducers: {
    /**
     * Add a field to the form fields state.
     *
     * This reducer adds a new field to the form fields state or updates
     * an existing field if one with the same key already exists.
     * @param {typeof initialState}   state  - Current state of the slice
     * @param {PayloadAction<object>} action - Payload action containing the field to add with the following structure:
     */
    addField(
      state: typeof initialState,
      action: PayloadAction<{ [key: string]: FieldType }>,
    ) {
      const key = getFirstKey(action.payload);
      if (key && action.payload[key]) {
        state.fields[key] = action.payload[key];
      }
    },
  },
});

export const { addField } = formFieldsSlice.actions;

export default formFieldsSlice.reducer;
