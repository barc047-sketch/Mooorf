import { useLab } from "../state/store";
import { ensureMissingSpaceCodes } from "./spaceCode";

let reconciling = false;

const reconcileSpaceCodes = (): void => {
  if (reconciling) return;
  const state = useLab.getState();
  const normalized = ensureMissingSpaceCodes(state.spaces);
  if (!normalized.changed) return;
  reconciling = true;
  try {
    useLab.setState({ spaces: normalized.spaces });
  } finally {
    reconciling = false;
  }
};

reconcileSpaceCodes();

useLab.subscribe((state, previous) => {
  if (state.spaces !== previous.spaces) reconcileSpaceCodes();
});
