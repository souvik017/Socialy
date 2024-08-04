import Chat from "../Models/chat.js";
import user from "../Models/user.js";


const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  // Prevent users from accessing a chat with themselves
  if (req.user._id.toString() === userId.toString()) {
    return res.status(400).send({ error: "You cannot start a chat with yourself" });
  }

  console.log(req.user._id);
  console.log(userId);
  try {
    // Check if the chat already exists
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { members: { $elemMatch: { $eq: req.user._id } } },
        { members: { $elemMatch: { $eq: userId } } },
      ],
    })
    .populate("members", "-password")
    .populate("latestMessage");

    // If chat exists, return it
    if (isChat.length > 0) {
      res.status(200).send(isChat[0]);
    } else {
      // Fetch the user's information to get the name
      const User = await user.findById(userId).select("name");

      if (!User) {
        return res.status(404).send({ error: "User not found" });
      }

      // Create new chat data with user's name

      const chatData = {
        name: User.name || "sender", // Use user's name or "sender" if name is undefined
        isGroupChat: false,
        members: [req.user._id, userId],
      };

      // Create a new chat
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("members", "-password")
        .populate("latestMessage.sender", "name pic email");

      res.status(200).send(fullChat);
    }
  } catch (error) {
    console.error("Internal server error", error);
    res.status(500).send({ error: "Internal server error" });
  }
};


const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({ members: { $elemMatch: { $eq: req.user?._id } } })
      .populate("members", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await user.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(chats);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

const createGroupChat = async (req, res) => {
  try {
    if (!req.body.name || !req.body.members) {
      return res.status(400).send({ message: "Please fill all the fields" });
    }

    const members = JSON.parse(req.body.members);

    if (members.length < 1) {
      return res.status(400).send("At least 2 users are required to form a group chat");
    }

    members.push(req.user._id);

    const groupChat = await Chat.create({
      name: req.body.name,
      members: members,
      groupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("members", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

const renameGroup = async (req, res) => {
   const { chatId, chatName}= req.body;

   const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      name: chatName,
    },
    {
      new : true,
    }
   )
   .populate("members", "-password")
   .populate("groupAdmin", "-password");

   if(!updatedChat){
    res.status(404);
    console.log("chat not found");
   }else{
    res.json(updatedChat);
   }
};

const removeFromGroup = async (req, res) => {
  const { chatId, userId}= req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,{
    $pull: {members : userId},
  },{
    new : true
  })
  .populate("members", "-password")
  .populate("groupAdmin", "-password");

  if(!removed){
    res.status(404);
    console.log("chat not found");
  }else{
    res.json(removed);
  }
};

const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).send({ message: "Chat not found" });
    }

    if (chat.members.includes(userId)) {
      return res.status(400).send({ message: "User already present in the group" });
    }

    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { members: userId } },
      { new: true }
    )
      .populate("members", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return res.status(404).send({ message: "Failed to add user to the group" });
    }

    res.json(added);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};



export { accessChat, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup };

