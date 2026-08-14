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

import {
  Catalog,
  type FunctionImplementation,
  type WebComponentImplementation,
} from '@a2ui/web_core/v0_9';
import {
  basicCatalog as webCoreBasicCatalog,
  BASIC_FUNCTIONS,
  createBasicCatalogFunctions,
} from '@a2ui/web_core/v0_9/basic_catalog';
import type {ReactComponentImplementation, ReactCatalogComponent} from '../../adapter';
import {toWebComponent} from '../to_web_component';

import {Text} from './components/Text';
import {Image} from './components/Image';
import {Icon} from './components/Icon';
import {Video} from './components/Video';
import {AudioPlayer} from './components/AudioPlayer';
import {Row} from './components/Row';
import {Column} from './components/Column';
import {List} from './components/List';
import {Card} from './components/Card';
import {Tabs} from './components/Tabs';
import {Divider} from './components/Divider';
import {Modal} from './components/Modal';
import {Button} from './components/Button';
import {TextField} from './components/TextField';
import {CheckBox} from './components/CheckBox';
import {ChoicePicker} from './components/ChoicePicker';
import {Slider} from './components/Slider';
import {DateTimeInput} from './components/DateTimeInput';

export * from './context/MarkdownContext';

/**
 * The set of default native React implementations for each component in the basic catalog.
 */
export const DEFAULT_NATIVE_COMPONENT_IMPLEMENTATIONS: Record<
  string,
  ReactComponentImplementation
> = {
  Text,
  Image,
  Icon,
  Video,
  AudioPlayer,
  Row,
  Column,
  List,
  Card,
  Tabs,
  Divider,
  Modal,
  Button,
  TextField,
  CheckBox,
  ChoicePicker,
  Slider,
  DateTimeInput,
} as const;

/**
 * The set of native React UI components provided by the basic catalog.
 */
export const BASIC_NATIVE_COMPONENTS: ReactComponentImplementation[] = Object.values(
  DEFAULT_NATIVE_COMPONENT_IMPLEMENTATIONS,
);

/**
 * The set of universal W3C web components provided by the basic catalog.
 */
export const BASIC_UNIVERSAL_COMPONENTS: WebComponentImplementation[] = Array.from(
  webCoreBasicCatalog.components.values(),
);

/**
 * The default set of components provided by the basic catalog (defaults to native React components).
 */
export const BASIC_COMPONENTS: ReactCatalogComponent[] = BASIC_NATIVE_COMPONENTS;

/**
 * The set of client-side functions provided by the basic catalog.
 */
export {BASIC_FUNCTIONS};

/**
 * Interface for specifying overrides and configuration for the basic catalog.
 */
export interface BasicCatalogOptions {
  /** An optional override for the catalog's unique identifier. */
  id?: string;
  /** An optional locale to configure catalog-level formatting. */
  locale?: string;
  /**
   * Whether to use universal W3C Custom Elements instead of native React components.
   * Defaults to `false` for 100% backwards compatibility.
   */
  useUniversalComponents?: boolean;
  /** Optional overrides for individual components in the catalog. */
  components?: Partial<Record<string, ReactCatalogComponent>>;
  /** Optional additional components to include in the catalog beyond the basic catalog components. */
  extraComponents?: ReactCatalogComponent[];
  /** An optional set of function implementations to use instead of the defaults. */
  functions?: FunctionImplementation[];
}

/**
 * A basic catalog populated with native React component implementations.
 */
export class NativeBasicCatalog extends Catalog<ReactCatalogComponent> {
  constructor(options: BasicCatalogOptions = {}) {
    const id = options.id ?? webCoreBasicCatalog.id;
    const functions =
      options.functions ??
      (options.locale
        ? createBasicCatalogFunctions({locale: options.locale})
        : Array.from(webCoreBasicCatalog.functions.values()));

    const baseComponents = new Map<string, ReactCatalogComponent>(
      Object.entries(DEFAULT_NATIVE_COMPONENT_IMPLEMENTATIONS).map(([key, impl]) => [
        impl.name || key,
        impl,
      ]),
    );

    if (options.components) {
      for (const [key, comp] of Object.entries(options.components)) {
        if (comp) {
          const resolvedComp =
            comp.name === key
              ? comp
              : {
                  name: key,
                  schema: comp.schema,
                  ...('render' in comp ? {render: comp.render} : {}),
                };
          baseComponents.set(key, resolvedComp as ReactCatalogComponent);
        }
      }
    }

    const components: ReactCatalogComponent[] = [
      ...Array.from(baseComponents.values()),
      ...(options.extraComponents ?? []),
    ];

    super(id, components, functions);
  }
}

/**
 * A basic catalog populated with universal W3C Custom Element component implementations.
 */
export class UniversalBasicCatalog extends Catalog<ReactCatalogComponent> {
  constructor(options: BasicCatalogOptions = {}) {
    const id = options.id ?? webCoreBasicCatalog.id;
    const functions =
      options.functions ??
      (options.locale
        ? createBasicCatalogFunctions({locale: options.locale})
        : Array.from(webCoreBasicCatalog.functions.values()));

    const baseComponents = new Map<string, ReactCatalogComponent>(webCoreBasicCatalog.components);

    if (options.components) {
      for (const [key, comp] of Object.entries(options.components)) {
        if (comp) {
          let resolvedComp =
            'render' in comp ? toWebComponent(comp as ReactComponentImplementation) : comp;
          if (resolvedComp.name !== key) {
            resolvedComp = {
              name: key,
              schema: resolvedComp.schema,
              tagName: (resolvedComp as {tagName?: string}).tagName || '',
              ...('render' in resolvedComp ? {render: resolvedComp.render} : {}),
            };
          }
          baseComponents.set(key, resolvedComp);
        }
      }
    }

    const extra = (options.extraComponents ?? []).map(comp => {
      if ('render' in comp) {
        return toWebComponent(comp as ReactComponentImplementation);
      }
      return comp;
    });

    const components: ReactCatalogComponent[] = [...Array.from(baseComponents.values()), ...extra];

    super(id, components, functions);
  }
}

/**
 * The basic catalog supporting dynamic selection between native React and universal Web Components.
 */
export class BasicCatalog extends Catalog<ReactCatalogComponent> {
  constructor(options: BasicCatalogOptions = {}) {
    const targetCatalog = options.useUniversalComponents
      ? new UniversalBasicCatalog(options)
      : new NativeBasicCatalog(options);

    super(
      targetCatalog.id,
      Array.from(targetCatalog.components.values()),
      Array.from(targetCatalog.functions.values()),
      targetCatalog.themeSchema,
    );
  }
}

/**
 * Default basic catalog instance using native React components (backwards-compatible).
 */
export const basicCatalog = new BasicCatalog();

export {
  Text,
  Image,
  Icon,
  Video,
  AudioPlayer,
  Row,
  Column,
  List,
  Card,
  Tabs,
  Divider,
  Modal,
  Button,
  TextField,
  CheckBox,
  ChoicePicker,
  Slider,
  DateTimeInput,
};
