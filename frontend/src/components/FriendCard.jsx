import { Link } from "react-router";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12 ">
            <img
              src={friend.profilePicture}
              alt={friend.fullName}
              className="rounded-full"
            />
          </div>
          <div className="flex flex-col justify-between items-start">
            <h3 className="font-semibold truncate">{friend.fullName}</h3>
            {renderStatusBadge(friend?.isOnline)}
          </div>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

function renderStatusBadge(status) {
  const baseClasses =
    "text-xs flex items-center gap-2 py-0.5 rounded-full";
  if (status === "online") {
    return (
      <p className={`${baseClasses} text-success `}>
        <span className="w-2 h-2 rounded-full bg-success inline-block" />
        Online
      </p>
    );
  } else if (status === "busy") {
    return (
      <p className={`${baseClasses} text-warning `}>
        <span className="w-2 h-2 rounded-full bg-warning inline-block" />
        Busy
      </p>
    );
  } else {
    return (
      <p className={`${baseClasses} text-error `}>
        <span className="w-2 h-2 rounded-full bg-error inline-block" />
        Offline
      </p>
    );
  }
}
