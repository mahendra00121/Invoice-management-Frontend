"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Mic, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  widgetType?: "OVERDUE" | "SALES" | null;
  widgetData?: any;
};

export function Chatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const defaultMsg: Message = { id: "1", text: "Namaste! 🙏 Main aapka Smart AI Assistant hu. Aap mujhse Hindi, English ya Hinglish me kaam karwa sakte hain. Jaise: 'Naya bill bana do' ya 'Pending udhaar dikhao'.", sender: "bot" };
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0 });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("vyapaar_chat_history");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([defaultMsg]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      localStorage.setItem("vyapaar_chat_history", JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isLoaded]);

  const playSound = () => {
    try {
      // Use MP3 format instead of OGG for better browser support
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 0.3;
      const playPromise = audio.play();
      
      // Handle the asynchronous play promise to prevent unhandled rejections
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Audio play blocked or unsupported:", error);
        });
      }
    } catch (e) {
      console.warn("Failed to create audio", e);
    }
  };

  const clearChat = () => {
    setMessages([defaultMsg]);
    localStorage.removeItem("vyapaar_chat_history");
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = { startX: e.clientX - position.x, startY: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Maaf karna bhai, aapka browser voice command support nahi karta. Google Chrome use karein!');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Better for Hindi/Hinglish
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      sendCommand(transcript);
    };
    
    recognition.start();
  };

  const sendCommand = (cmdText: string) => {
    setInput(cmdText);
    setTimeout(() => {
      const formEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSend(formEvent, cmdText);
    }, 100);
  };

  const handleSend = (e: React.FormEvent, overrideText?: string) => {
    e.preventDefault();
    const finalInput = overrideText || input;
    if (!finalInput.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: finalInput, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    if (!overrideText) setInput("");
    setIsTyping(true);

    // Smart Multi-lingual Intent Matching Logic
    setTimeout(() => {
      setIsTyping(false);
      playSound();
      let botResponse = "Maaf karna bhai, main samjha nahi. Aap try karein: 'Naya invoice banao' ya 'Dashboard dikhao'.";
      let botWidgetType: "OVERDUE" | "SALES" | null = null;
      let botWidgetData: any = null;
      const text = userMsg.text.toLowerCase();

      // Intent 1: Create Invoice
      if (text.match(/bill bana|create invoice|naya invoice|make bill|make invoice/i)) {
        botResponse = "Bilkul! Main Invoices form open kar raha hu... 📄";
        if (window.location.pathname !== '/invoices') {
          router.push('/invoices');
          setTimeout(() => window.dispatchEvent(new CustomEvent('BOT_ACTION_CREATE_INVOICE')), 800);
        } else {
          window.dispatchEvent(new CustomEvent('BOT_ACTION_CREATE_INVOICE'));
        }
      } 
      // Intent 1.5: View Invoices
      else if (text.match(/invoice dikha|bill dikha|show invoices/i)) {
        botResponse = "Main aapko Invoices page par le jaa raha hu. Wahan aap purane bill dekh sakte hain.";
        router.push('/invoices');
      }
      // Intent 2: View Pending / Overdue (WITH DATA QUERY)
      else if (text.match(/baki|pending|overdue|udhaar|udhar|due|kiska baki|paise lene/i)) {
        try {
          const invData = JSON.parse(localStorage.getItem("invoice_management_invoices") || "[]");
          const overdueBills = invData.filter((inv: any) => inv.balanceAmount > 0);
          // Sort by highest balance
          overdueBills.sort((a: any, b: any) => b.balanceAmount - a.balanceAmount);
          const totalDue = overdueBills.reduce((sum: number, inv: any) => sum + inv.balanceAmount, 0);
          
          if (totalDue > 0) {
            botResponse = `Bhai, market me aapka total ₹${totalDue.toLocaleString("en-IN")} baaki hai (${overdueBills.length} bills me). 💰`;
            botWidgetType = "OVERDUE";
            botWidgetData = {
              bills: overdueBills.slice(0, 3),
              remainingCount: Math.max(0, overdueBills.length - 3)
            };
          } else {
            botResponse = "Waah bhai! Market me aapka koi udhaar baaki nahi hai. Sab zero hai. 🎉";
          }
        } catch(e) {
          botResponse = "Theek hai bhai, main aapko Invoices section me le jaa raha hu jaha aap udhaar dekh sakte hain.";
        }
      } 
      // Intent 3: Quotations / Estimates
      else if (text.match(/quote bana|create quote|naya estimate|make quotation|send quotation/i)) {
        botResponse = "Ji haan! Main naya Quotation banane ka form khol raha hu. 📝";
        if (window.location.pathname !== '/quotations') {
          router.push('/quotations');
          setTimeout(() => window.dispatchEvent(new CustomEvent('BOT_ACTION_CREATE_QUOTATION')), 800);
        } else {
          window.dispatchEvent(new CustomEvent('BOT_ACTION_CREATE_QUOTATION'));
        }
      }
      else if (text.match(/quote|quotation|estimate|bhav|rate/i)) {
        botResponse = "Quotation (Estimate) ka page khol raha hu.";
        router.push('/quotations');
      } 
      // Intent 4: Dashboard / Sales / Performance (WITH DATA QUERY)
      else if (text.match(/sales|sale|dashboard|kamai|profit|total|kamaai|hisaab/i)) {
        try {
          const invData = JSON.parse(localStorage.getItem("invoice_management_invoices") || "[]");
          const totalSales = invData.reduce((sum: number, inv: any) => sum + (inv.grandTotal || 0), 0);
          const totalPaid = invData.reduce((sum: number, inv: any) => sum + (inv.paidAmount || 0), 0);
          const totalPending = totalSales - totalPaid;
          
          botResponse = `Yahan lijiye aapka Quick Hisaab! 📈 Aapki total aamdani (Sales) ₹${totalSales.toLocaleString("en-IN")} hui hai.`;
          botWidgetType = "SALES";
          botWidgetData = { totalPaid, totalPending };
        } catch(e) {
          botResponse = "Aapki aaj tak ki total aamdani aur business ki report main Dashboard par khol raha hu. 📈";
          router.push('/dashboard');
        }
      } 
      // Intent 4.5: Change Theme / Color
      else if (text.match(/color|colour|theme|background|kala|neela|laal|safed/i)) {
        let newColor = null;
        if (text.match(/black|kala|kaala/i)) newColor = "#09090b";
        else if (text.match(/white|safed/i)) newColor = "#ffffff";
        else if (text.match(/red|laal/i)) newColor = "#ef4444";
        else if (text.match(/blue|neela/i)) newColor = "#3b82f6";
        else if (text.match(/green|hara/i)) newColor = "#22c55e";
        else if (text.match(/purple|violet|baingani/i)) newColor = "#a855f7";
        else if (text.match(/dark/i)) newColor = "#0f172a";

        if (newColor) {
           botResponse = "Bilkul bhai! Lo maine turant aapke hisaab se theme ka color change kar diya. 🎨";
           localStorage.setItem("sidebar_color", newColor);
           window.dispatchEvent(new Event("sidebar_color_changed"));
        } else {
           botResponse = "Color ka naam theek se samajh nahi aaya. Aap 'black', 'blue', 'red' ya 'green' likh kar try karein.";
        }
      }
      // Intent 5: Payments & Receipts
      else if (text.match(/payment|paisa|pauti|receipt|kist|paise aaye/i)) {
        botResponse = "Payment record karne ya Pauti (Receipt) print karne ke liye Invoices page khol raha hu. Kisi bhi bill ke aage 💰 icon par click kijiye.";
        router.push('/invoices');
      } 
      // Intent 6: Products & Stock
      else if (text.match(/product|stock|item|maal|inventory/i)) {
        botResponse = "Aapke saare products aur stock ki list khol raha hu. Yahan se aap stock check ya update kar sakte hain. 📦";
        router.push('/products');
      }
      // Intent 7: Customers / Parties
      else if (text.match(/customer|party|client|log/i)) {
        botResponse = "Aapke saare customers aur parties ki list open kar raha hu. 👥";
        router.push('/customers');
      }
      // Greetings
      else if (text.match(/hello|hi|namaste|aur bhai|kya haal/i)) {
        botResponse = "Namaste bhai! Main theek hu. Batayiye aaj main aapki kya madad karu? Aap mujhe bill banane ya udhaar check karne ko keh sakte hain.";
      }

      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: botResponse, 
        sender: "bot", 
        widgetType: botWidgetType,
        widgetData: botWidgetData 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-[100] ${isOpen ? "bg-rose-500 hover:bg-rose-600 rotate-90" : "bg-indigo-600 hover:bg-indigo-700 hover:scale-110"}`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 w-[350px] h-[500px] max-h-[80vh] bg-card border border-border shadow-2xl rounded-2xl flex flex-col z-[100] animate-in slide-in-from-bottom-5"
          style={{ transform: `translate(${position.x}px, ${position.y}px)`, transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}
        >
          {/* Header */}
          <div 
            className="p-4 border-b border-border bg-indigo-600 rounded-t-2xl flex items-center justify-between cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="pointer-events-none">
                <h3 className="font-bold text-white leading-tight">Vyapaar AI</h3>
                <p className="text-indigo-100 text-xs">Aapka Smart Assistant</p>
              </div>
            </div>
            <button 
              onClick={clearChat}
              className="text-xs text-indigo-100 hover:text-white px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
              title="Clear Chat History"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 relative">
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-4">
                <button onClick={() => sendCommand("Naya bill banao")} className="text-xs bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-500 hover:text-white transition-colors">📄 Naya Bill Banao</button>
                <button onClick={() => sendCommand("Kiska udhaar baaki hai?")} className="text-xs bg-rose-500/10 text-rose-600 border border-rose-500/20 px-3 py-1.5 rounded-full hover:bg-rose-500 hover:text-white transition-colors">💰 Kiska Udhaar Baaki Hai</button>
                <button onClick={() => sendCommand("Total kamai kitni hui")} className="text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1.5 rounded-full hover:bg-emerald-500 hover:text-white transition-colors">📈 Total Kamai</button>
                <button onClick={() => sendCommand("Theme dark kar do")} className="text-xs bg-slate-800/10 text-slate-800 dark:text-slate-200 border border-slate-500/20 px-3 py-1.5 rounded-full hover:bg-slate-800 hover:text-white transition-colors">🌙 Dark Theme</button>
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-indigo-600 text-white rounded-br-none" 
                    : "bg-background border border-border text-foreground rounded-bl-none shadow-sm"
                }`}>
                  {msg.text}
                  
                  {/* Render OVERDUE Widget */}
                  {msg.widgetType === "OVERDUE" && msg.widgetData && (
                    <div className="mt-2 space-y-1.5 border-t border-border pt-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Top Pending Payments:</p>
                      {msg.widgetData.bills.map((inv: any) => (
                        <div key={inv.id} className="flex justify-between items-center text-xs bg-muted/50 border border-border p-2 rounded-lg">
                          <div className="flex flex-col">
                            <span className="font-semibold truncate max-w-[100px]">{inv.customerName}</span>
                            <span className="text-rose-500 font-bold font-mono">₹{inv.balanceAmount.toLocaleString("en-IN")}</span>
                          </div>
                          <button 
                            onClick={() => window.open(`https://wa.me/91${inv.customerPhone?.replace(/[^0-9]/g, '')}?text=Namaste ${inv.contactPerson || inv.customerName},%0AAapka ₹${inv.balanceAmount} ka payment pending hai (Invoice: ${inv.invoiceNumber}). Kripya jald se jald clear karein.🙏`, '_blank')}
                            className="p-1.5 bg-[#25D366]/10 text-[#25D366] rounded-md hover:bg-[#25D366] hover:text-white transition-colors"
                            title="Send WhatsApp Reminder"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {msg.widgetData.remainingCount > 0 && <p className="text-[10px] text-center text-muted-foreground mt-1">+{msg.widgetData.remainingCount} more bills</p>}
                    </div>
                  )}

                  {/* Render SALES Widget */}
                  {msg.widgetType === "SALES" && msg.widgetData && (
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-center">
                        <p className="text-[10px] uppercase font-bold text-emerald-600 mb-0.5">Cash Recv</p>
                        <p className="text-xs font-black text-emerald-600">₹{msg.widgetData.totalPaid.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl text-center">
                        <p className="text-[10px] uppercase font-bold text-rose-600 mb-0.5">Market Due</p>
                        <p className="text-xs font-black text-rose-600">₹{msg.widgetData.totalPending.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-background border border-border rounded-2xl rounded-bl-none shadow-sm p-4 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card rounded-b-2xl">
            <form onSubmit={handleSend} className="flex gap-2">
              <button 
                type="button"
                onClick={startListening}
                className={`h-10 w-10 ${isListening ? 'bg-rose-500 animate-pulse text-white' : 'bg-muted text-muted-foreground hover:bg-indigo-100 hover:text-indigo-600'} rounded-xl flex items-center justify-center transition-colors shrink-0`}
                title="Speak to Assistant"
              >
                <Mic className="w-4 h-4" />
              </button>
              <input
                type="text"
                placeholder="Type or speak..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 h-10 px-3 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-w-0"
              />
              <button 
                type="submit"
                disabled={!input.trim() && !isListening}
                className="h-10 w-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
