import Chat from "../Models/chat.js";
import message from "../Models/message.js";
import user from "../Models/user.js";

const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;

    const newMessage = {
        creator: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        let createdMessage = await message.create(newMessage);

        createdMessage = await createdMessage.populate("creator", "name pic");
        createdMessage = await createdMessage.populate("chat");
        createdMessage = await user.populate(createdMessage, {
            path: 'chat.user',
            select: 'name pic email',
        });

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: createdMessage,
        });

        res.json(createdMessage);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

const allMessage = async (req, res) => {

    try {
        const allMessage = await message.find({chat: req.params.chatId})
            .populate("creator", "name pic email")
            .populate("chat")

        res.json(allMessage)
    } catch (error) {
        res.status(400);
        console.log(error)
    }
} 


export {sendMessage, allMessage};
