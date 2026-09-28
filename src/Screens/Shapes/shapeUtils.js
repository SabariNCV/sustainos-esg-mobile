import { scaleHeight, scaleWidth } from '../../Constants/dynamicSize';
import { panelscaleHeight, panelscaleWidth } from '../../Constants/panelSize';

export const SCALERS = {
  panel: { height: panelscaleHeight, width: panelscaleWidth },
  default: { height: scaleHeight, width: scaleWidth },
};

export const resolveShapeStyles = (stylesList, id, tabShape) =>
  tabShape
    ? stylesList?.find((ele) => ele.id === id)?.dataIs
    : stylesList?.[id]?.dataIs;

export const hasRequiredStyles = (shapeStyles) =>
  Boolean(
    shapeStyles?.position &&
      shapeStyles?.width &&
      shapeStyles?.height &&
      shapeStyles?.SquareBg &&
      shapeStyles?.rotation != null
  );