import { getService } from "../service";

// Get chat details
export const getPrompts = async () => {
  const { data } = await getService(`/community-prompts/`);
  return data;
};
