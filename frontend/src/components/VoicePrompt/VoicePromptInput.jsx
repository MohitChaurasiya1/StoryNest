import React, { useEffect } from 'react';
import { 
  FaMicrophone, 
  FaStop, 
  FaExclamationTriangle, 
  FaVolumeUp, 
  FaTimes,
  FaMagic
} from 'react-icons/fa';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import './VoicePromptInput.css';

export default function VoicePromptInput({ 
  value = '', 
  onChange, 
  placeholder = "Click the microphone and speak your story idea naturally, or type here..." 
}) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  } = useSpeechRecognition();

  // Combine final + live interim speech so words appear instantly as spoken
  const liveText = isListening 
    ? [transcript, interimTranscript].filter(Boolean).join(' ') 
    : value;

  // Stream live speech results up to parent component
  useEffect(() => {
    if (isListening) {
      const combined = [transcript, interimTranscript].filter(Boolean).join(' ');
      if (combined) {
        onChange(combined);
      }
    }
  }, [transcript, interimTranscript, isListening, onChange]);

  // Sync final transcript when listening finishes
  useEffect(() => {
    if (!isListening && transcript) {
      onChange(transcript);
    }
  }, [isListening, transcript, onChange]);

  // Keep internal transcript synced if parent clears or updates value manually
  useEffect(() => {
    if (value !== transcript && !isListening) {
      setTranscript(value);
    }
  }, [value, isListening, setTranscript]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleTextChange = (e) => {
    const newVal = e.target.value;
    setTranscript(newVal);
    onChange(newVal);
  };

  return (
    <div className={`voice-prompt-container ${isListening ? 'is-listening' : ''}`}>
      {/* Header Bar */}
      <div className="voice-header-row">
        <div className="voice-title-group">
          <FaMagic className="voice-title-icon" />
          <h3 className="voice-title-text">Voice & Custom Prompt</h3>
        </div>

        {isListening && (
          <div className="listening-badge">
            <span className="listening-pulse-dot"></span>
            <span>Listening... Speak now!</span>
          </div>
        )}
      </div>

      {/* Error Notification */}
      {error && (
        <div className="voice-error-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaExclamationTriangle style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
          <button className="voice-error-dismiss" onClick={() => resetTranscript(value)} title="Dismiss">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Input Area with Integrated Mic Button */}
      <div className="voice-input-wrapper">
        <textarea
          className="voice-textarea"
          value={liveText}
          onChange={handleTextChange}
          placeholder={placeholder}
          rows={4}
        />

        <button
          type="button"
          className={`mic-toggle-btn ${isListening ? 'recording' : ''}`}
          onClick={handleMicClick}
          disabled={!isSupported}
          title={
            !isSupported 
              ? 'Speech recognition is not supported in this browser' 
              : isListening 
                ? 'Click to stop listening' 
                : 'Click to speak your prompt'
          }
        >
          {isListening ? <FaStop /> : <FaMicrophone />}
        </button>
      </div>

      {/* Waveform animation during active recording */}
      {isListening && (
        <div className="audio-waveform">
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
        </div>
      )}

      {/* Interim Transcript Live Display */}
      {isListening && interimTranscript && (
        <div className="interim-preview">
          <strong>Hearing:</strong> "{interimTranscript}"
        </div>
      )}

      {/* Browser Incompatibility Notice */}
      {!isSupported && (
        <div className="voice-helper-text" style={{ color: '#dc2626' }}>
          <FaExclamationTriangle />
          Speech recognition is not supported in this browser. You can still type your prompt manually above!
        </div>
      )}

      {/* Helper Tip */}
      {isSupported && !isListening && (
        <div className="voice-helper-text">
          <FaVolumeUp style={{ color: '#8b5cf6' }} />
          Tip: Tap the microphone, speak your story plot (e.g. <em>"A brave golden puppy saved the village"</em>), and Gemini will craft the full bilingual story!
        </div>
      )}
    </div>
  );
}
