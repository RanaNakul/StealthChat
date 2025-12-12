import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import {
  CameraIcon,
  LoaderIcon,
  MapPinIcon,
  ShipWheelIcon,
  ShuffleIcon,
  Pencil,
} from "lucide-react";

const OnBoardingPage = () => {
  const { authUser } = useAuthUser();

  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    userName: authUser?.userName || "",
    bio: authUser?.bio || "",
    profilePicture: authUser?.profilePicture || "",
    country: authUser?.country || "",
  });

  // console.log("authUser:", authUser);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Profile onboarded successfully!");
    },
    onError: (error) => {
      console.log("error: ", error);
    },
  });

  const handleRandomAvatar = () => {
    const idx = Math.random().toString(36).substring(7);
    const avatarUrl = `https://api.dicebear.com/9.x/fun-emoji/png?seed=${idx}`;
    setFormState({ ...formState, profilePicture: avatarUrl });
    toast.success("Random profile picture generated!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  return (
    <div
      className="min-h-screen bg-base-100 flex items-center justify-center p-4"
      data-theme="forest"
    >
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            Complete Your Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden relative flex items-end justify-center ">
                {formState.profilePicture ? (
                  <>
                    <img
                      src={formState.profilePicture}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute w-full h-5 z-30 bg-base-300 cursor-pointer flex items-center justify-center opacity-70">
                      <Pencil className="text-base-content z-30 size-3.5 " />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40 z-20" />
                  </div>
                )}
              </div>

              {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="btn btn-accent"
                >
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) =>
                  setFormState({ ...formState, fullName: e.target.value })
                }
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>

            {/* User NAME */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text">User Name</span>
              </label>
              <input
                type="text"
                name="userName"
                value={formState.userName}
                onChange={(e) =>
                  setFormState({ ...formState, userName: e.target.value })
                }
                className="input input-bordered w-full"
                placeholder="Your User Name"
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) =>
                  setFormState({ ...formState, bio: e.target.value })
                }
                className="textarea textarea-bordered h-18 w-full"
                placeholder="Tell others about yourself"
              />
            </div>

            {/* City/Country */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text"> City/Country </span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform z-20 -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="country"
                  value={formState.country}
                  onChange={(e) =>
                    setFormState({ ...formState, country: e.target.value })
                  }
                  className="input input-bordered w-full pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              className="btn btn-primary w-full"
              disabled={isPending}
              type="submit"
            >
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnBoardingPage;
