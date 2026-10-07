import { createFacilityBridge } from './bridge';
import './styles.css';

const bridge = createFacilityBridge();
bridge.mount(document.getElementById('root')!);

window.addEventListener('beforeunload', () => bridge.saveProgress());
