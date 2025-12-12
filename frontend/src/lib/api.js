import { axiosInstance } from "./axios";

export const signup = async (signUpData) => {
  const response = await axiosInstance.post("/auth/signup", signUpData);
  //   console.log("response:", response);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser: ", error);
    return null;
  }
};

export const completeOnboarding = async (onboardingData) => {
  const res = await axiosInstance.post("/auth/onboarding", onboardingData);
  return res.data;
};

export const getUserFriends = async () => {
  const res = await axiosInstance.get("/users/friends");
  return res.data.friends;
};

export const getRecommendedUsers = async () => {
  const res = await axiosInstance.get("/users");
  return res.data.recommendedUsers;
};

export const getOutgoingFriendReqs = async () => {
  const res = await axiosInstance.get("/users/outgoing-friend-requests");
  // console.log("res: ", res.data )
  return res.data.outgoingReqs;
};

export const sendFriendRequest = async (userId) => {
  const res = await axiosInstance.post(`/users/friend-request/${userId}`);
  // console.log("sendFriendRequest response: ", res.data)
  return res.data;
};

export const getFriendRequests = async () => {
  const res = await axiosInstance.get("/users/friend-requests");
  console.log("res: ", res);
  return res.data;
};

export const acceptFriendRequest = async (requestId) => {
  const res = await axiosInstance.put(
    `/users/friend-request/${requestId}/accept`
  );
  console.log("res accept: ", res);
  return res.data;
};

export const declineFriendRequest = async (requestId) => {
  const res = await axiosInstance.delete(
    `/users/friend-request/${requestId}/decline`
  );
  return res.data;
};

export const getStreamToken = async () => {
  const res = await axiosInstance.get("/chat/token");
  return res.data.token;
};

export const updateUserProfile = async (profileData) => {
  const res = await axiosInstance.post("/auth/update-profile", profileData);
  return res.data;
};

export const updateUserStatus = async (status) => {
  const res = await axiosInstance.post("/auth/update-status", status);
  console.log("res:", res)

  return res.data;
};
