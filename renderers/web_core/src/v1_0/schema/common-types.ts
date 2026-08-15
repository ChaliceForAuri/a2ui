/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {z} from 'zod';

export const ComponentIdSchema = z.string().describe('Unique identifier for a component.');
export type ComponentId = z.infer<typeof ComponentIdSchema>;

export const CallIdSchema = z.string().describe('Unique identifier for a function call.');
export type CallId = z.infer<typeof CallIdSchema>;

export const ExtensionsSchema = z
  .record(z.string(), z.any())
  .describe('Optional extension metadata.');
export type Extensions = z.infer<typeof ExtensionsSchema>;

export const DataBindingSchema = z
  .object({
    path: z.string().describe('A JSON Pointer path to a value in the data model.'),
  })
  .strict();
export type DataBinding = z.infer<typeof DataBindingSchema>;

export const FunctionCallSchema = z.object({
  call: z.string().describe('The name of the function to call.'),
  catalogId: z.string().optional().describe('Catalog ID overriding surface default.'),
  args: z.record(z.string(), z.any()).optional().describe('Arguments passed to the function.'),
  returnType: z.enum(['string', 'number', 'boolean', 'array', 'object', 'any', 'void']).optional(),
});
export type FunctionCall = z.infer<typeof FunctionCallSchema>;

export const DynamicValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.any()),
  DataBindingSchema,
  FunctionCallSchema,
  z.record(z.string(), z.any()),
]);
export type DynamicValue = z.infer<typeof DynamicValueSchema>;

export const DynamicStringSchema = z.union([z.string(), DataBindingSchema, FunctionCallSchema]);
export type DynamicString = z.infer<typeof DynamicStringSchema>;

export const DynamicNumberSchema = z.union([z.number(), DataBindingSchema, FunctionCallSchema]);
export type DynamicNumber = z.infer<typeof DynamicNumberSchema>;

export const DynamicBooleanSchema = z.union([z.boolean(), DataBindingSchema, FunctionCallSchema]);
export type DynamicBoolean = z.infer<typeof DynamicBooleanSchema>;

export const DynamicStringListSchema = z.union([
  z.array(z.string()),
  DataBindingSchema,
  FunctionCallSchema,
]);
export type DynamicStringList = z.infer<typeof DynamicStringListSchema>;

export const AccessibilityAttributesSchema = z
  .object({
    label: DynamicStringSchema.optional(),
    description: DynamicStringSchema.optional(),
    live: z.enum(['off', 'polite', 'assertive']).default('off'),
    hidden: DynamicBooleanSchema.optional(),
  })
  .strict();
export type AccessibilityAttributes = z.infer<typeof AccessibilityAttributesSchema>;

export const ComponentCommonSchema = z.object({
  id: ComponentIdSchema,
  catalogId: z.string().optional(),
  accessibility: AccessibilityAttributesSchema.optional(),
  metadata: z
    .object({
      extensions: ExtensionsSchema.optional(),
    })
    .strict()
    .optional(),
});
export type ComponentCommon = z.infer<typeof ComponentCommonSchema>;

export const TemplateChildListSchema = z
  .object({
    componentId: ComponentIdSchema,
    path: z.string().describe('The path to the list of component property objects in data model.'),
  })
  .strict();
export type TemplateChildList = z.infer<typeof TemplateChildListSchema>;

export const ChildListSchema = z.union([z.array(ComponentIdSchema), TemplateChildListSchema]);
export type ChildList = z.infer<typeof ChildListSchema>;

export const CheckRuleSchema = z
  .object({
    condition: z.union([DataBindingSchema, FunctionCallSchema]),
    message: z.string().optional(),
  })
  .strict();
export type CheckRule = z.infer<typeof CheckRuleSchema>;

export const CheckableSchema = z.object({
  checks: z.array(CheckRuleSchema).optional(),
});
export type Checkable = z.infer<typeof CheckableSchema>;

export const ActionEventSchema = z
  .object({
    name: z.string(),
    userMessage: DynamicStringSchema.optional(),
    context: z.record(z.string(), DynamicValueSchema).optional(),
  })
  .strict();
export type ActionEvent = z.infer<typeof ActionEventSchema>;

export const ActionSchema = z.union([
  z.object({event: ActionEventSchema}).strict(),
  z.object({functionCall: FunctionCallSchema}).strict(),
]);
export type Action = z.infer<typeof ActionSchema>;

export const ValidationResultSchema = z
  .object({
    valid: z.boolean(),
    code: z.string().optional(),
    message: z.string().optional(),
    severity: z.enum(['error', 'warning', 'info']).optional(),
  })
  .strict();
export type ValidationResult = z.infer<typeof ValidationResultSchema>;

export const FunctionResponseSchema = z
  .object({
    functionCallId: CallIdSchema,
    value: z.any().optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine(data => (data.value !== undefined) !== (data.error !== undefined), {
    message: 'FunctionResponse must contain either value or error, but not both or neither.',
  });
export type FunctionResponse = z.infer<typeof FunctionResponseSchema>;
