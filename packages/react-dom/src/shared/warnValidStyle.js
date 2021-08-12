/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let warnValidStyle = () => {};

if (__DEV__) {
  // 'msTransform' is correct, but the other prefixes should be capitalized
  const badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
  const msPattern = /^-ms-/;
  const hyphenPattern = /-(.)/g;

  // style values shouldn't contain a semicolon
  const badStyleValueWithSemicolonPattern = /;\s*$/;

  const warnedStyleNames = {};
  const warnedStyleValues = {};
  let warnedForNaNValue = false;
  let warnedForInfinityValue = false;

  const camelize = function(string) {
    return string.replace(hyphenPattern, function(_, character) {
      return character.toUpperCase();
    });
  };

  const warnHyphenatedStyleName = function(name) {
    if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
      return;
    }

    warnedStyleNames[name] = true;
    console.error(
      'Unsupported style property %s. Did you mean %s?',
      name,
      // As Andi Smith suggests
      // (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
      // is converted to lowercase `ms`.
      camelize(name.replace(msPattern, 'ms-')),
    );
  };

  const warnBadVendoredStyleName = function(name) {
    if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
      return;
    }

    warnedStyleNames[name] = true;
    console.error(
      'Unsupported vendor-prefixed style property %s. Did you mean %s?',
      name,
      name.charAt(0).toUpperCase() + name.slice(1),
    );
  };

  const warnStyleValueWithSemicolon = function(name, value) {
    if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
      return;
    }

    warnedStyleValues[value] = true;
    console.error(
      "Style property values shouldn't contain a semicolon. " +
        'Try "%s: %s" instead.',
      name,
      value.replace(badStyleValueWithSemicolonPattern, ''),
    );
  };

  const warnStyleValueIsNaN = function(name, value) {
    if (warnedForNaNValue) {
      return;
    }

    warnedForNaNValue = true;
    console.error(
      '`NaN` is an invalid value for the `%s` css style property.',
      name,
    );
  };

  const warnStyleValueIsInfinity = function(name, value) {
    if (warnedForInfinityValue) {
      return;
    }

    warnedForInfinityValue = true;
    console.error(
      '`Infinity` is an invalid value for the `%s` css style property.',
      name,
    );
  };

  const warnStyleValueIsUnsupported = function(name, value) {
    console.error(
      '`%s` is an invalid value for the `%s` css style property.',
      value,
      name,
    );
  };

  warnValidStyle = function(name, value, styleValue) {
    if (name.indexOf('-') > -1) {
      warnHyphenatedStyleName(name);
    } else if (badVendoredStyleNamePattern.test(name)) {
      warnBadVendoredStyleName(name);
    } else if (badStyleValueWithSemicolonPattern.test(value)) {
      warnStyleValueWithSemicolon(name, value);
    }

    if (typeof value === 'number' && isNaN(value)) {
      warnStyleValueIsNaN(name, value);
    } else if (typeof value === 'number' && !isFinite(value)) {
      warnStyleValueIsInfinity(name, value);
    } else if (
      typeof CSS !== 'undefined' &&
      typeof CSS.supports !== 'undefined'
    ) {
      const div = document.createElement('div');
      div.style[name] = styleValue;
      if (!CSS.supports(div.style.item(0), styleValue)) {
        warnStyleValueIsUnsupported(name, value);
      }
    }
  };
}

export default warnValidStyle;
