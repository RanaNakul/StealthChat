import React, { useState } from "react";
import { Edit2, CheckCircle, MapPin, Mail, MessageSquare } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile, updateUserStatus } from "../lib/api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { authUser } = useAuthUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isStatus, setIsStatus] = useState(false);
  const [form, setForm] = useState();
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  function openEdit() {
    setForm({
      fullName: authUser.fullName || "",
      userName: authUser.userName || "",
      country: authUser.country || "",
      bio: authUser.bio || "",
      profilePicture: authUser.profilePicture || "",
    });
    setIsEditing(true);
  }

  function closeEdit() {
    setIsEditing(false);
  }

  function openStatus() {
    setIsStatus(true);
  }

  function closeStatus() {
    setIsStatus(false);
  }

  const { mutate: updateProfileMutation } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Profile onboarded successfully!");
    },
    onError: (error) => {
      console.log("error: ", error);
      toast.error("Failed to update profile.");
    },
  });

  const { mutate: updateStatusMutation } = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Status updated successfully!");
    },
    onError: (error) => {
      console.log("error: ", error);
      toast.error("Failed to update status.");
    },
  });

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);

    // optimistic update: update cached authUser immediately
    queryClient.setQueryData(["authUser"], (old) => ({
      ...(old || {}),
      fullName: form.fullName,
      userName: form.userName,
      country: form.country,
      bio: form.bio,
      profilePicture: form.profilePicture,
      status: form.status,
      // keep backward-compat boolean
      isOnline: form.status === "online",
    }));

    updateProfileMutation(form);

    setSaving(false);
    setIsEditing(false);
  }

  // quick status change (buttons near the name)
  function changeStatus(newStatus) {
    updateStatusMutation({ status: newStatus });
    setIsStatus(false);
  }

  // helper to render status badge
  function renderStatusBadge(status) {
    const baseClasses =
      "text-xs flex items-center gap-2 px-2 py-0.5 rounded-full";
    if (status === "online") {
      return (
        <p className={`${baseClasses} text-success bg-success/10`}>
          <span className="w-2 h-2 rounded-full bg-success inline-block" />
          Online
        </p>
      );
    } else if (status === "busy") {
      return (
        <p className={`${baseClasses} text-warning bg-warning/10`}>
          <span className="w-2 h-2 rounded-full bg-warning inline-block" />
          Busy
        </p>
      );
    } else {
      return (
        <p className={`${baseClasses} text-error bg-error/10`}>
          <span className="w-2 h-2 rounded-full bg-error inline-block" />
          Offline
        </p>
      );
    }
  }

  return (
    <div className="p-6 lg:p-10 bg-base-100 min-h-screen">
      <div className="container mx-auto">
        <div className="flex items-start gap-6 flex-col ">
          <div className="w-full ">
            <div className="card bg-base-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={authUser.profilePicture}
                    alt={authUser.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h1 className="text-xl font-semibold">
                        {authUser.fullName}
                      </h1>

                      {/* Status badge */}
                      <div className="ml-2">
                        <button onClick={openStatus} aria-label="Change status">
                          {renderStatusBadge(authUser?.isOnline)}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm opacity-70">@{authUser.userName}</p>
                  </div>
                </div>

                {/* Quick status controls */}

                <StatusBadgeModal
                  changeStatus={changeStatus}
                  openStatus={openStatus}
                  closeStatus={closeStatus}
                  isStatus={isStatus}
                />

                <div>
                  <button
                    onClick={openEdit}
                    className="btn btn-outline btn-sm flex items-center gap-2"
                    aria-label="Edit profile"
                  >
                    <Edit2 className="size-4" /> Edit
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full ">
            <div className="space-y-6">
              <div className="card bg-base-200 p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Contact</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 opacity-70" />
                    <div className="text-sm opacity-80">{authUser.email}</div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Location</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="size-4" />
                    <div>{authUser.country}</div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-sm opacity-80">{authUser.bio}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal (simple, in-file) */}
      {isEditing && (
        <EditProfileModal
          form={form}
          setForm={setForm}
          onClose={closeEdit}
          onSave={saveProfile}
          saving={saving}
        />
      )}
    </div>
  );
}

function EditProfileModal({ form, setForm, onClose, onSave, saving }) {
  if (!form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <form
        onSubmit={onSave}
        className="relative z-10 w-full max-w-2xl bg-base-100 rounded-2xl shadow-2xl p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Profile</h3>
          <button
            type="button"
            className="text-sm opacity-70"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs opacity-70 mb-1">Full name</label>
            <input
              className="input input-bordered w-full"
              value={form.fullName}
              onChange={(e) =>
                setForm((s) => ({ ...s, fullName: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-xs opacity-70 mb-1">Username</label>
            <input
              className="input input-bordered w-full"
              value={form.userName}
              onChange={(e) =>
                setForm((s) => ({ ...s, userName: e.target.value }))
              }
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs opacity-70 mb-1">Country</label>
            <input
              className="input input-bordered w-full"
              value={form.country}
              onChange={(e) =>
                setForm((s) => ({ ...s, country: e.target.value }))
              }
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs opacity-70 mb-1">Bio</label>
            <textarea
              rows={3}
              className="textarea textarea-bordered w-full"
              value={form.bio}
              onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs opacity-70 mb-1">
              Profile picture URL
            </label>
            <input
              className="input input-bordered w-full"
              value={form.profilePicture}
              onChange={(e) =>
                setForm((s) => ({ ...s, profilePicture: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            disabled={saving}
          >
            Close
          </button>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function StatusBadgeModal({ changeStatus, closeStatus, isStatus }) {
  if (!isStatus) return null;

  return (
    <div className="fixed inset-0 z-50  ">
      <div className="absolute inset-0  " onClick={closeStatus} />
      <div className="absolute z-10 top-[108px] left-[600px]">
        <div className="flex flex-col w-fit items-start gap-2 py-1 bg-base-100 px-2 rounded-2xl shadow-lg z-10">
          <button
            onClick={() => changeStatus("online")}
            className="btn btn-sm btn-ghost"
            aria-label="Set status online"
            title="Online"
          >
            <span className="w-2 h-2 rounded-full bg-success inline-block mr-2" />
            Online
          </button>
          <button
            onClick={() => changeStatus("busy")}
            className="btn btn-sm btn-ghost"
            aria-label="Set status busy"
            title="Busy"
          >
            <span className="w-2 h-2 rounded-full bg-warning inline-block mr-2" />
            Busy
          </button>
          <button
            onClick={() => changeStatus("offline")}
            className="btn btn-sm btn-ghost"
            aria-label="Set status offline"
            title="Offline"
          >
            <span className="w-2 h-2 rounded-full bg-error inline-block mr-2" />
            Offline
          </button>
        </div>
      </div>
    </div>
  );
}
