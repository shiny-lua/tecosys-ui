import { getService } from "../service";

// Get chat details
export const getPrompts = async () => {
  const { data } = await getService(`/admin-panel/manage-community-prompts/`);
  return data;
};
