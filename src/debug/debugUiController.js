export {
  handleDebugUiShortcut,
  isTextEntryTarget,
} from "./debugBootstrap.js";

export function createDebugUiController({
  allowed = true,
  initialVisible = false,
  onVisibilityChange = () => {},
} = {}) {
  const debugAllowed = Boolean(allowed);
  let visible = debugAllowed && Boolean(initialVisible);

  function setVisible(nextVisible) {
    visible = debugAllowed && Boolean(nextVisible);
    onVisibilityChange(visible);
    return visible;
  }

  return {
    isAllowed: () => debugAllowed,
    isVisible: () => visible,
    setVisible,
    toggle: () => setVisible(!visible),
  };
}
