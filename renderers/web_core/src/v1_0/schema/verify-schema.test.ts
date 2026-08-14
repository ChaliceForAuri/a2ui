/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {describe, it} from 'node:test';
import * as assert from 'node:assert';
import {
  CreateSurfaceMessageSchema,
  UpdateComponentsMessageSchema,
  UpdateDataModelMessageSchema,
  DeleteSurfaceMessageSchema,
  CallRendererFunctionMessageSchema,
  AgentFunctionResponseMessageSchema,
  AgentToRendererMessageSchema,
} from './agent-to-renderer.js';
import {
  ActionMessageSchema,
  CallAgentFunctionMessageSchema,
  RendererFunctionResponseMessageSchema,
  ErrorMessageSchema,
  RendererToAgentMessageSchema,
} from './renderer-to-agent.js';

describe('A2UI Schema Verification v1.0', () => {
  it('validates CreateSurfaceMessage v1.0', () => {
    const valid = {
      version: 'v1.0',
      createSurface: {
        surfaceId: 's1',
        catalogId: 'basic',
        components: [
          {
            id: 'root',
            component: 'Column',
          },
        ],
        dataModel: {
          key: 'value',
        },
      },
    };
    const result = CreateSurfaceMessageSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('validates UpdateComponentsMessage v1.0', () => {
    const valid = {
      version: 'v1.0',
      updateComponents: {
        surfaceId: 's1',
        components: [
          {
            id: 't1',
            component: 'Text',
            text: 'Hello',
          },
        ],
      },
    };
    const result = UpdateComponentsMessageSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('validates UpdateDataModelMessage v1.0 with null value deletion', () => {
    const valid = {
      version: 'v1.0',
      updateDataModel: {
        surfaceId: 's1',
        path: '/user/bio',
        value: null,
      },
    };
    const result = UpdateDataModelMessageSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('validates CallRendererFunctionMessage v1.0', () => {
    const valid = {
      version: 'v1.0',
      callRendererFunction: {
        functionCallId: 'call-1',
        callFunction: {
          call: 'playMedia',
          catalogId: 'basic',
        },
      },
    };
    const result = CallRendererFunctionMessageSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('validates AgentToRendererMessage wrapper v1.0', () => {
    const valid = {
      version: 'v1.0',
      deleteSurface: {
        surfaceId: 's1',
      },
    };
    const result = AgentToRendererMessageSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('validates RendererToAgentMessage wrapper v1.0', () => {
    const valid = {
      version: 'v1.0',
      action: {
        name: 'submit',
        surfaceId: 's1',
        sourceComponentId: 'btn1',
        timestamp: '2026-08-13T16:00:00Z',
        context: {
          inputVal: 'abc',
        },
      },
    };
    const result = RendererToAgentMessageSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('rejects component: Surface in AnyComponentSchema', () => {
    const invalid = {
      id: 's1',
      component: 'Surface',
    };
    const result = AgentToRendererMessageSchema.safeParse({
      version: 'v1.0',
      updateComponents: {
        surfaceId: 's1',
        components: [invalid],
      },
    });
    assert.strictEqual(result.success, false);
  });

  it('rejects CallRendererFunctionMessage missing catalogId', () => {
    const invalid = {
      version: 'v1.0',
      callRendererFunction: {
        functionCallId: 'call-1',
        callFunction: {
          call: 'playMedia',
        },
      },
    };
    const result = CallRendererFunctionMessageSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  it('rejects generic ErrorMessage with both surfaceId and functionCallId', () => {
    const invalid = {
      version: 'v1.0',
      error: {
        code: 'GENERIC_ERROR',
        message: 'Something went wrong',
        surfaceId: 's1',
        functionCallId: 'call-1',
      },
    };
    const result = ErrorMessageSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  it('validates DeleteSurfaceMessage and AgentFunctionResponseMessage v1.0', () => {
    const delMsg = {version: 'v1.0', deleteSurface: {surfaceId: 's1'}};
    assert.strictEqual(DeleteSurfaceMessageSchema.safeParse(delMsg).success, true);

    const agentResp = {
      version: 'v1.0',
      agentFunctionResponse: {
        functionCallId: 'call-1',
        value: {status: 'ok'},
      },
    };
    assert.strictEqual(AgentFunctionResponseMessageSchema.safeParse(agentResp).success, true);
  });

  it('validates ActionMessage, CallAgentFunctionMessage, and RendererFunctionResponseMessage v1.0', () => {
    const actionMsg = {
      version: 'v1.0',
      action: {
        name: 'submit',
        surfaceId: 's1',
        sourceComponentId: 'btn1',
        timestamp: '2026-08-13T00:00:00Z',
        context: {},
      },
    };
    assert.strictEqual(ActionMessageSchema.safeParse(actionMsg).success, true);

    const callAgentMsg = {
      version: 'v1.0',
      callAgentFunction: {
        surfaceId: 's1',
        functionCallId: 'call-1',
        callFunction: {call: 'fetchData'},
      },
    };
    assert.strictEqual(CallAgentFunctionMessageSchema.safeParse(callAgentMsg).success, true);

    const rendererResp = {
      version: 'v1.0',
      rendererFunctionResponse: {
        functionCallId: 'call-1',
        value: {status: 'done'},
      },
    };
    assert.strictEqual(RendererFunctionResponseMessageSchema.safeParse(rendererResp).success, true);
  });
});
