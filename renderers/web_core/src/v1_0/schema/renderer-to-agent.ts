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
import {ExtensionsSchema, FunctionCallSchema, FunctionResponseSchema} from './common-types.js';

export const ActionMessageSchema = z
  .object({
    version: z.literal('v1.0'),
    action: z
      .object({
        name: z.string(),
        userMessage: z.string().optional(),
        surfaceId: z.string(),
        sourceComponentId: z.string(),
        timestamp: z.string(),
        context: z.record(z.string(), z.unknown()),
        metadata: z
          .object({
            extensions: ExtensionsSchema.optional(),
          })
          .strict()
          .optional(),
      })
      .strict(),
  })
  .strict();
export type ActionMessage = z.infer<typeof ActionMessageSchema>;

export const CallAgentFunctionMessageSchema = z
  .object({
    version: z.literal('v1.0'),
    callAgentFunction: z
      .object({
        surfaceId: z.string(),
        functionCallId: z.string(),
        callFunction: FunctionCallSchema,
      })
      .strict(),
  })
  .strict();
export type CallAgentFunctionMessage = z.infer<typeof CallAgentFunctionMessageSchema>;

export const RendererFunctionResponseMessageSchema = z
  .object({
    version: z.literal('v1.0'),
    rendererFunctionResponse: FunctionResponseSchema,
  })
  .strict();
export type RendererFunctionResponseMessage = z.infer<typeof RendererFunctionResponseMessageSchema>;

export const ErrorMessageSchema = z
  .object({
    version: z.literal('v1.0'),
    error: z.union([
      z
        .object({
          code: z.enum(['VALIDATION_FAILED', 'UNALLOWED_PARENT', 'UNALLOWED_CHILD']),
          surfaceId: z.string(),
          path: z.string(),
          message: z.string(),
        })
        .strict(),
      z
        .object({
          code: z
            .string()
            .refine(
              val => !['VALIDATION_FAILED', 'UNALLOWED_PARENT', 'UNALLOWED_CHILD'].includes(val),
              {message: 'Special error codes must use the specific error schema.'},
            ),
          message: z.string(),
          surfaceId: z.string().optional(),
          functionCallId: z.string().optional(),
        })
        .passthrough()
        .refine(data => (data.surfaceId !== undefined) !== (data.functionCallId !== undefined), {
          message:
            'Generic error must specify either surfaceId or functionCallId, but not both or neither.',
        }),
    ]),
  })
  .strict();
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;

export const RendererToAgentMessageSchema = z.union([
  ActionMessageSchema,
  CallAgentFunctionMessageSchema,
  RendererFunctionResponseMessageSchema,
  ErrorMessageSchema,
]);
export type RendererToAgentMessage = z.infer<typeof RendererToAgentMessageSchema>;
