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

import {describe, it} from 'node:test';
import * as assert from 'node:assert';
import {VersionAdapterFactory} from './factory.js';

describe('VersionAdapterFactory', () => {
  it('resolves v1.0 adapter and extracts inline initial state', () => {
    const payload = {
      version: 'v1.0',
      createSurface: {
        surfaceId: 's1',
        catalogId: 'basic',
        components: [{id: 'root', component: 'Column'}],
        dataModel: {
          key: 'value',
        },
      },
    };

    const adapter = VersionAdapterFactory.resolveFromPayload(payload);
    assert.strictEqual(adapter.version, 'v1.0');

    const initialState = adapter.extractInitialState(payload);
    assert.deepStrictEqual(initialState.components, [{id: 'root', component: 'Column'}]);
    assert.deepStrictEqual(initialState.dataModel, {key: 'value'});
  });

  it('resolves v0.9 adapter and handles legacy payloads', () => {
    const payload = {
      version: 'v0.9',
      createSurface: {
        surfaceId: 's1',
        catalogId: 'basic',
        theme: {primaryColor: '#FF0000'},
      },
    };

    const adapter = VersionAdapterFactory.resolveFromPayload(payload);
    assert.strictEqual(adapter.version, 'v0.9');

    const props = adapter.extractSurfaceProperties(payload);
    assert.deepStrictEqual(props.theme, {primaryColor: '#FF0000'});

    const initialState = adapter.extractInitialState(payload);
    assert.strictEqual(initialState.components, undefined);
    assert.strictEqual(adapter.extractMessageType(payload), 'createSurface');
  });

  it('resolves v0.8 adapter and extracts message types', () => {
    const payload = {
      version: 'v0.8',
      beginRendering: {
        surfaceId: 's1',
        theme: {dark: true},
      },
    };

    const adapter = VersionAdapterFactory.resolveFromPayload(payload);
    assert.strictEqual(adapter.version, 'v0.8');

    const props = adapter.extractSurfaceProperties(payload);
    assert.deepStrictEqual(props.theme, {dark: true});

    assert.strictEqual(adapter.extractMessageType(payload), 'beginRendering');
    assert.strictEqual(adapter.extractMessageType({}), undefined);
  });

  it('falls back to v1.0 adapter for unrecognized version', () => {
    const adapter = VersionAdapterFactory.getAdapter('v99.0');
    assert.strictEqual(adapter.version, 'v1.0');
  });
});
