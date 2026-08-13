// Notification & Audio Alert Utility for ADHIKAR Legal Consultations

export function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied' as NotificationPermission);
  }
  if (Notification.permission === 'granted') {
    return Promise.resolve('granted' as NotificationPermission);
  }
  return Notification.requestPermission();
}

export function playAlertChime() {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play a gentle double chime (E5 -> A5)
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playNote(659.25, 0, 0.4); // E5
    playNote(880.00, 0.2, 0.6); // A5
  } catch (e) {
    // Audio context disallowed before user interaction
  }
}

export function triggerBrowserNotification(title: string, body: string, iconUrl?: string) {
  playAlertChime();
  
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: iconUrl || '/favicon.ico',
        tag: 'adhikar-consultation-reminder'
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
}
