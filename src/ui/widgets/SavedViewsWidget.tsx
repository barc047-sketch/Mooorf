/* V6K — Saved Views inside the widget system. The list/actions component is
   the existing SavedViewsPanel; the widget frame supplies chrome + movement. */

import SavedViewsPanel from "../SavedViewsPanel";

export default function SavedViewsWidget() {
  return <SavedViewsPanel embedded />;
}
