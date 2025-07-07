// Import necessary types and components from react-hook-form
import { Controller, Control, FieldValues, Path } from "react-hook-form";

// Import custom UI form components
import {
    FormItem,       // Wrapper for the form field
    FormLabel,      // Label for the input field
    FormControl,    // Wrapper for the input itself
    FormMessage     // Displays error messages from validation
} from "@/components/ui/form";

import { Input } from "@/components/ui/input"; // Custom Input component

// Define props for the FormField component using generics (T extends FieldValues)
interface FormFieldProps<T extends FieldValues> {
    control: Control<T>; // Control object from react-hook-form (used to connect form fields)
    name: Path<T>;       // Field name (type-safe path for the field in form data)
    label: string;       // Label text to show above the input
    placeholder?: string; // Optional placeholder text
    type?: "text" | "email" | "password"; // Optional input type (defaults to "text")
}

// Define the generic functional component
const FormField = <T extends FieldValues>({
                                              control,         // Passed-in control object
                                              name,            // Name of the form field
                                              label,           // Label to show
                                              placeholder,     // Optional placeholder
                                              type = "text",   // Default type is "text" if not provided
                                          }: FormFieldProps<T>) => {
    return (
        // Use Controller to connect this input to react-hook-form
        <Controller
            control={control} // Pass the control object
            name={name}       // Field name
            render={({ field }) => ( // Destructure field from render function
                <FormItem>
                    {/* Label for the field */}
                    <FormLabel className="label">{label}</FormLabel>

                    {/* Input wrapper */}
                    <FormControl>
                        <Input
                            className="input"
                            type={type}
                            placeholder={placeholder}
                            {...field} // Spread field props to connect with form state
                        />
                    </FormControl>

                    {/* Error message (if any validation error exists) */}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default FormField;