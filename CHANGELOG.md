# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Removed

  - Remove chainable return from methods.

### Changed

  - Rename `emitEvent` to `emit`
  - Convert `emit` second parameter to rest parameter
  - Rename `allOff` to `reset`
  - Support for mix-ins to extend a prototype is through the static `mixin` instead of `prototype`
  - Invoke callbacks without binding `this`