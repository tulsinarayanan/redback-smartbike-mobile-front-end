export const chatContacts = [
  {
    id: 1,
    name: "Jordan Anderson",
    photo: "https://i.pravatar.cc/150?img=12",
    status: "Online",
    lastSeen: "last seen 2 mins ago",
    time: "12:00",
    unread: 2,
    lastMessage: "Hey Jordan! See you after the ride?",
    messages: [
      { id: "1-1", sender: "them", text: "Hey! Are you free after work?", time: "Yesterday 2:26 PM" },
      { id: "1-2", sender: "me", text: "Oh, hello! I’m just finishing up a workout.", time: "Yesterday 2:38 PM" },
      { id: "1-3", sender: "them", text: "Nice! Want to catch up later?", time: "Yesterday 2:44 PM" },
      { id: "1-4", sender: "me", text: "Yeah sure, I’ll be there this evening.", time: "Yesterday 2:50 PM" },
    ],
  },
  {
    id: 2,
    name: "Aviksha Vidya",
    photo: "https://i.pravatar.cc/150?img=5",
    status: "Online",
    lastSeen: "last seen 1 min ago",
    time: "13:50",
    unread: 1,
    lastMessage: "I need to tell you about this new challenge!",
    messages: [
      { id: "2-1", sender: "them", text: "Did you join the weekend ride?", time: "Today 1:05 PM" },
      { id: "2-2", sender: "me", text: "Not yet, but I’m planning to.", time: "Today 1:08 PM" },
      { id: "2-3", sender: "them", text: "You should, it looks really fun.", time: "Today 1:10 PM" },
    ],
  },
  {
    id: 3,
    name: "Karan Kapoor",
    photo: "https://i.pravatar.cc/150?img=20",
    status: "Away",
    lastSeen: "last seen 20 mins ago",
    time: "13:30",
    unread: 0,
    lastMessage: "Yes I can do that for you in the app.",
    messages: [
      { id: "3-1", sender: "them", text: "Can you send me the workout plan?", time: "Today 12:55 PM" },
      { id: "3-2", sender: "me", text: "Yes, I’ll send it soon.", time: "Today 1:00 PM" },
    ],
  },
  {
    id: 4,
    name: "Alicia Chen",
    photo: "https://i.pravatar.cc/150?img=24",
    status: "Online",
    lastSeen: "last seen just now",
    time: "12:45",
    unread: 0,
    lastMessage: "Yes! I am so happy 😊",
    messages: [
      { id: "4-1", sender: "them", text: "Hi! What’s up?", time: "Yesterday 2:26 PM" },
      { id: "4-2", sender: "me", text: "Oh, hello! All perfectly fine, I’m just heading out for something.", time: "Yesterday 2:38 PM" },
      { id: "4-3", sender: "them", text: "That sounds good.", time: "Yesterday 2:44 PM" },
      { id: "4-4", sender: "me", text: "Yeah sure I’ll be there this weekend with my brother.", time: "Yesterday 2:50 PM" },
      { id: "4-5", sender: "them", text: "Yes I am so happy 😊", time: "Yesterday 3:02 PM" },
    ],
  },
];

export const getChatContactById = (id) =>
  chatContacts.find((contact) => String(contact.id) === String(id));
