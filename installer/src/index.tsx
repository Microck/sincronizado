import React from 'react';
import { createRoot } from '@opentui/react';
import { createCliRenderer } from '@opentui/core';
import { App } from './App.js';

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
