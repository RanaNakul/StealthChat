import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);

  const [channel, setChannel] = useState(null);

  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: token } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!authUser || !token || !targetUserId) return;

      try {
        console.log("Initializing stream chat client...");
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePicture,
          },
          token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currentChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currentChannel.watch();

        setChatClient(client);
        setChannel(currentChannel);
      } catch (error) {
        console.error("Error initializing chat client: ", error);
        toast.error("Failed to load chat. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [authUser, targetUserId, token]);

  const handleViderCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `Video Call Invitation: Click the link to join the call: ${callUrl}`,
      });

      toast.success("Video call invitation sent!");
    }
  };

  if ((loading, !chatClient || !channel)) return <ChatLoader />;

  return (
    <div className="h-[calc(100vh-64px)]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className=" w-full relative ">
            <CallButton handleViderCall={handleViderCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
