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

import {InitialState, SurfaceProperties, VersionAdapter} from './base.js';

export class V1_0VersionAdapter implements VersionAdapter {
  readonly version = 'v1.0';

  extractSurfaceProperties(payload: unknown): SurfaceProperties {
    const p = payload as Record<string, Record<string, unknown>> | undefined;
    const cs = p?.createSurface || {};
    return {
      theme: cs.theme,
      sendDataModel: Boolean(cs.sendDataModel),
    };
  }

  extractInitialState(payload: unknown): InitialState {
    const p = payload as Record<string, Record<string, unknown>> | undefined;
    const cs = p?.createSurface || {};
    return {
      components: Array.isArray(cs.components) ? cs.components : undefined,
      dataModel:
        cs.dataModel && typeof cs.dataModel === 'object'
          ? (cs.dataModel as Record<string, unknown>)
          : undefined,
    };
  }

  extractMessageType(payload: unknown): string | undefined {
    if (!payload || typeof payload !== 'object') return undefined;
    const known = [
      'createSurface',
      'updateComponents',
      'updateDataModel',
      'deleteSurface',
      'callRendererFunction',
      'agentFunctionResponse',
    ];
    return known.find(k => Object.prototype.hasOwnProperty.call(payload, k));
  }
}
