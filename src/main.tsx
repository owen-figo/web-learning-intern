import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {PomodoroProvider} from './context/PomodoroContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <PomodoroProvider>
    <App />
  </PomodoroProvider>,
);
