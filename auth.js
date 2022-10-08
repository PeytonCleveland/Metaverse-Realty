const getUser = (token) => {
  return token === "Bearer token"
    ? {
        id: 1,
        firstName: "Peyton",
        lastName: "Cleveland",
        email: "peyton.cleveland.1@gmail.com",
        walletAddress: "1x3vk08a2c",
      }
    : null;
};

export default getUser;
