import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PomodoroProvider } from './context/PomodoroContext.tsx';

createRoot(document.getElementById('root')!).render(  
<PomodoroProvider>
    <App />
  </PomodoroProvider>,);
