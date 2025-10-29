export const validateTitle = (title) => !title.trim();

export const validateContent = (content) => {
  const stripped = content.replace(/<[^>]*>/g, '').trim();
  return !stripped;
};