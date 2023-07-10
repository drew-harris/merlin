export const sendMessage = async (message: string): Promise<boolean> => {
  try {
    if (!process.env.KEY) {
      throw new Error("Missing key env variable");
    }
    const response = await fetch(
      "https://hunter-bot-production.up.railway.app/drewh",
      {
        method: "POST",
        body: JSON.stringify({
          message,
          key: process.env.KEY,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
