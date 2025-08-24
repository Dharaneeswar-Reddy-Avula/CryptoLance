import Message from "../models/messageModel.js"
import PortfolioScheema from "../models/PortfolioModel.js"
import { renameSync } from "fs"
import { dirname } from "path"
import { fileURLToPath } from "url"
import { emitToUser, emitToAll } from "../socket.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const getUsersForSidebar = async (req, res) => {
  try {
    const walletConnectedUserId = req.user.address
    
    // Get all users except the current user
    const filterUsers = await PortfolioScheema.find({
      "heroSection.walletAddress": { $ne: walletConnectedUserId }
    })
      .select("heroSection.name heroSection.profile heroSection.walletAddress")
      .lean()

    const formattedUsers = filterUsers.map((p) => ({
      _id: p.heroSection?.walletAddress,
      fullname: p.heroSection?.name,
      profile: p.heroSection?.profile,
    }))

    return res.status(200).json(formattedUsers)
  } catch (error) {
    console.log("Error in the getUsers For Sidebar", error.message)
    res.status(500).json({ error: "Internal Server Error", msg: error.message })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params
    const myId = req.user.address
    
    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          recieverId: userToChatId,
        },
        {
          senderId: userToChatId,
          recieverId: myId,
        },
      ],
    }).sort({ createdAt: 1 })
    
    res.status(200).json(messages)
  } catch (error) {
    console.log("Error in getMessages Controller", error.message)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body
    const { id: recieverId } = req.params
    const senderId = req.user.address

    if (!text && !req.file) {
      return res.status(400).send("Message or file is required.")
    }

    const messageData = {
      senderId,
      recieverId,
      text,
      image: image || "",
    }

    if (req.file) {
      const date = Date.now()
      const fileName = "uploads/files/" + date + req.file.originalname
      renameSync(req.file.path, fileName)
      messageData.image = fileName
    }

    const newMessage = new Message(messageData)
    await newMessage.save()

    console.log("Message saved, emitting to users:", {
      senderId,
      recieverId,
      messageId: newMessage._id,
    })

    // Emit to receiver if online
    const receiverEmitted = emitToUser(recieverId, "newMessage", newMessage)
    console.log("Message emitted to receiver:", receiverEmitted)

    // Emit to sender for real-time updates
    const senderEmitted = emitToUser(senderId, "newMessage", newMessage)
    console.log("Message emitted to sender:", senderEmitted)

    // Also emit to all connected clients for real-time updates
    emitToAll("newMessage", newMessage)
    console.log("Message broadcasted to all clients")

    res.status(201).json(newMessage)
  } catch (error) {
    console.log("Error in SendMessage Controller", error.message)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
