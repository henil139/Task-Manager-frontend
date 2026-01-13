import { z } from 'zod';

// Email validation
export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Please enter a valid email address' })
  .max(255, { message: 'Email must be less than 255 characters' });

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .max(128, { message: 'Password must be less than 128 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' });

// Full name validation
export const fullNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Full name is required' })
  .max(100, { message: 'Name must be less than 100 characters' })
  .regex(/^[a-zA-Z\s'-]+$/, { message: 'Name can only contain letters, spaces, hyphens, and apostrophes' });

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
});

// Signup form schema
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
});

// Project form schema
export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Project name is required' })
    .max(100, { message: 'Project name must be less than 100 characters' }),
  description: z
    .string()
    .trim()
    .max(500, { message: 'Description must be less than 500 characters' })
    .optional(),
});

// Task form schema
export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Task title is required' })
    .max(200, { message: 'Title must be less than 200 characters' }),
  description: z
    .string()
    .trim()
    .max(2000, { message: 'Description must be less than 2000 characters' })
    .optional(),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
});

// Comment form schema
export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: 'Comment cannot be empty' })
    .max(1000, { message: 'Comment must be less than 1000 characters' }),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;

// Validation helper function
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
}
