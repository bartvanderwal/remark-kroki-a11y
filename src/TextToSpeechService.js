/**
 * TextToSpeechService
 * 
 * Provides text-to-speech functionality for diagram descriptions using the Web Speech API.
 * Allows users to have diagram descriptions read aloud by the browser.
 */

class TextToSpeechService {
  constructor(options = {}) {
    this.options = {
      rate: options.rate || 0.9, // Slightly slower for clarity
      pitch: options.pitch || 1.0,
      volume: options.volume || 1.0,
      language: options.language || 'en-US',
    };

    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
  }

  /**
	 * Check if the browser supports Web Speech API
	 * @returns {boolean}
	 */
  static isSupported() {
    return !!(
      window.speechSynthesis &&
			(window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance)
    );
  }

  /**
	 * Set the language for speech synthesis
	 * @param {string} lang - Language code (e.g., 'en-US', 'nl-NL')
	 */
  setLanguage(lang) {
    this.options.language = lang;
  }

  /**
	 * Read text aloud
	 * @param {string} text - The text to read
	 * @param {Object} callbacks - Callback functions
	 * @param {Function} callbacks.onStart - Called when speech starts
	 * @param {Function} callbacks.onEnd - Called when speech ends
	 * @param {Function} callbacks.onError - Called on error
	 */
  speak(text, callbacks = {}) {
    if (!TextToSpeechService.isSupported()) {
      console.warn('Text-to-speech not supported in this browser');
      return false;
    }

    // Cancel any ongoing speech
    this.stop();

    this.currentUtterance = new (window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance)(text);
    this.currentUtterance.lang = this.options.language;
    this.currentUtterance.rate = this.options.rate;
    this.currentUtterance.pitch = this.options.pitch;
    this.currentUtterance.volume = this.options.volume;

    this.currentUtterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      if (callbacks.onStart) callbacks.onStart();
    };

    this.currentUtterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      if (callbacks.onEnd) callbacks.onEnd();
    };

    this.currentUtterance.onerror = (event) => {
      this.isPlaying = false;
      this.isPaused = false;
      if (callbacks.onError) callbacks.onError(event);
    };

    this.currentUtterance.onpause = () => {
      this.isPaused = true;
    };

    this.currentUtterance.onresume = () => {
      this.isPaused = false;
    };

    window.speechSynthesis.speak(this.currentUtterance);
    return true;
  }

  /**
	 * Pause current speech
	 */
  pause() {
    if (this.isPlaying && !this.isPaused) {
      window.speechSynthesis.pause();
      this.isPaused = true;
    }
  }

  /**
	 * Resume paused speech
	 */
  resume() {
    if (this.isPlaying && this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
    }
  }

  /**
	 * Stop speech and clear
	 */
  stop() {
    window.speechSynthesis.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
  }

  /**
	 * Check if currently speaking
	 * @returns {boolean}
	 */
  isSpeaking() {
    return this.isPlaying;
  }

  /**
	 * Check if currently paused
	 * @returns {boolean}
	 */
  isPausedState() {
    return this.isPaused;
  }

  /**
	 * Read text from a DOM element
	 * @param {HTMLElement} element - Element containing text to read
	 * @param {Object} callbacks - Callback functions
	 */
  speakElement(element, callbacks = {}) {
    if (!element) {
      console.warn('Element not found');
      return false;
    }
    const text = element.textContent || element.innerText;
    return this.speak(text, callbacks);
  }
}

export default TextToSpeechService;
