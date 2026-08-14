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

import {VersionAdapter} from './base.js';
import {V0_9VersionAdapter} from './v0_9.js';
import {V1_0VersionAdapter} from './v1_0.js';

export class VersionAdapterFactory {
  private static adapters = new Map<string, VersionAdapter>([
    ['v0.9', new V0_9VersionAdapter()],
    ['v0.9.1', new V0_9VersionAdapter()],
    ['v1.0', new V1_0VersionAdapter()],
  ]);

  static getAdapter(version: string): VersionAdapter {
    const adapter = this.adapters.get(version);
    if (!adapter) {
      console.warn(
        `[VersionAdapterFactory] Unrecognized version '${version}', falling back to v1.0 adapter.`,
      );
      return this.adapters.get('v1.0')!;
    }
    return adapter;
  }

  static resolveFromPayload(payload: any): VersionAdapter {
    const version = payload?.version;
    if (typeof version === 'string') {
      return this.getAdapter(version);
    }
    return this.getAdapter('v1.0');
  }
}
