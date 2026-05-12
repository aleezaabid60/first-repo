'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your RWU Platform AI assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error: any) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsPDF = async (content: string, role: string) => {
    // Dynamically import html2canvas to avoid SSR issues if necessary, but we can assume client-side
    const html2canvas = (await import('html2canvas')).default;
    
    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    
    // Format markdown to basic HTML
    const formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');

    tempContainer.innerHTML = `
      <div style="width: 800px; padding: 60px; background: white; color: #1a1a1a; font-family: 'Arial', sans-serif; border-top: 15px solid #0052cc; box-sizing: border-box;">
        
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 25px; margin-bottom: 35px;">
          <h1 style="color: #0052cc; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 1px;">RAWALPINDI WOMEN UNIVERSITY</h1>
          <p style="color: #4b5563; margin: 8px 0 0 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">Advanced Academic Management System</p>
        </div>

        <!-- Meta Info -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 14px; color: #4b5563;">
          <div>
            <strong>Date Issued:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br/>
            <strong>Time:</strong> ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style="text-align: right;">
            <strong>Ref No:</strong> RWU-SYS-${Math.floor(Math.random() * 90000) + 10000}<br/>
            <strong>Type:</strong> Official Notification
          </div>
        </div>

        <!-- Body -->
        <div style="font-size: 15px; line-height: 1.8; color: #1f2937; min-height: 400px;">
          ${formattedContent}
        </div>

        <!-- Footer / Signatures -->
        <div style="margin-top: 80px; display: flex; justify-content: space-between; padding-top: 30px;">
          <div style="text-align: center; width: 250px;">
            <div style="border-bottom: 1px solid #1f2937; margin-bottom: 12px; height: 40px;">
              <span style="color: #0052cc; font-family: 'Brush Script MT', cursive; font-size: 24px; opacity: 0.7;">AI System Generated</span>
            </div>
            <strong style="font-size: 14px; color: #1f2937;">System Administrator</strong><br/>
            <span style="font-size: 12px; color: #6b7280;">RWU Academic Platform</span>
          </div>
          
          <div style="text-align: center; width: 250px;">
            <div style="border-bottom: 1px solid #1f2937; margin-bottom: 12px; height: 40px;"></div>
            <strong style="font-size: 14px; color: #1f2937;">Approved By</strong><br/>
            <span style="font-size: 12px; color: #6b7280;">Head of Department</span>
          </div>
        </div>
        
        <!-- Bottom watermark/footer text -->
        <div style="margin-top: 60px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 15px;">
          This is an electronically generated document from the RWU Academic Management System and does not require a physical signature if digitally verified.
        </div>
      </div>
    `;
    
    document.body.appendChild(tempContainer);
    
    // Allow DOM to update
    await new Promise(resolve => setTimeout(resolve, 150));
    
    try {
      const canvas = await html2canvas(tempContainer.firstElementChild as HTMLElement, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RWU_Official_Notification_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[400px] h-[550px] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl"
            style={{ background: 'var(--popover)' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">RWU AI Assistant</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-chart-3 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar"
            >
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-secondary/20' : 'bg-primary/20'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-secondary" /> : <Bot className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className={`p-3 rounded-2xl text-sm prose prose-invert max-w-full ${
                        msg.role === 'user' 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white/5 text-foreground rounded-tl-none border border-white/10'
                      }`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      {msg.role === 'assistant' && idx !== 0 && (
                        <button
                          onClick={() => downloadAsPDF(msg.content, msg.role)}
                          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors mt-1 ml-1"
                        >
                          <Download className="w-3 h-3" />
                          Download as PDF Notification
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about the platform or draft a notification..."
                  className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-destructive text-white' : 'bg-primary text-white'
        }`}
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </motion.button>
    </div>
  );
}
