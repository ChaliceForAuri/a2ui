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
import {
  ComponentCommonSchema,
  ExtensionsSchema,
  FunctionCallSchema,
  FunctionResponseSchema,
} from './common-types.js';

export const AnyComponentSchema = ComponentCommonSchema.passthrough().refine(
  comp => (comp as any).component !== 'Surface',
  {message: 'Component type cannot be "Surface".'},
);
export type AnyComponent = z.infer<typeof AnyComponentSchema>;

export const ComponentsListSchema = z.array(AnyComponentSchema).min(1);
export type ComponentsList = z.infer<typeof ComponentsListSchema>;

export const CreateSurfaceMessageSchema = z
  .object({
    version: z.literal('v1.0'),
    createSurface: z
      .object({
        surfaceId: z.string().describe('Unique surface ID.'),
        catalogId: z.string().optional().describe('Surface-level default catalogId.'),
        sendDataModel: z.boolean().optional(),
        components: ComponentsListSchema.optional(),
        dataModel: z.record(z.string(), z.any()).optional(),
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
export type CreateSurfaceMessage = z.infer<typeof CreateSurfaceMessageSchema>;

export const UpdateComponentsMessageSchema = z
  .object({
    version: z.literal('v1.0'),
    updateComponents: z
      .object({
        surfaceId: z.string(),
        components: ComponentsListSchema,
      })
      .strict(),
  })
  .strict();
export type UpdateComponentsMessage = z.infer<typeof UpdateComponentsMessageSchema>;

export const UpdateDataModelMessageSchema = z
  .object({
    version: z.literal('v1.0'),
    updateDataModel: z
      .object({
        surfaceId: z.string(),
        path: z.string().optional(),
        value: z.any(),
      })
      .strict(),
  })
  .strict();
export type UpdateDataModelMessage = z.infer<typeof UpdateDataModelMessageSchema>;

export const DeleteSurfaceMessageSchema = z
  .object({
    version: z.literal('v1.0'),
    deleteSurface: z
      .object({
        surfaceId: z.string(),
      })
      .strict(),
  })
  .strict();
export type DeleteSurfaceMessage = z.infer<typeof DeleteSurfaceMessageSchema>;

export const CallRendererFunctionMessageSchema = z
  .object({
    version: z.literal('v1.0'),
    callRendererFunction: z
      .object({
        functionCallId: z.string(),
        callFunction: FunctionCallSchema.extend({
          catalogId: z.string(),
        }),
      })
      .strict(),
  })
  .strict();
export type CallRendererFunctionMessage = z.infer<typeof CallRendererFunctionMessageSchema>;

export const AgentFunctionResponseMessageSchema = z
  .object({
    version: z.literal('v1.0'),
    agentFunctionResponse: FunctionResponseSchema,
  })
  .strict();
export type AgentFunctionResponseMessage = z.infer<typeof AgentFunctionResponseMessageSchema>;

export const AgentToRendererMessageSchema = z.union([
  CreateSurfaceMessageSchema,
  UpdateComponentsMessageSchema,
  UpdateDataModelMessageSchema,
  DeleteSurfaceMessageSchema,
  CallRendererFunctionMessageSchema,
  AgentFunctionResponseMessageSchema,
]);
export type AgentToRendererMessage = z.infer<typeof AgentToRendererMessageSchema>;
