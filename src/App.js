import React, { useState } from "react";
import * as signalR from "@microsoft/signalr";

function App() {
  const [connected, setConnected] = useState(false);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("Student");
  const [connection, setConnection] = useState(null);
  const [input, setInput] = useState("");
  const [inputA, setInputA] = useState("");
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [userList, setUserList] = useState([]);

  const connectToChat = async () => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7172/chathub")
      .withAutomaticReconnect()
      .build();

    newConnection.on("ReceiveMessage", (role, userName, message) => {
      setMessages((m) => [...m, `${role} ${userName}: ${message}`]);
    });

    newConnection.on("ReceiveAnnouncement", (a) => {
      setAnnouncements(a);
    });
    newConnection.on("UpdateUserList", (userList) => {
      setUserList(userList);
    });

    newConnection.on("UserJoined", (message) => {
      setMessages((m) => [...m, message]);
    });
    newConnection.on("UserLeft", (message) => {
      setMessages((m) => [...m, message]);
    });

    try {
      await newConnection.start();
      await newConnection.invoke("JoinChat", userName, role);
      setConnection(newConnection);
      setConnected(true);
    } catch (e) {
      console.error("Cant connect to the server: ", e);
    }
  };

  const send = async () => {
    if (!connection) return;

    try {
      await connection.invoke("SendMessage", role, userName, input);
      setInput("");
    } catch (e) {
      console.error("Message could not be delivered: ", e);
    }
  };
    const announce = async () => {
    if (!connection) return;

    try {
        await connection.invoke("SendAnnouncement", role, userName, inputA);
      setInputA("");
    } catch (e) {
      console.error("Announcement could not be delivered: ", e);
    }
  };

  if (!connected) {
    return (
      <div style={{padding: "25px"}}>
        <h2>Anslut till chatten!</h2>
        <input
          type="text"
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
          placeholder="Namn"
          style={{paddingLeft: "10px", paddingRight: "10px", borderRadius: "5px", height: "auto", fontSize:"18px"}}
        />
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value)}
          style={{marginLeft:"5px",padding: "2px", borderRadius: "5px", height: "auto", fontSize:"18px"}}>

          <option value="Student">Student</option>
          <option value="Lärare">Lärare</option>
        </select>
        <button 
          onClick={connectToChat} 
          disabled={!userName}
          style={{marginLeft:"5px",paddingLeft: "10px", paddingRight: "10px", borderRadius: "5px", height: "auto", fontSize:"18px"}}>
          Anslut till chatt!
        </button>
      </div>
    );
  }
  return (
  <div style={{padding: "35px", display:"flex"}}>
    <div style={{width:"500px"}}>
    <h2>Välkommen {role} {userName}</h2>

    <h3>Fastnålat</h3>
    <div style={{ border: "1px dash black", padding: "10px", maxHeight: "150px", overflowY: "auto", marginTop: "-5px" }}>
      {announcements.map((a, i) => (
        <div key={i} style={{ color: "darkred", fontWeight: "bold" }}>
          {a.role} {a.user}: {a.message}
        </div>
      ))}
    </div>

    <h3>Chatt</h3>
    <div style={{ border: "1px solid #ccc", padding: "10px", height: "200px", overflowY: "auto", marginTop: "-5px" }}>
      {messages.map((m, i) => (
        <div key={i}>{m}</div>
      ))}
    </div>

    <input
      type="text"
      value={input}
      placeholder="Meddelande..."
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => { if (e.key === "Enter") send(); }}
      style={{paddingLeft: "10px", paddingRight: "10px", borderRadius: "5px", height: "auto", fontSize:"18px"}}
    />
    <button 
      onClick={send} 
      disabled={!input.trim()}
      style={{marginTop:"20px",paddingLeft: "10px", paddingRight: "10px", borderRadius: "5px", marginLeft: "10px", height: "auto",fontSize:"18px"}}>
      Skicka
    </button>

    {role === "Lärare" && (
      <div style={{ paddingTop: "20px" }}>
        <input
          type="text"
          value={inputA}
          placeholder="Fastnålat inlägg.."
          onChange={(r) => setInputA(r.target.value)}
          style={{paddingLeft: "10px", paddingRight: "10px", borderRadius: "5px", height: "auto", fontSize:"18px"}}
        />
        <button 
          onClick={announce} 
          disabled={!inputA.trim()}
          style={{paddingLeft: "10px", paddingRight: "10px", borderRadius: "5px", marginLeft: "10px", height: "auto",fontSize:"18px"}}>
Nåla fast!
        </button>
      </div>
    )}
    </div>
    <div style={{width:"200px",padding: "20px", margin:"25px"}}>
      <h3>Andra online!</h3>
        {userList.map((u, i) => (
          u.startsWith("Lärare") ? (
          <div key={i} style={{ color: "darkred" }}>
            <div style={{display: "flex", justifyContent:"start", textAlign: "left"}}>
            <div style={{backgroundColor: "green", borderRadius:"10px", height:"7px", width: "7px", margin: "9px"}}></div>
              {u}
            </div>
          </div>
          ):(
          <div key={i} style={{ color: "black" }}>
            <div style={{display: "flex", justifyContent:"start", textAlign: "left"}}>
            <div style={{backgroundColor: "green", borderRadius:"10px", height:"7px", width: "7px", margin: "9px"}}></div>
              {u}
            </div>
          </div>
          )
        ))}

    </div>
  </div>
);
}
export default App;
