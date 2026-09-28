import { scaleHeight, scaleWidth, normalizeFont } from '../Constants/dynamicSize';
import { panelscaleHeight, panelscaleWidth, panelnormalizeFont } from '../Constants/panelSize';

const DEFAULT_SCALERS = { sw: scaleWidth, sh: scaleHeight, sf: normalizeFont };
const PANEL_SCALERS = { sw: panelscaleWidth, sh: panelscaleHeight, sf: panelnormalizeFont };

export const getScalers = (type) => (type === 'panel' ? PANEL_SCALERS : DEFAULT_SCALERS);