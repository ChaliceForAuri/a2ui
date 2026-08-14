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

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import React from 'react';
import {
  BasicCatalog,
  NativeBasicCatalog,
  UniversalBasicCatalog,
  basicCatalog,
  A2uiSurface,
  A2UIProvider,
  useA2UI,
  toWebComponent,
  createComponentImplementation,
} from '../../src/v0_9';
import {ComponentModel, SurfaceModel, CommonSchemas} from '@a2ui/web_core/v0_9';
import {z} from 'zod';

describe('React Universal Components & Multi-Catalog Architecture', () => {
  it('basicCatalog defaults to native React components for backwards compatibility', () => {
    expect(basicCatalog).toBeInstanceOf(BasicCatalog);
    const textComp = basicCatalog.components.get('Text');
    expect(textComp).toBeDefined();
    expect('render' in textComp!).toBe(true);
    expect('tagName' in textComp!).toBe(false);
  });

  it('NativeBasicCatalog provides native React implementations', () => {
    const catalog = new NativeBasicCatalog();
    const buttonComp = catalog.components.get('Button');
    expect(buttonComp).toBeDefined();
    expect('render' in buttonComp!).toBe(true);
    expect('tagName' in buttonComp!).toBe(false);
  });

  it('UniversalBasicCatalog provides W3C Web Component implementations', () => {
    const catalog = new UniversalBasicCatalog();
    const buttonComp = catalog.components.get('Button');
    expect(buttonComp).toBeDefined();
    expect('tagName' in buttonComp!).toBe(true);
    expect((buttonComp as any).tagName).toBe('a2ui-basic-button');
  });

  it('BasicCatalog dynamically selects UniversalBasicCatalog when useUniversalComponents is true', () => {
    const catalog = new BasicCatalog({useUniversalComponents: true});
    const textComp = catalog.components.get('Text');
    expect(textComp).toBeDefined();
    expect('tagName' in textComp!).toBe(true);
    expect((textComp as any).tagName).toBe('a2ui-basic-text');
  });

  it('BasicCatalog dynamically selects NativeBasicCatalog when useUniversalComponents is false', () => {
    const catalog = new BasicCatalog({useUniversalComponents: false});
    const textComp = catalog.components.get('Text');
    expect(textComp).toBeDefined();
    expect('render' in textComp!).toBe(true);
    expect('tagName' in textComp!).toBe(false);
  });

  it('toWebComponent converts a React component into a Custom Element', () => {
    const CustomApi = {
      name: 'CustomBadge',
      schema: z.object({
        label: CommonSchemas.DynamicString,
      }),
    };

    const CustomBadge = createComponentImplementation(CustomApi, ({props}) => (
      <span data-testid="badge">{props.label}</span>
    ));

    const wcImpl = toWebComponent(CustomBadge);
    expect(wcImpl.name).toBe('CustomBadge');
    expect(wcImpl.tagName).toBe('a2ui-react-custombadge');
    expect(customElements.get('a2ui-react-custombadge')).toBeDefined();
  });

  it('A2UIProvider provides universal component configuration via useA2UI hook', () => {
    const TestConsumer = () => {
      const config = useA2UI();
      return <div data-testid="config-value">{String(config.useUniversalComponents)}</div>;
    };

    const {rerender} = render(
      <A2UIProvider>
        <TestConsumer />
      </A2UIProvider>,
    );
    expect(screen.getByTestId('config-value').textContent).toBe('false');

    rerender(
      <A2UIProvider useUniversalComponents={true}>
        <TestConsumer />
      </A2UIProvider>,
    );
    expect(screen.getByTestId('config-value').textContent).toBe('true');
  });

  it('A2uiSurface renders native React components', () => {
    const catalog = new NativeBasicCatalog();
    const surface = new SurfaceModel('surface-native', catalog);
    surface.componentsModel.addComponent(
      new ComponentModel('root', 'Text', {text: 'Native React A2UI'}),
    );

    render(<A2uiSurface surface={surface} />);
    expect(screen.getByText('Native React A2UI')).toBeDefined();
  });

  it('A2uiSurface renders universal Web Components with proper context binding', () => {
    const catalog = new UniversalBasicCatalog();
    const surface = new SurfaceModel('surface-universal', catalog);
    surface.componentsModel.addComponent(
      new ComponentModel('root', 'Text', {text: 'Universal Web Component A2UI'}),
    );

    const {container} = render(<A2uiSurface surface={surface} />);
    const customEl = container.querySelector('a2ui-basic-text');
    expect(customEl).not.toBeNull();
  });
});
