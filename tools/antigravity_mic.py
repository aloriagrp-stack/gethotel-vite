"""
Antigravity Floating Voice Transcription Widget
Records speech, transcribes via Google Web Speech (Hindi/Hinglish/English),
copies to clipboard and pastes directly into Antigravity Chat.
"""

import tkinter as tk
from tkinter import ttk
import threading
import sounddevice as sd
import numpy as np
import wave
import io
import time
import speech_recognition as sr
import win32clipboard
import win32con
import win32com.client

class AntigravityMicApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Antigravity Mic")
        self.root.geometry("260x100")
        self.root.attributes("-topmost", True)
        self.root.attributes("-alpha", 0.96)
        self.root.configure(bg="#18181b")
        self.root.overrideredirect(False)
        self.root.resizable(False, False)

        self.is_recording = False
        self.audio_frames = []
        self.samplerate = 16000
        self.stream = None
        self.recognizer = sr.Recognizer()

        # Language selection: Hindi-English mix (Hinglish) or Pure English
        self.lang_var = tk.StringVar(value="hi-IN")

        # Title Label
        self.title_label = tk.Label(
            root,
            text="Antigravity Voice Mic 🎙️",
            font=("Segoe UI", 9, "bold"),
            bg="#18181b",
            fg="#a1a1aa"
        )
        self.title_label.pack(pady=(6, 2))

        # Status / Transcribed Text preview
        self.status_label = tk.Label(
            root,
            text="Click Mic to Speak...",
            font=("Segoe UI", 8),
            bg="#18181b",
            fg="#71717a",
            wraplength=240
        )
        self.status_label.pack(pady=(0, 6))

        # Bottom Frame for Buttons
        btn_frame = tk.Frame(root, bg="#18181b")
        btn_frame.pack(fill="x", padx=10)

        # Record / Stop Button
        self.mic_btn = tk.Button(
            btn_frame,
            text="🎙️ Start Speaking",
            font=("Segoe UI", 9, "bold"),
            bg="#2563eb",
            fg="#ffffff",
            activebackground="#1d4ed8",
            activeforeground="#ffffff",
            relief="flat",
            padx=12,
            pady=4,
            cursor="hand2",
            command=self.toggle_recording
        )
        self.mic_btn.pack(side="left", expand=True, fill="x", padx=(0, 5))

        # Language Toggle Button
        self.lang_btn = tk.Button(
            btn_frame,
            text="Hinglish",
            font=("Segoe UI", 8),
            bg="#27272a",
            fg="#e4e4e7",
            activebackground="#3f3f46",
            activeforeground="#ffffff",
            relief="flat",
            padx=6,
            pady=4,
            cursor="hand2",
            command=self.toggle_language
        )
        self.lang_btn.pack(side="right")

    def toggle_language(self):
        if self.lang_var.get() == "hi-IN":
            self.lang_var.set("en-IN")
            self.lang_btn.config(text="English")
        else:
            self.lang_var.set("hi-IN")
            self.lang_btn.config(text="Hinglish")

    def toggle_recording(self):
        if not self.is_recording:
            self.start_recording()
        else:
            self.stop_and_transcribe()

    def start_recording(self):
        self.is_recording = True
        self.audio_frames = []
        self.mic_btn.config(text="⏹️ Stop & Paste", bg="#dc2626")
        self.status_label.config(text="Listening... Bolna shuru karein 🔴", fg="#ef4444")

        def audio_callback(indata, frames, time_info, status):
            if self.is_recording:
                self.audio_frames.append(indata.copy())

        self.stream = sd.InputStream(
            samplerate=self.samplerate,
            channels=1,
            dtype='int16',
            callback=audio_callback
        )
        self.stream.start()

    def stop_and_transcribe(self):
        self.is_recording = False
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None

        self.mic_btn.config(text="⏳ Transcribing...", bg="#d97706")
        self.status_label.config(text="Transcribing voice...", fg="#f59e0b")

        threading.Thread(target=self._process_transcription, daemon=True).start()

    def _process_transcription(self):
        if not self.audio_frames:
            self._update_ui("Koi aawaz nahi suni gayi.", "#71717a")
            return

        try:
            recording_data = np.concatenate(self.audio_frames, axis=0)
            wav_io = io.BytesIO()
            with wave.open(wav_io, 'wb') as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(self.samplerate)
                wf.writeframes(recording_data.tobytes())

            wav_io.seek(0)
            with sr.AudioFile(wav_io) as source:
                audio = self.recognizer.record(source)

            # Recognize using Google Web Speech (Free & accurate for Hindi / Hinglish / English)
            lang = self.lang_var.get()
            text = self.recognizer.recognize_google(audio, language=lang)

            # Copy to clipboard
            win32clipboard.OpenClipboard()
            win32clipboard.EmptyClipboard()
            win32clipboard.SetClipboardText(text, win32con.CF_UNICODETEXT)
            win32clipboard.CloseClipboard()

            # Automatically paste into the active window (e.g. Antigravity chat prompt)
            time.sleep(0.15)
            try:
                shell = win32com.client.Dispatch("WScript.Shell")
                shell.SendKeys("^v")
            except Exception:
                pass

            display_preview = text if len(text) <= 35 else text[:32] + "..."
            self._update_ui(f"Pasted: \"{display_preview}\" ✅", "#22c55e")

        except sr.UnknownValueError:
            self._update_ui("Voice samajh nahi aayi, dobara bole.", "#ef4444")
        except Exception as e:
            self._update_ui(f"Error: {str(e)[:30]}", "#ef4444")

    def _update_ui(self, msg, color):
        def _apply():
            self.status_label.config(text=msg, fg=color)
            self.mic_btn.config(text="🎙️ Start Speaking", bg="#2563eb")
        self.root.after(0, _apply)

if __name__ == "__main__":
    root = tk.Tk()
    app = AntigravityMicApp(root)
    root.mainloop()
