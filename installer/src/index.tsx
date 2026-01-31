import { createCliRenderer } from '@opentui/core';
import { createRoot } from '@opentui/react';
import React from 'react';

const App = () => (
  <box padding={2}>
    <text>TUI is under reconstruction. Start fresh here.</text>
  </box>
);

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
