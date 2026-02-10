// Simple event emitter for profile picture updates
type Listener = (profilePicture: string | null) => void;

class ProfilePictureEventEmitter {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(profilePicture: string | null) {
    this.listeners.forEach(listener => listener(profilePicture));
  }
}

export const profilePictureEvents = new ProfilePictureEventEmitter();
